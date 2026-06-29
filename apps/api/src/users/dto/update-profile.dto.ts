import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsIn, IsOptional, IsString, Matches, MaxLength } from "class-validator";
import { OnlineStatus, UiLanguage } from "../schemas/user-profile.schema";

/** Partial payload accepted by the current user's profile update endpoint. */
export class UpdateProfileDto {
  /** Public display name shown in chats and profile previews. */
  @ApiPropertyOptional({ example: "Karol", maxLength: 80 })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  displayName?: string;

  /** Bundled avatar asset path selected by the user. */
  @ApiPropertyOptional({ example: "/assets/imgs/avatars/avatar_001_14_14_38_r1_c1.png", nullable: true })
  @IsOptional()
  @IsString()
  @Matches(/^\/assets\/imgs\/avatars\/[A-Za-z0-9_.-]+\.png$/)
  avatarUrl?: string | null;

  /** Short public status message shown on profiles. */
  @ApiPropertyOptional({ example: "I am a dwarf and I'm digging a hole...", maxLength: 160 })
  @IsOptional()
  @IsString()
  @MaxLength(160)
  statusMessage?: string;

  /** User-selected or realtime online status. */
  @ApiPropertyOptional({ enum: ["offline", "online", "away", "busy"], example: "online" })
  @IsOptional()
  @IsIn(["offline", "online", "away", "busy"])
  onlineStatus?: OnlineStatus;

  /** Preferred UI language. */
  @ApiPropertyOptional({ enum: ["en", "sv", "pl"], example: "pl" })
  @IsOptional()
  @IsIn(["en", "sv", "pl"])
  language?: UiLanguage;
}
