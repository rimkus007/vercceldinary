import { Injectable, ExecutionContext, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerOptions, ThrottlerStorage } from '@nestjs/throttler';
import { ThrottlerLimitDetail } from '@nestjs/throttler';
import { Reflector } from '@nestjs/core';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  constructor(
    @Inject() options: ThrottlerOptions[],
    @Inject() storageService: ThrottlerStorage,
    @Inject() reflector: Reflector,
  ) {
    super(options, storageService, reflector);
  }

  protected async throwThrottlingException(): Promise<void> {
    throw new HttpException(
      {
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
        message: 'Too many requests',
        error: 'ThrottlerException',
        retryAfter: 60,
      },
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    
    // Ajouter headers CORS pour les erreurs de rate limiting
    response.header('X-RateLimit-Limit', '100');
    response.header('X-RateLimit-Remaining', '0');
    response.header('X-RateLimit-Reset', new Date(Date.now() + 60000).toISOString());
    
    return super.canActivate(context);
  }
}
