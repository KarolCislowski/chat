import { IsMongoId } from "class-validator";

export class InviteGuildMemberDto {
  @IsMongoId()
  userId!: string;
}
