// src/users/users.module.ts
import { Module, forwardRef } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AdminModule } from '../admin/admin.module';
import { GamificationModule } from 'src/gamification/gamification.module'; // <-- AJOUTEZ CETTE LIGNE

@Module({
  imports: [
    PrismaModule,
    forwardRef(() => AdminModule),
    GamificationModule, // <-- ET CETTE LIGNE DANS LES IMPORTS
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
