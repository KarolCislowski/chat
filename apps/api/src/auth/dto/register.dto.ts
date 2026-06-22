import { IsEmail, IsString, MaxLength, MinLength } from "class-validator";

/** Payload accepted by the registration endpoint. */
export class RegisterDto {
  /** Email address for the new account. */
  @IsEmail()
  email!: string;

  /** Plain password that will be hashed before persistence. */
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;

  /** Initial public display name for the user profile. */
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  displayName!: string;
}
