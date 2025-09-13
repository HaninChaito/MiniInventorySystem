// Corrected src/prisma/prisma.service.ts

import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';


type PrismaClientOptions = ConstructorParameters<typeof PrismaClient>[0];

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  
  constructor(options?: PrismaClientOptions) {
    super(options);
  }

  async onModuleInit() {
    await this.$connect();
  }
}