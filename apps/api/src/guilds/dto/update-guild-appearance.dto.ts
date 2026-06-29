import { ApiProperty } from "@nestjs/swagger";
import { IsIn, IsString, Matches } from "class-validator";
import { GuildThemeColor } from "../schemas/guild.schema";

/** Payload accepted when updating a guild's visual identity. */
export class UpdateGuildAppearanceDto {
  /** Selected guild theme color. */
  @ApiProperty({ enum: ["black", "blue", "green", "pink", "purple", "red", "white"], example: "blue" })
  @IsIn(["black", "blue", "green", "pink", "purple", "red", "white"])
  themeColor!: GuildThemeColor;

  /** Bundled emblem asset path matching the selected color family. */
  @ApiProperty({ example: "/assets/imgs/flags/blue/crest_121_17_08_40_r1_c1.png" })
  @IsString()
  @Matches(/^\/assets\/imgs\/flags\/(black|blue|green|pink|purple|red|white)\/[A-Za-z0-9_.-]+\.png$/)
  emblemUrl!: string;

  /** Bundled guild hero background asset path. */
  @ApiProperty({ example: "/assets/imgs/gbg/01_radiant_alpine_castle.png" })
  @IsString()
  @Matches(/^\/assets\/imgs\/gbg\/[A-Za-z0-9_.-]+\.png$/)
  backgroundUrl!: string;
}
