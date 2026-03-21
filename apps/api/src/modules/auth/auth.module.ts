import { Module } from '@nestjs/common';
import { AdminUsersModule } from '../admin-users/admin-users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PasswordHashingService } from './password-hashing.service';

@Module({
  imports: [AdminUsersModule],
  controllers: [AuthController],
  providers: [AuthService, PasswordHashingService],
  exports: [AuthService, PasswordHashingService],
})
export class AuthModule {}
