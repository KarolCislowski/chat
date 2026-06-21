import { IsIn } from "class-validator";
import { GuildRole } from "../schemas/guild-membership.schema";

export class UpdateGuildMemberRoleDto {
  @IsIn(["officer", "member"])
  role!: Exclude<GuildRole, "owner">;
}
