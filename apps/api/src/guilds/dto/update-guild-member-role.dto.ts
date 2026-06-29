import { ApiProperty } from "@nestjs/swagger";
import { IsIn } from "class-validator";
import { GuildRole } from "../schemas/guild-membership.schema";

/** Payload accepted when changing a non-owner guild member role. */
export class UpdateGuildMemberRoleDto {
  /** New role assigned by the guild owner. */
  @ApiProperty({ enum: ["officer", "member"], example: "officer" })
  @IsIn(["officer", "member"])
  role!: Exclude<GuildRole, "owner">;
}
