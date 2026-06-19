import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Schema as MongooseSchema, Types } from "mongoose";
import { UserAccount } from "../../users/schemas/user-account.schema";

export type GuildDocument = HydratedDocument<Guild>;

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class Guild {
  @Prop({ maxlength: 80, required: true, trim: true })
  name!: string;

  @Prop({ lowercase: true, required: true, trim: true, unique: true })
  slug!: string;

  @Prop({ ref: UserAccount.name, required: true, type: MongooseSchema.Types.ObjectId })
  ownerId!: Types.ObjectId;

  @Prop({ default: [], ref: UserAccount.name, type: [MongooseSchema.Types.ObjectId] })
  members!: Types.ObjectId[];

  @Prop({ default: [], type: [String] })
  inviteCodes!: string[];

  createdAt!: Date;
}

export const GuildSchema = SchemaFactory.createForClass(Guild);

GuildSchema.index({ ownerId: 1, createdAt: -1 });
