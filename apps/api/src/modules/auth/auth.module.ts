import { Module } from '@nestjs/common';
import { AdminUsersModule } from '../admin-users/admin-users.module';
import { AuthGuard } from './auth.guard';
import { AuthController } from './auth.controller';
import { AuthSessionsRepository } from './auth-sessions.repository';
import { AuthSessionsService } from './auth-sessions.service';
import { AuthService } from './auth.service';
import { PasswordHashingService } from './password-hashing.service';
import { PrismaModule } from '../../persistence/prisma.module';

@Module({
  imports: [AdminUsersModule, PrismaModule],
  controllers: [AuthController],
  providers: [
    AuthGuard,
    AuthSessionsRepository,
    AuthSessionsService,
    AuthService,
    PasswordHashingService,
  ],
  exports: [
    AuthGuard,
    AuthSessionsService,
    AuthService,
    PasswordHashingService,
  ],
})
export class AuthModule {}
