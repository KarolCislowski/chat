import { IsIn, IsOptional, IsString, Matches, MaxLength } from "class-validator";
import { OnlineStatus, UiLanguage } from "../schemas/user-profile.schema";

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(80)
  displayName?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\/assets\/imgs\/avatars\/[A-Za-z0-9_.-]+\.png$/)
  avatarUrl?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  statusMessage?: string;

  @IsOptional()
  @IsIn(["offline", "online", "away", "busy"])
  onlineStatus?: OnlineStatus;

  @IsOptional()
  @IsIn(["en", "sv", "pl"])
  language?: UiLanguage;
}
