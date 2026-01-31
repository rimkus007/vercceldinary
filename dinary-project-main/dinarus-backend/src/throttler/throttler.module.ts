import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requêtes par minute
      },
      {
        name: 'auth',
        ttl: 900000, // 15 minutes
        limit: 5, // 5 tentatives de connexion par IP
      },
      {
        name: 'upload',
        ttl: 60000, // 1 minute
        limit: 10, // 10 uploads par minute
      },
    ]),
  ],
  exports: [ThrottlerModule],
})
export class CustomThrottlerModule {}
