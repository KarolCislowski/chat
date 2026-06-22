import { IsMongoId } from "class-validator";

/** Payload accepted when inviting a user directly into a guild. */
export class InviteGuildMemberDto {
  /** Account ID of the user being invited. */
  @IsMongoId()
  userId!: string;
}
