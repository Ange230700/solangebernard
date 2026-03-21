import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client';
import { ApiConfigService } from '../config/api-config.service';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  constructor(apiConfig: ApiConfigService) {
    const adapter = new PrismaPg({
      connectionString: apiConfig.databaseUrl,
    });

    super({ adapter });
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
