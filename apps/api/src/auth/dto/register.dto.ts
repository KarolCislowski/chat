import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, MaxLength, MinLength } from "class-validator";

/** Payload accepted by the registration endpoint. */
export class RegisterDto {
  /** Email address for the new account. */
  @ApiProperty({ example: "karol@example.com" })
  @IsEmail()
  email!: string;

  /** Plain password that will be hashed before persistence. */
  @ApiProperty({ example: "Senbonzakura69", maxLength: 128, minLength: 8 })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;

  /** Initial public display name for the user profile. */
  @ApiProperty({ example: "Karol", maxLength: 80, minLength: 2 })
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  displayName!: string;
}
