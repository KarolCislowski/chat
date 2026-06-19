import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Message, MessageDocument } from "./schemas/message.schema";

type CreateGlobalMessageInput = {
  content: string;
  senderId: string;
};

@Injectable()
export class MessagesService {
  constructor(@InjectModel(Message.name) private readonly messageModel: Model<MessageDocument>) {}

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

    return this.toMessageResponse(message);
  }

  async getGlobalMessages(limit = 50) {
    const safeLimit = Math.min(Math.max(limit, 1), 100);
    const messages = await this.messageModel.find({ channelType: "global", deletedAt: null }).sort({ createdAt: -1 }).limit(safeLimit).exec();

    return messages.reverse().map((message) => this.toMessageResponse(message));
  }

  toMessageResponse(message: MessageDocument) {
    return {
      _id: message.id,
      senderId: message.senderId.toString(),
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
