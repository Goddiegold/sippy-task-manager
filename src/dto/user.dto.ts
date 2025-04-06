import {
  IsString,
  MaxLength,
  MinLength
} from 'class-validator';

export class CreateUserDTO {
  @IsString()
  name: string;

  @IsString()
  email: string;

  @IsString()
  @MinLength(8)
  @MaxLength(50)
  password: string;
}
