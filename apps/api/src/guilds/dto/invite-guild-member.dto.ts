import { ApiProperty } from "@nestjs/swagger";
import { IsMongoId } from "class-validator";

/** Payload accepted when inviting a user directly into a guild. */
export class InviteGuildMemberDto {
  /** Account ID of the user being invited. */
  @ApiProperty({ example: "667f1f77bcf86cd799439011" })
  @IsMongoId()
  userId!: string;
}
