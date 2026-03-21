import { Module } from '@nestjs/common';
import { ApiConfigModule } from './config/api-config.module';
import { AdminUsersModule } from './modules/admin-users/admin-users.module';
import { AuthModule } from './modules/auth/auth.module';
import { HealthModule } from './modules/health/health.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { OrdersModule } from './modules/orders/orders.module';
import { ProductsModule } from './modules/products/products.module';

@Module({
  imports: [
    ApiConfigModule,
    HealthModule,
    AuthModule,
    AdminUsersModule,
    ProductsModule,
    InventoryModule,
    OrdersModule,
    NotificationsModule,
  ],
})
export class AppModule {}
