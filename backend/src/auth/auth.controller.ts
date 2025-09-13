import { Body, Controller, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/signup.dto';
import { SignInDto } from './dto/signin.dto';
import { ConfirmSignUpDto } from './dto/confirm-signup.dto';
import { Public } from './public.decorator'; // <-- Import the decorator
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('/signup')
  @UsePipes(ValidationPipe)
  signUp(@Body() signUpDto: SignUpDto): Promise<{ username: string }> {
    return this.authService.signUp(signUpDto);
  }

  @Public()
  @Post('/confirm-signup')
  @UsePipes(ValidationPipe)
  confirmSignUp(@Body() confirmSignUpDto: ConfirmSignUpDto): Promise<{ message: string }> {
    return this.authService.confirmSignUp(confirmSignUpDto);
  }

    @Public()
  @Post('/signin')
  @UsePipes(ValidationPipe)
  signIn(@Body() signInDto: SignInDto): Promise<{ accessToken: string; idToken: string; refreshToken: string }> {
    return this.authService.signIn(signInDto);
  }
}