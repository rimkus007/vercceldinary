import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import * as express from 'express';
import helmet from 'helmet';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ThrottlerGuard } from '@nestjs/throttler';

// 🔒 SÉCURITÉ: Vérification des variables d'environnement critiques
if (!process.env.JWT_SECRET) {
  throw new Error('❌ ERREUR CRITIQUE: JWT_SECRET manquante! L\'application ne peut pas démarrer.');
}
if (!process.env.ENCRYPTION_KEY) {
  throw new Error('❌ ERREUR CRITIQUE: ENCRYPTION_KEY manquante! L\'application ne peut pas démarrer.');
}
void 0;

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.setGlobalPrefix('api');

  // 🔒 SÉCURITÉ: Guard global de rate limiting (DÉSACTIVÉ TEMPORAIREMENT pour connexion)
// app.useGlobalGuards(app.get(ThrottlerGuard));

  // 🔒 SÉCURITÉ: Helmet pour headers HTTP sécurisés
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: [
            "'self'",
            'data:',
            'https:',
            'http://localhost:3001',
            'http://localhost:3000',
            'http://localhost:3002',
            'http://localhost:3003',
          ],
        },
      },
      // On désactive la politique restrictive par défaut qui provoque
      // les erreurs net::ERR_BLOCKED_BY_RESPONSE.NotSameOrigin
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      crossOriginEmbedderPolicy: false, // Nécessaire pour CORS
    }),
  );

  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads',
  });

  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3003',
      'http://localhost:3002',
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // 🔒 SÉCURITÉ: Validation stricte avec transformation et whitelist
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true, // Supprime les propriétés non définies dans le DTO
      forbidNonWhitelisted: true, // Rejette les requêtes avec propriétés non autorisées
      transformOptions: {
        enableImplicitConversion: false, // Force la validation explicite des types
      },
    }),
  );

  await app.listen(3001);
  void 0;
  void 0;
}
bootstrap();
