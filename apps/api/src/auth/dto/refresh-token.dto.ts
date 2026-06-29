import { ApiProperty } from "@nestjs/swagger";
import { IsString, MinLength } from "class-validator";

/** Payload accepted by the refresh-token endpoint. */
export class RefreshTokenDto {
  /** Raw refresh token previously issued by the API. */
  @ApiProperty({ minLength: 20 })
  @IsString()
  @MinLength(20)
  refreshToken!: string;
}
