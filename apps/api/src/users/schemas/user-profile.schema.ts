import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Schema as MongooseSchema, Types } from "mongoose";
import { UserAccount } from "./user-account.schema";

export type OnlineStatus = "offline" | "online" | "away" | "busy";

export type UserProfileDocument = HydratedDocument<UserProfile>;

@Schema({ timestamps: true })
export class UserProfile {
  @Prop({ ref: UserAccount.name, required: true, type: MongooseSchema.Types.ObjectId, unique: true })
  accountId!: Types.ObjectId;

  @Prop({ maxlength: 80, required: true, trim: true })
  displayName!: string;

  @Prop({ default: null, trim: true })
  avatarUrl!: string | null;

  @Prop({ default: "", maxlength: 160, trim: true })
  statusMessage!: string;

  @Prop({ default: "offline", enum: ["offline", "online", "away", "busy"], required: true })
  onlineStatus!: OnlineStatus;

  createdAt!: Date;
  updatedAt!: Date;
}

export const UserProfileSchema = SchemaFactory.createForClass(UserProfile);
