import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, MinLength } from "class-validator";

/** Credentials accepted by the login endpoint. */
export class LoginDto {
  /** Email address used as the account identifier. */
  @ApiProperty({ example: "karol@example.com" })
  @IsEmail()
  email!: string;

  /** Plain password submitted for verification. */
  @ApiProperty({ example: "Senbonzakura69", minLength: 8 })
  @IsString()
  @MinLength(8)
  password!: string;
}
