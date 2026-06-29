import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsIn, IsOptional, IsString, Matches, MaxLength, MinLength } from "class-validator";
import { GuildThemeColor } from "../schemas/guild.schema";

/** Payload accepted when creating a guild. */
export class CreateGuildDto {
  /** Public guild name. */
  @ApiProperty({ example: "Knights of Dawn", maxLength: 80, minLength: 3 })
  @IsString()
  @MinLength(3)
  @MaxLength(80)
  name!: string;

  /** Optional initial guild theme color. */
  @ApiPropertyOptional({ enum: ["black", "blue", "green", "pink", "purple", "red", "white"], example: "blue" })
  @IsOptional()
  @IsIn(["black", "blue", "green", "pink", "purple", "red", "white"])
  themeColor?: GuildThemeColor;

  /** Optional bundled emblem asset path matching the selected color family. */
  @ApiPropertyOptional({ example: "/assets/imgs/flags/blue/crest_121_17_08_40_r1_c1.png" })
  @IsOptional()
  @IsString()
  @Matches(/^\/assets\/imgs\/flags\/(black|blue|green|pink|purple|red|white)\/[A-Za-z0-9_.-]+\.png$/)
  emblemUrl?: string;

  /** Optional bundled guild hero background asset path. */
  @ApiPropertyOptional({ example: "/assets/imgs/gbg/01_radiant_alpine_castle.png" })
  @IsOptional()
  @IsString()
  @Matches(/^\/assets\/imgs\/gbg\/[A-Za-z0-9_.-]+\.png$/)
  backgroundUrl?: string;
}
