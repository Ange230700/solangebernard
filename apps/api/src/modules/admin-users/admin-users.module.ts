import { Module } from '@nestjs/common';
import { PrismaModule } from '../../persistence/prisma.module';
import { AdminUsersRepository } from './admin-users.repository';
import { AdminUsersService } from './admin-users.service';

@Module({
  imports: [PrismaModule],
  providers: [AdminUsersRepository, AdminUsersService],
  exports: [AdminUsersService],
})
export class AdminUsersModule {}
