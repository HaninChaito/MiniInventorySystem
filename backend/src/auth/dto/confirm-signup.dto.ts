import { IsEmail, IsString, IsNotEmpty } from 'class-validator';
export class ConfirmSignUpDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  code: string;
}