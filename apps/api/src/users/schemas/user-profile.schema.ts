import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Schema as MongooseSchema, Types } from "mongoose";
import { UserAccount } from "./user-account.schema";

/** Presence values exposed to chat clients. */
export type OnlineStatus = "offline" | "online" | "away" | "busy";

/** Supported UI language preference values. */
export type UiLanguage = "en" | "sv" | "pl";

/** Hydrated Mongo document for a user profile. */
export type UserProfileDocument = HydratedDocument<UserProfile>;

@Schema({ timestamps: true })
/** Persistent public profile attached one-to-one to a user account. */
export class UserProfile {
  @Prop({ ref: UserAccount.name, required: true, type: MongooseSchema.Types.ObjectId, unique: true })
  accountId!: Types.ObjectId;

  @Prop({ maxlength: 80, required: true, trim: true })
  displayName!: string;

  @Prop({ default: null, trim: true, type: String })
  avatarUrl!: string | null;

  @Prop({ default: "", maxlength: 160, trim: true })
  statusMessage!: string;

  @Prop({ default: "offline", enum: ["offline", "online", "away", "busy"], required: true })
  onlineStatus!: OnlineStatus;

  @Prop({ default: "en", enum: ["en", "sv", "pl"], required: true })
  language!: UiLanguage;

  createdAt!: Date;
  updatedAt!: Date;
}

/** Mongoose schema for user profile documents. */
export const UserProfileSchema = SchemaFactory.createForClass(UserProfile);
