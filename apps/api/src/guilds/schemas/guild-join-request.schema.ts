import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Schema as MongooseSchema, Types } from "mongoose";
import { UserAccount } from "../../users/schemas/user-account.schema";
import { Guild } from "./guild.schema";

export type GuildJoinRequestStatus = "pending" | "accepted" | "rejected";

export type GuildJoinRequestDocument = HydratedDocument<GuildJoinRequest>;

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class GuildJoinRequest {
  @Prop({ ref: Guild.name, required: true, type: MongooseSchema.Types.ObjectId })
  guildId!: Types.ObjectId;

  @Prop({ ref: UserAccount.name, required: true, type: MongooseSchema.Types.ObjectId })
  userId!: Types.ObjectId;

  @Prop({ default: "pending", enum: ["pending", "accepted", "rejected"], required: true })
  status!: GuildJoinRequestStatus;

  @Prop({ default: null, ref: UserAccount.name, type: MongooseSchema.Types.ObjectId })
  decidedBy!: Types.ObjectId | null;

  @Prop({ default: null, type: Date })
  decidedAt!: Date | null;

  createdAt!: Date;
}

export const GuildJoinRequestSchema = SchemaFactory.createForClass(GuildJoinRequest);

GuildJoinRequestSchema.index({ guildId: 1, status: 1, createdAt: -1 });
GuildJoinRequestSchema.index({ guildId: 1, userId: 1, status: 1 });
