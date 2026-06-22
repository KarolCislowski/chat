import { IsIn, IsMongoId, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

/** Realtime message creation payload accepted by the chat websocket. */
export class CreateGlobalMessageDto {
  /** Destination channel type; defaults to global when omitted. */
  @IsOptional()
  @IsIn(["global", "guild", "whisper"])
  channelType?: "global" | "guild" | "whisper";

  /** Guild ID required when channelType is guild. */
  @IsOptional()
  @IsMongoId()
  guildId?: string;

  /** Recipient account ID required when channelType is whisper. */
  @IsOptional()
  @IsMongoId()
  recipientId?: string;

  /** Message text after client-side composition. */
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  content!: string;
}
