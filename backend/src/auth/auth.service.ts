import { Injectable, InternalServerErrorException, ConflictException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  CognitoIdentityProviderClient,
  SignUpCommand,
  ConfirmSignUpCommand,
  InitiateAuthCommand,
  AdminAddUserToGroupCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { SignUpDto } from './dto/signup.dto';
import { SignInDto } from './dto/signin.dto';
import { ConfirmSignUpDto } from './dto/confirm-signup.dto';

@Injectable()
export class AuthService {
    private readonly cognitoClient: CognitoIdentityProviderClient;

  constructor(private configService: ConfigService) {
    this.cognitoClient = new CognitoIdentityProviderClient({ // No extra brackets here
      region: this.configService.get<string>('AWS_COGNITO_REGION')!, // Add '!'
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID')!, // Add '!'
        secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY')!, // Add '!'
      },
    });
  }

  async signUp(signUpDto: SignUpDto): Promise<{ username: string }> {
    const { email, password } = signUpDto;
    const clientId = this.configService.get<string>('AWS_COGNITO_APP_CLIENT_ID');
    const userPoolId = this.configService.get<string>('AWS_COGNITO_USER_POOL_ID');

    try {
      const command = new SignUpCommand({
        ClientId: clientId,
        Username: email,
        Password: password,
        UserAttributes: [{ Name: 'email', Value: email }],
      });
      await this.cognitoClient.send(command);

      // Add user to the default 'Users' group after they sign up
      const groupCommand = new AdminAddUserToGroupCommand({
        GroupName: 'Users',
        UserPoolId: userPoolId,
        Username: email,
      });
      await this.cognitoClient.send(groupCommand);

      return { username: email };
    } catch (error) {
      if (error.name === 'UsernameExistsException') {
        throw new ConflictException('An account with this email already exists.');
      }
      throw new InternalServerErrorException(error.message);
    }
  }

  async confirmSignUp(confirmSignUpDto: ConfirmSignUpDto): Promise<{ message: string }> {
    const { email, code } = confirmSignUpDto;
    const clientId = this.configService.get<string>('AWS_COGNITO_APP_CLIENT_ID');

    const command = new ConfirmSignUpCommand({
      ClientId: clientId,
      Username: email,
      ConfirmationCode: code,
    });

    try {
      await this.cognitoClient.send(command);
      return { message: 'Account confirmed successfully.' };
    } catch (error) {
       throw new UnauthorizedException('Invalid confirmation code or email.');
    }
  }

  // src/auth/auth.service.ts

async signIn(signInDto: SignInDto): Promise<{ accessToken: string; idToken: string; refreshToken: string }> {
    const { email, password } = signInDto;
    const clientId = this.configService.get<string>('AWS_COGNITO_APP_CLIENT_ID')!;
    const userPoolId = this.configService.get<string>('AWS_COGNITO_USER_POOL_ID')!;

    const command = new InitiateAuthCommand({
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId: clientId,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
      },
    });

    try {
      const { AuthenticationResult } = await this.cognitoClient.send(command);
      
      // Check for the result and all the tokens within it
      if (AuthenticationResult && AuthenticationResult.AccessToken && AuthenticationResult.IdToken && AuthenticationResult.RefreshToken) {
        return {
          accessToken: AuthenticationResult.AccessToken,
          idToken: AuthenticationResult.IdToken,
          refreshToken: AuthenticationResult.RefreshToken,
        };
      } else {
        // If the result is missing or doesn't contain tokens, it's a failure.
        throw new UnauthorizedException('Authentication failed: Tokens not returned.');
      }
    } catch (error) {
      // This will now catch both SDK errors (like wrong password) and our manually thrown error.
      // You can check the original error if you need more specific messages.
      if (error instanceof UnauthorizedException) {
          throw error; // Re-throw our specific error
      }
      // For Cognito errors, provide a generic message.
      throw new UnauthorizedException('Invalid credentials or user not confirmed.');
    }
}
}