import { IsEmail, IsString, MinLength } from "class-validator";

/** Credentials accepted by the login endpoint. */
export class LoginDto {
  /** Email address used as the account identifier. */
  @IsEmail()
  email!: string;

  /** Plain password submitted for verification. */
  @IsString()
  @MinLength(8)
  password!: string;
}
