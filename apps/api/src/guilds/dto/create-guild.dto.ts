import { IsIn, IsOptional, IsString, Matches, MaxLength, MinLength } from "class-validator";
import { GuildThemeColor } from "../schemas/guild.schema";

export class CreateGuildDto {
  @IsString()
  @MinLength(3)
  @MaxLength(80)
  name!: string;

  @IsOptional()
  @IsIn(["black", "blue", "green", "pink", "purple", "red", "white"])
  themeColor?: GuildThemeColor;

  @IsOptional()
  @IsString()
  @Matches(/^\/assets\/imgs\/flags\/(black|blue|green|pink|purple|red|white)\/[A-Za-z0-9_.-]+\.png$/)
  emblemUrl?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\/assets\/imgs\/gbg\/[A-Za-z0-9_.-]+\.png$/)
  backgroundUrl?: string;
}
