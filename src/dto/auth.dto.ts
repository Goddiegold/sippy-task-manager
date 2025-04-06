import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';


export class LoginInputDTO {
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(8)
  @IsNotEmpty()
  @MaxLength(50)
  password: string;
}
