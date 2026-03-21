import { Module } from '@nestjs/common';
import { PRISMA_CLIENT } from './prisma.constants';
import { PrismaService } from './prisma.service';

@Module({
  providers: [
    PrismaService,
    {
      provide: PRISMA_CLIENT,
      useExisting: PrismaService,
    },
  ],
  exports: [PRISMA_CLIENT, PrismaService],
})
export class PrismaModule {}
