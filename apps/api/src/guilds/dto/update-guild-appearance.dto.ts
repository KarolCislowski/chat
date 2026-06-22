import { IsIn, IsString, Matches } from "class-validator";
import { GuildThemeColor } from "../schemas/guild.schema";

/** Payload accepted when updating a guild's visual identity. */
export class UpdateGuildAppearanceDto {
  /** Selected guild theme color. */
  @IsIn(["black", "blue", "green", "pink", "purple", "red", "white"])
  themeColor!: GuildThemeColor;

  /** Bundled emblem asset path matching the selected color family. */
  @IsString()
  @Matches(/^\/assets\/imgs\/flags\/(black|blue|green|pink|purple|red|white)\/[A-Za-z0-9_.-]+\.png$/)
  emblemUrl!: string;

  /** Bundled guild hero background asset path. */
  @IsString()
  @Matches(/^\/assets\/imgs\/gbg\/[A-Za-z0-9_.-]+\.png$/)
  backgroundUrl!: string;
}
