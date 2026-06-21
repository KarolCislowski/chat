import { IsIn, IsString, Matches } from "class-validator";
import { GuildThemeColor } from "../schemas/guild.schema";

export class UpdateGuildAppearanceDto {
  @IsIn(["black", "blue", "green", "pink", "purple", "red", "white"])
  themeColor!: GuildThemeColor;

  @IsString()
  @Matches(/^\/assets\/imgs\/flags\/(black|blue|green|pink|purple|red|white)\/[A-Za-z0-9_.-]+\.png$/)
  emblemUrl!: string;

  @IsString()
  @Matches(/^\/assets\/imgs\/gbg\/[A-Za-z0-9_.-]+\.png$/)
  backgroundUrl!: string;
}
