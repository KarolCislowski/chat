import { IsBoolean, IsIn, IsMongoId, IsOptional } from "class-validator";

/** Realtime typing-state payload accepted by the chat websocket. */
export class TypingEventDto {
  /** Destination channel type receiving the typing indicator. */
  @IsIn(["global", "guild", "whisper"])
  channelType!: "global" | "guild" | "whisper";

  /** Guild ID required when channelType is guild. */
  @IsOptional()
  @IsMongoId()
  guildId?: string;

  /** Recipient account ID required when channelType is whisper. */
  @IsOptional()
  @IsMongoId()
  recipientId?: string;

  /** Whether the sender is actively typing. */
  @IsBoolean()
  isTyping!: boolean;
}
