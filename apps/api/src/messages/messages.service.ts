import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { GuildsService } from "../guilds/guilds.service";
import { UserProfile, UserProfileDocument } from "../users/schemas/user-profile.schema";
import { UsersService } from "../users/users.service";
import { Message, MessageDocument } from "./schemas/message.schema";

type CreateGlobalMessageInput = {
  content: string;
  senderId: string;
};

type CreateGuildMessageInput = CreateGlobalMessageInput & {
  guildId: string;
};

type CreateWhisperMessageInput = CreateGlobalMessageInput & {
  recipientId: string;
};

@Injectable()
export class MessagesService {
  constructor(
    private readonly guildsService: GuildsService,
    private readonly usersService: UsersService,
    @InjectModel(Message.name) private readonly messageModel: Model<MessageDocument>,
    @InjectModel(UserProfile.name) private readonly profileModel: Model<UserProfileDocument>,
  ) {}

  async createGlobalMessage(input: CreateGlobalMessageInput) {
    const content = input.content.trim();

    if (!content) {
      throw new BadRequestException("Message content cannot be empty.");
    }

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

  async createGuildMessage(input: CreateGuildMessageInput) {
    await this.guildsService.assertGuildMembership(input.senderId, input.guildId);

    const content = input.content.trim();

    if (!content) {
      throw new BadRequestException("Message content cannot be empty.");
    }

    const message = await this.messageModel.create({
      channelType: "guild",
      content,
      conversationId: null,
      guildId: new Types.ObjectId(input.guildId),
      recipientId: null,
      senderId: new Types.ObjectId(input.senderId),
    });

    return this.toMessageResponse(message, await this.getSenderByAccountId(message.senderId));
  }

  async createWhisperMessage(input: CreateWhisperMessageInput) {
    const conversationId = await this.getWhisperConversationId(input.senderId, input.recipientId);
    const content = input.content.trim();

    if (!content) {
      throw new BadRequestException("Message content cannot be empty.");
    }

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

  async getGlobalMessages(limit = 50) {
    const safeLimit = Math.min(Math.max(limit, 1), 100);
    const messages = await this.messageModel.find({ channelType: "global", deletedAt: null }).sort({ createdAt: -1 }).limit(safeLimit).exec();

    const orderedMessages = messages.reverse();
    const senderIds = [...new Set(orderedMessages.map((message) => message.senderId.toString()))];
    const profiles = await this.profileModel.find({ accountId: { $in: senderIds } }).exec();
    const sendersByAccountId = new Map(profiles.map((profile) => [profile.accountId.toString(), this.toSenderResponse(profile)]));

    return orderedMessages.map((message) => this.toMessageResponse(message, sendersByAccountId.get(message.senderId.toString()) ?? null));
  }

  async getGuildMessages(accountId: string, guildId: string, limit = 50) {
    await this.guildsService.assertGuildMembership(accountId, guildId);

    const safeLimit = Math.min(Math.max(limit, 1), 100);
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

  async getWhisperMessages(accountId: string, recipientId: string, limit = 50) {
    const conversationId = await this.getWhisperConversationId(accountId, recipientId);
    const safeLimit = Math.min(Math.max(limit, 1), 100);
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

  private async getSenderByAccountId(accountId: Types.ObjectId) {
    const profile = await this.profileModel.findOne({ accountId }).exec();
    return profile ? this.toSenderResponse(profile) : null;
  }

  private toSenderResponse(profile: UserProfileDocument) {
    return {
      id: profile.accountId.toString(),
      displayName: profile.displayName,
      avatarUrl: profile.avatarUrl,
      onlineStatus: profile.onlineStatus,
    };
  }

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
