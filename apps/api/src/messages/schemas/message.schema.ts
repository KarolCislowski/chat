import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Schema as MongooseSchema, Types } from "mongoose";
import { UserAccount } from "../../users/schemas/user-account.schema";

export type ChannelType = "global" | "guild" | "whisper";

export type MessageDocument = HydratedDocument<Message>;

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class Message {
  @Prop({ ref: UserAccount.name, required: true, type: MongooseSchema.Types.ObjectId })
  senderId!: Types.ObjectId;

  @Prop({ default: "global", enum: ["global", "guild", "whisper"], required: true })
  channelType!: ChannelType;

  @Prop({ default: null, type: MongooseSchema.Types.ObjectId })
  guildId!: Types.ObjectId | null;

  @Prop({ default: null, ref: UserAccount.name, type: MongooseSchema.Types.ObjectId })
  recipientId!: Types.ObjectId | null;

  @Prop({ default: null, trim: true, type: String })
  conversationId!: string | null;

  @Prop({ maxlength: 2000, required: true, trim: true })
  content!: string;

  @Prop({ default: null, type: Date })
  editedAt!: Date | null;

  @Prop({ default: null, type: Date })
  deletedAt!: Date | null;

  createdAt!: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);

MessageSchema.index({ channelType: 1, createdAt: -1 });
MessageSchema.index({ channelType: 1, conversationId: 1, createdAt: -1 });
