import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { UsersService } from '../users/users.service';

@Injectable()
export class UpdateUserActivityMiddleware implements NestMiddleware {
  constructor(private readonly usersService: UsersService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // L'objet 'user' est attaché à la requête par notre garde d'authentification (JwtAuthGuard)
    const user = (req as any).user;

    if (user && user.id) {
      // On met à jour l'activité en arrière-plan pour ne pas ralentir la requête
      this.usersService.updateActivity(user.id).catch((err) => {
        void 0;
      });
    }

    next(); // Passe à la suite du traitement de la requête
  }
}
