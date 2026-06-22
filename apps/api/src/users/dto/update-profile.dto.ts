import { IsIn, IsOptional, IsString, Matches, MaxLength } from "class-validator";
import { OnlineStatus, UiLanguage } from "../schemas/user-profile.schema";

/** Partial payload accepted by the current user's profile update endpoint. */
export class UpdateProfileDto {
  /** Public display name shown in chats and profile previews. */
  @IsOptional()
  @IsString()
  @MaxLength(80)
  displayName?: string;

  /** Bundled avatar asset path selected by the user. */
  @IsOptional()
  @IsString()
  @Matches(/^\/assets\/imgs\/avatars\/[A-Za-z0-9_.-]+\.png$/)
  avatarUrl?: string | null;

  /** Short public status message shown on profiles. */
  @IsOptional()
  @IsString()
  @MaxLength(160)
  statusMessage?: string;

  /** User-selected or realtime online status. */
  @IsOptional()
  @IsIn(["offline", "online", "away", "busy"])
  onlineStatus?: OnlineStatus;

  /** Preferred UI language. */
  @IsOptional()
  @IsIn(["en", "sv", "pl"])
  language?: UiLanguage;
}
