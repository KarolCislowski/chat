import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type UserRole = "user" | "admin";

export type UserAccountDocument = HydratedDocument<UserAccount>;

@Schema({ timestamps: true })
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

export const UserAccountSchema = SchemaFactory.createForClass(UserAccount);
