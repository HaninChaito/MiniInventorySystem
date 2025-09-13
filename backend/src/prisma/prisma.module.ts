// prisma.module.ts

import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { SecretsManagerModule } from '../secrets-manager.module';
import { SecretsManagerService } from '../secrets-manager.service';
import { PrismaClient } from '@prisma/client';

@Module({
  imports: [SecretsManagerModule], // Keep importing this
  providers: [
    {
      provide: PrismaService, // We are providing the PrismaService
      inject: [SecretsManagerService], // It depends on the SecretsManagerService
      // The factory function will run to create the instance
      useFactory: async (secretsManager: SecretsManagerService) => {
        const secret = await secretsManager.getSecret();
        const databaseUrl = `postgresql://postgres:BRlH%3A8B%3F~XiY2t%28acaQml42Elf4%3A@inventory-post.cihiscg6a6et.us-east-1.rds.amazonaws.com:5432/inventory-post`;

        // Create a new PrismaClient instance with the dynamic URL
        const prisma = new PrismaService({
          datasources: {
            db: {
              url: databaseUrl,
            },
          },
        });
        
        return prisma;
      },
    },
  ],
  exports: [PrismaService], // Export it so other modules can use it
})
export class PrismaModule {}