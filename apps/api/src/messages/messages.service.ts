import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { GuildsService } from "../guilds/guilds.service";
import { UserProfile, UserProfileDocument } from "../users/schemas/user-profile.schema";
import { UsersService } from "../users/users.service";
import { Message, MessageDocument } from "./schemas/message.schema";

const GLOBAL_MESSAGE_LIMIT = 200;
const GUILD_MESSAGE_LIMIT = 200;
const WHISPER_MESSAGE_LIMIT = 100;
const OPEN_MESSAGE_LIMIT = 200;
const MESSAGE_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 30;

/** Payload required to create a global chat message. */
type CreateGlobalMessageInput = {
  content: string;
  senderId: string;
};

/** Payload required to create a guild-scoped chat message. */
type CreateGuildMessageInput = CreateGlobalMessageInput & {
  guildId: string;
};

/** Payload required to create a private whisper message. */
type CreateWhisperMessageInput = CreateGlobalMessageInput & {
  recipientId: string;
};

@Injectable()
/** Coordinates message persistence, retention pruning, and response shaping. */
export class MessagesService {
  constructor(
    private readonly guildsService: GuildsService,
    private readonly usersService: UsersService,
    @InjectModel(Message.name) private readonly messageModel: Model<MessageDocument>,
    @InjectModel(UserProfile.name) private readonly profileModel: Model<UserProfileDocument>,
  ) {}

  /**
   * Creates a global message after pruning the global channel retention window.
   *
   * @param input - Sender and raw message content.
   * @returns Newly created message formatted for REST and websocket clients.
   */
  async createGlobalMessage(input: CreateGlobalMessageInput) {
    const content = input.content.trim();

    if (!content) {
      throw new BadRequestException("Message content cannot be empty.");
    }

    await this.pruneMessages({ channelType: "global" }, GLOBAL_MESSAGE_LIMIT);

    const message = await this.messageModel.create({
      channelType: "global",
      content,
      conversationId: null,
      guildId: null,
      recipientId: null,
      senderId: new Types.ObjectId(input.senderId),
    });

    return this.toMessageResponse(message, await this.getSenderByAccountId(message.senderId));
  }

  /**
   * Creates a guild message after verifying membership and pruning that guild channel.
   *
   * @param input - Sender, guild, and raw message content.
   * @returns Newly created message formatted for REST and websocket clients.
   */
  async createGuildMessage(input: CreateGuildMessageInput) {
    await this.guildsService.assertGuildMembership(input.senderId, input.guildId);

    const content = input.content.trim();

    if (!content) {
      throw new BadRequestException("Message content cannot be empty.");
    }

    const guildId = new Types.ObjectId(input.guildId);
    await this.pruneMessages({ channelType: "guild", guildId }, GUILD_MESSAGE_LIMIT);

    const message = await this.messageModel.create({
      channelType: "guild",
      content,
      conversationId: null,
      guildId,
      recipientId: null,
      senderId: new Types.ObjectId(input.senderId),
    });

    return this.toMessageResponse(message, await this.getSenderByAccountId(message.senderId));
  }

  /**
   * Creates a private whisper message between two distinct accounts.
   *
   * @param input - Sender, recipient, and raw message content.
   * @returns Newly created message formatted for REST and websocket clients.
   */
  async createWhisperMessage(input: CreateWhisperMessageInput) {
    const conversationId = await this.getWhisperConversationId(input.senderId, input.recipientId);
    const content = input.content.trim();

    if (!content) {
      throw new BadRequestException("Message content cannot be empty.");
    }

    await this.pruneMessages({ channelType: "whisper", conversationId }, WHISPER_MESSAGE_LIMIT);

    const message = await this.messageModel.create({
      channelType: "whisper",
      content,
      conversationId,
      guildId: null,
      recipientId: new Types.ObjectId(input.recipientId),
      senderId: new Types.ObjectId(input.senderId),
    });

    return this.toMessageResponse(message, await this.getSenderByAccountId(message.senderId));
  }

  /**
   * Lists recent global messages in chronological order.
   *
   * @param limit - Requested number of messages; clamped to the global channel limit.
   * @returns Recent global messages with sender summaries.
   */
  async getGlobalMessages(limit = 50) {
    await this.deleteExpiredMessages();

    const safeLimit = Math.min(Math.max(limit, 1), GLOBAL_MESSAGE_LIMIT);
    const messages = await this.messageModel.find({ channelType: "global", deletedAt: null }).sort({ createdAt: -1 }).limit(safeLimit).exec();

    const orderedMessages = messages.reverse();
    const senderIds = [...new Set(orderedMessages.map((message) => message.senderId.toString()))];
    const profiles = await this.profileModel.find({ accountId: { $in: senderIds } }).exec();
    const sendersByAccountId = new Map(profiles.map((profile) => [profile.accountId.toString(), this.toSenderResponse(profile)]));

    return orderedMessages.map((message) => this.toMessageResponse(message, sendersByAccountId.get(message.senderId.toString()) ?? null));
  }

  /**
   * Lists the aggregate open-chat feed visible to one account.
   *
   * @param accountId - Account requesting the aggregate feed.
   * @param limit - Requested number of messages; clamped to the open feed limit.
   * @returns Chronological messages from global, joined guilds, and personal whispers.
   */
  async getOpenMessages(accountId: string, limit = 100) {
    await this.deleteExpiredMessages();

    const safeLimit = Math.min(Math.max(limit, 1), OPEN_MESSAGE_LIMIT);
    const objectAccountId = new Types.ObjectId(accountId);
    const guildIds = (await this.guildsService.getGuildIdsForUser(accountId)).map((guildId) => new Types.ObjectId(guildId));
    const messages = await this.messageModel
      .find({
        deletedAt: null,
        $or: [
          { channelType: "global" },
          { channelType: "guild", guildId: { $in: guildIds } },
          {
            channelType: "whisper",
            $or: [{ senderId: objectAccountId }, { recipientId: objectAccountId }],
          },
        ],
      })
      .sort({ createdAt: -1 })
      .limit(safeLimit)
      .exec();

    const orderedMessages = messages.reverse();
    const senderIds = [...new Set(orderedMessages.map((message) => message.senderId.toString()))];
    const profiles = await this.profileModel.find({ accountId: { $in: senderIds } }).exec();
    const sendersByAccountId = new Map(profiles.map((profile) => [profile.accountId.toString(), this.toSenderResponse(profile)]));

    return orderedMessages.map((message) => this.toMessageResponse(message, sendersByAccountId.get(message.senderId.toString()) ?? null));
  }

  /**
   * Lists recent messages from a guild channel after membership verification.
   *
   * @param accountId - Account requesting guild messages.
   * @param guildId - Guild channel to read.
   * @param limit - Requested number of messages; clamped to the guild channel limit.
   * @returns Recent guild messages with sender summaries.
   */
  async getGuildMessages(accountId: string, guildId: string, limit = 50) {
    await this.guildsService.assertGuildMembership(accountId, guildId);
    await this.deleteExpiredMessages();

    const safeLimit = Math.min(Math.max(limit, 1), GUILD_MESSAGE_LIMIT);
    const messages = await this.messageModel
      .find({ channelType: "guild", deletedAt: null, guildId })
      .sort({ createdAt: -1 })
      .limit(safeLimit)
      .exec();

    const orderedMessages = messages.reverse();
    const senderIds = [...new Set(orderedMessages.map((message) => message.senderId.toString()))];
    const profiles = await this.profileModel.find({ accountId: { $in: senderIds } }).exec();
    const sendersByAccountId = new Map(profiles.map((profile) => [profile.accountId.toString(), this.toSenderResponse(profile)]));

    return orderedMessages.map((message) => this.toMessageResponse(message, sendersByAccountId.get(message.senderId.toString()) ?? null));
  }

  /**
   * Lists recent whisper messages between two accounts.
   *
   * @param accountId - Current account requesting the conversation.
   * @param recipientId - Other participant account ID.
   * @param limit - Requested number of messages; clamped to the whisper limit.
   * @returns Recent private messages with sender summaries.
   */
  async getWhisperMessages(accountId: string, recipientId: string, limit = 50) {
    const conversationId = await this.getWhisperConversationId(accountId, recipientId);
    await this.deleteExpiredMessages();

    const safeLimit = Math.min(Math.max(limit, 1), WHISPER_MESSAGE_LIMIT);
    const messages = await this.messageModel
      .find({ channelType: "whisper", conversationId, deletedAt: null })
      .sort({ createdAt: -1 })
      .limit(safeLimit)
      .exec();

    const orderedMessages = messages.reverse();
    const senderIds = [...new Set(orderedMessages.map((message) => message.senderId.toString()))];
    const profiles = await this.profileModel.find({ accountId: { $in: senderIds } }).exec();
    const sendersByAccountId = new Map(profiles.map((profile) => [profile.accountId.toString(), this.toSenderResponse(profile)]));

    return orderedMessages.map((message) => this.toMessageResponse(message, sendersByAccountId.get(message.senderId.toString()) ?? null));
  }

  /**
   * Finds all users that have an existing whisper conversation with an account.
   *
   * @param accountId - Account whose whisper peers should be returned.
   * @returns Profiles sorted by display name.
   */
  async getWhisperRecipientsForUser(accountId: string) {
    const objectAccountId = new Types.ObjectId(accountId);
    const messages = await this.messageModel
      .find({
        channelType: "whisper",
        deletedAt: null,
        $or: [{ senderId: objectAccountId }, { recipientId: objectAccountId }],
      })
      .sort({ createdAt: -1 })
      .exec();
    const recipientIds = [
      ...new Set(
        messages
          .map((message) => {
            if (message.senderId.toString() === accountId) {
              return message.recipientId?.toString() ?? null;
            }

            return message.senderId.toString();
          })
          .filter((recipientId) => recipientId !== null),
      ),
    ];

    return this.profileModel.find({ accountId: { $in: recipientIds } }).sort({ displayName: 1 }).exec();
  }

  /**
   * Builds a stable conversation ID for two accounts after validating the recipient.
   *
   * @param leftAccountId - One participant account ID.
   * @param rightAccountId - Other participant account ID.
   * @returns Stable conversation ID independent of sender direction.
   */
  private async getWhisperConversationId(leftAccountId: string, rightAccountId: string) {
    if (!Types.ObjectId.isValid(leftAccountId) || !Types.ObjectId.isValid(rightAccountId)) {
      throw new NotFoundException("Whisper recipient was not found.");
    }

    if (leftAccountId === rightAccountId) {
      throw new BadRequestException("You cannot whisper to yourself.");
    }

    const recipient = await this.usersService.findProfileByAccountId(rightAccountId);

    if (!recipient) {
      throw new NotFoundException("Whisper recipient was not found.");
    }

    return [leftAccountId, rightAccountId].sort().join(":");
  }

  /**
   * Deletes expired messages and then keeps room for one new message in a channel.
   *
   * @param channelFilter - Mongo filter that scopes the channel or conversation.
   * @param messageLimit - Maximum number of messages allowed after the next insert.
   * @returns A promise that resolves after pruning completes.
   */
  private async pruneMessages(channelFilter: Record<string, unknown>, messageLimit: number) {
    await this.deleteExpiredMessages();

    const newestMessagesToKeep = await this.messageModel
      .find(channelFilter)
      .sort({ createdAt: -1 })
      .select("_id")
      .limit(Math.max(messageLimit - 1, 0))
      .exec();
    const idsToKeep = newestMessagesToKeep.map((message) => message._id);

    await this.messageModel
      .deleteMany({
        ...channelFilter,
        _id: { $nin: idsToKeep },
      })
      .exec();
  }

  /**
   * Deletes messages older than the configured retention period.
   *
   * @returns A promise that resolves after expired messages are removed.
   */
  private async deleteExpiredMessages() {
    await this.messageModel.deleteMany({ createdAt: { $lt: new Date(Date.now() - MESSAGE_MAX_AGE_MS) } }).exec();
  }

  /**
   * Resolves the public sender payload for a message author.
   *
   * @param accountId - Author account ObjectId.
   * @returns Sender summary, or null when the profile no longer exists.
   */
  private async getSenderByAccountId(accountId: Types.ObjectId) {
    const profile = await this.profileModel.findOne({ accountId }).exec();
    return profile ? this.toSenderResponse(profile) : null;
  }

  /**
   * Converts a profile document into the sender shape embedded in messages.
   *
   * @param profile - User profile document.
   * @returns Sender summary for client rendering.
   */
  private toSenderResponse(profile: UserProfileDocument) {
    return {
      id: profile.accountId.toString(),
      displayName: profile.displayName,
      avatarUrl: profile.avatarUrl,
      onlineStatus: profile.onlineStatus,
    };
  }

  /**
   * Converts a message document into the API/websocket response shape.
   *
   * @param message - Message document from MongoDB.
   * @param sender - Optional sender summary resolved from the profile collection.
   * @returns Serializable message response consumed by the web app.
   */
  private toMessageResponse(message: MessageDocument, sender: ReturnType<MessagesService["toSenderResponse"]> | null) {
    return {
      _id: message.id,
      senderId: message.senderId.toString(),
      sender,
      channelType: message.channelType,
      guildId: message.guildId?.toString() ?? null,
      recipientId: message.recipientId?.toString() ?? null,
      conversationId: message.conversationId,
      content: message.content,
      createdAt: message.createdAt,
      editedAt: message.editedAt,
      deletedAt: message.deletedAt,
    };
  }
}
