import { IsIn, IsOptional, IsString, IsUrl, MaxLength } from "class-validator";
import { OnlineStatus, UiLanguage } from "../schemas/user-profile.schema";

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(80)
  displayName?: string;

  @IsOptional()
  @IsUrl({ require_protocol: true })
  avatarUrl?: string;

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
