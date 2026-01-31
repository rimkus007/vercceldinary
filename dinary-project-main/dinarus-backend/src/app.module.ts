// src/app.module.ts
import {
  Module,
  NestModule,
  MiddlewareConsumer,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { MerchantsModule } from './merchants/merchants.module';
import { RequestsModule } from './requests/requests.module';
import { WalletModule } from './wallet/wallet.module';
import { GamificationModule } from './gamification/gamification.module';
import { AdminModule } from './admin/admin.module';
import { ProductsModule } from './products/products.module';
import { NotificationsModule } from './notifications/notifications.module';
import { FriendsModule } from './friends/friends.module';
import { IdentityModule } from './identity/identity.module';
import { TicketsModule } from './tickets/tickets.module';
import { CommissionsModule } from './commissions/commissions.module';
import { UpdateUserActivityMiddleware } from './middleware/update-user-activity.middleware';
import { VerificationArchivesModule } from './verification-archives/verification-archives.module';
import { ReferralModule } from './referral/referral.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // 🔒 SÉCURITÉ: Rate Limiting pour prévenir les attaques par force brute
    ThrottlerModule.forRoot([{
      ttl: 60000, // 60 secondes
      limit: 100,  // 100 requêtes max par minute (général)
    }]),
    PrismaModule,
    UsersModule,
    AuthModule,
    MerchantsModule,
    RequestsModule,
    WalletModule,
    GamificationModule,
    AdminModule,
    ProductsModule,
    NotificationsModule,
    FriendsModule,
    IdentityModule,
    TicketsModule,
    CommissionsModule,
    VerificationArchivesModule,
    ReferralModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // 🔒 SÉCURITÉ: Throttler DÉSACTIVÉ TEMPORAIREMENT pour connexion
    // {
    //   provide: APP_GUARD,
    //   useClass: ThrottlerGuard,
    // },
  ],
})
// La correction cruciale est d'implémenter NestModule
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(UpdateUserActivityMiddleware).forRoutes('*'); // Applique le middleware à TOUTES les routes
  }
}
