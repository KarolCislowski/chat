import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

/** Application-level account role. */
export type UserRole = "user" | "admin";

/** Hydrated Mongo document for a user account. */
export type UserAccountDocument = HydratedDocument<UserAccount>;

@Schema({ timestamps: true })
/** Persistent authentication account with refresh token hashes. */
export class UserAccount {
  @Prop({ lowercase: true, required: true, trim: true, unique: true })
  email!: string;

  @Prop({ required: true })
  passwordHash!: string;

  @Prop({ default: [], type: [String] })
  refreshTokens!: string[];

  @Prop({ default: "user", enum: ["user", "admin"], required: true })
  role!: UserRole;

  createdAt!: Date;
  updatedAt!: Date;
}

/** Mongoose schema for user account documents. */
export const UserAccountSchema = SchemaFactory.createForClass(UserAccount);
