import { IsIn, IsMongoId, IsOptional, IsString, MaxLength, MinLength } from "class-validator";

export class CreateGlobalMessageDto {
  @IsOptional()
  @IsIn(["global", "guild", "whisper"])
  channelType?: "global" | "guild" | "whisper";

  @IsOptional()
  @IsMongoId()
  guildId?: string;

  @IsOptional()
  @IsMongoId()
  recipientId?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  content!: string;
}
