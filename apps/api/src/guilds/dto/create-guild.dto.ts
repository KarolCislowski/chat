import { IsString, MaxLength, MinLength } from "class-validator";

export class CreateGuildDto {
  @IsString()
  @MinLength(3)
  @MaxLength(80)
  name!: string;
}
