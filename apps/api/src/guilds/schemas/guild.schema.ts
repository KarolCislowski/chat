import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Schema as MongooseSchema, Types } from "mongoose";
import { UserAccount } from "../../users/schemas/user-account.schema";

export type GuildDocument = HydratedDocument<Guild>;
export type GuildThemeColor = "black" | "blue" | "green" | "pink" | "purple" | "red" | "white";

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

  @Prop({ default: "red", enum: ["black", "blue", "green", "pink", "purple", "red", "white"], required: true })
  themeColor!: GuildThemeColor;

  @Prop({ default: "/assets/imgs/flags/red/crest_001_16_29_41_r1_c1.png", required: true, trim: true })
  emblemUrl!: string;

  createdAt!: Date;
}

export const GuildSchema = SchemaFactory.createForClass(Guild);

GuildSchema.index({ ownerId: 1, createdAt: -1 });
