// src/identity/identity.module.ts
import { Module } from '@nestjs/common';
import { IdentityService } from './identity.service';
import { IdentityController } from './identity.controller'; // Correction du chemin/nom

@Module({
  controllers: [IdentityController],
  providers: [IdentityService],
})
export class IdentityModule {}
