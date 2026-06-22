import { IsIn, IsOptional, IsString, Matches, MaxLength, MinLength } from "class-validator";
import { GuildThemeColor } from "../schemas/guild.schema";

/** Payload accepted when creating a guild. */
export class CreateGuildDto {
  /** Public guild name. */
  @IsString()
  @MinLength(3)
  @MaxLength(80)
  name!: string;

  /** Optional initial guild theme color. */
  @IsOptional()
  @IsIn(["black", "blue", "green", "pink", "purple", "red", "white"])
  themeColor?: GuildThemeColor;

  /** Optional bundled emblem asset path matching the selected color family. */
  @IsOptional()
  @IsString()
  @Matches(/^\/assets\/imgs\/flags\/(black|blue|green|pink|purple|red|white)\/[A-Za-z0-9_.-]+\.png$/)
  emblemUrl?: string;

  /** Optional bundled guild hero background asset path. */
  @IsOptional()
  @IsString()
  @Matches(/^\/assets\/imgs\/gbg\/[A-Za-z0-9_.-]+\.png$/)
  backgroundUrl?: string;
}
