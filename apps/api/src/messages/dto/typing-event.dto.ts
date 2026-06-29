import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsIn, IsMongoId, IsOptional } from "class-validator";

/** Realtime typing-state payload accepted by the chat websocket. */
export class TypingEventDto {
  /** Destination channel type receiving the typing indicator. */
  @ApiProperty({ enum: ["global", "guild", "whisper"], example: "global" })
  @IsIn(["global", "guild", "whisper"])
  channelType!: "global" | "guild" | "whisper";

  /** Guild ID required when channelType is guild. */
  @ApiPropertyOptional({ example: "667f1f77bcf86cd799439011" })
  @IsOptional()
  @IsMongoId()
  guildId?: string;

  /** Recipient account ID required when channelType is whisper. */
  @ApiPropertyOptional({ example: "667f1f77bcf86cd799439012" })
  @IsOptional()
  @IsMongoId()
  recipientId?: string;

  /** Whether the sender is actively typing. */
  @ApiProperty({ example: true })
  @IsBoolean()
  isTyping!: boolean;
}
