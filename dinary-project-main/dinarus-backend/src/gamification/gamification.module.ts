import { Module, forwardRef } from '@nestjs/common';
import { GamificationService } from './gamification.service';
import { GamificationController } from './gamification.controller';
// import { AdminModule } from '../admin/admin.module'; // seulement si besoin (cf. circular)

@Module({
  // si pas de dépendance vers AdminModule, garde simplement []
  // si circular (Gamification ↔ Admin), utilise forwardRef:
  // imports: [forwardRef(() => AdminModule)],
  imports: [],
  providers: [GamificationService],
  controllers: [GamificationController],
  exports: [GamificationService], // ← IMPORTANT: exporter le service
})
export class GamificationModule {}
