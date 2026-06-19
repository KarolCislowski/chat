import { IsString, Length } from "class-validator";

export class JoinGuildDto {
  @IsString()
  @Length(10, 32)
  inviteCode!: string;
}
