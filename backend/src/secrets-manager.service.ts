// secrets-manager.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

@Injectable()
export class SecretsManagerService {
  private client: SecretsManagerClient;
  private secretName: string;

  constructor(private configService: ConfigService) {
    this.client = new SecretsManagerClient({
      region: this.configService.get<string>('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID', { infer: true })!,
        secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY', { infer: true })!,
      },
    });

    this.secretName = this.configService.get<string>('AWS_SECRET_NAME')!;
  }

  async getSecret(): Promise<Record<string, string>> {
    const command = new GetSecretValueCommand({ SecretId: this.secretName });
    const response = await this.client.send(command);

    if (!response.SecretString) {
      throw new Error('SecretString is empty');
    }

    return JSON.parse(response.SecretString);
  }
}
