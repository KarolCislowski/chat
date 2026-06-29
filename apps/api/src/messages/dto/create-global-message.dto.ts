import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsIn, IsMongoId, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

/** Realtime message creation payload accepted by the chat websocket. */
export class CreateGlobalMessageDto {
  /** Destination channel type; defaults to global when omitted. */
  @ApiPropertyOptional({ enum: ["global", "guild", "whisper"], example: "global" })
  @IsOptional()
  @IsIn(["global", "guild", "whisper"])
  channelType?: "global" | "guild" | "whisper";

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

  /** Message text after client-side composition. */
  @ApiProperty({ example: "Ready for the raid tonight?", maxLength: 2000, minLength: 1 })
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  content!: string;
}
