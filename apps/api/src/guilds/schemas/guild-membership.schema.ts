import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Schema as MongooseSchema, Types } from "mongoose";
import { UserAccount } from "../../users/schemas/user-account.schema";
import { Guild } from "./guild.schema";

export type GuildRole = "owner" | "officer" | "member";

export type GuildMembershipDocument = HydratedDocument<GuildMembership>;

@Schema({ timestamps: { createdAt: "joinedAt", updatedAt: false } })
export class GuildMembership {
  @Prop({ ref: UserAccount.name, required: true, type: MongooseSchema.Types.ObjectId })
  userId!: Types.ObjectId;

  @Prop({ ref: Guild.name, required: true, type: MongooseSchema.Types.ObjectId })
  guildId!: Types.ObjectId;

  @Prop({ default: "member", enum: ["owner", "officer", "member"], required: true })
  role!: GuildRole;

  joinedAt!: Date;
}

export const GuildMembershipSchema = SchemaFactory.createForClass(GuildMembership);

GuildMembershipSchema.index({ userId: 1, guildId: 1 }, { unique: true });
GuildMembershipSchema.index({ guildId: 1, role: 1 });
