// src/notifications/notifications.controller.ts
import {
  Controller,
  Get,
  UseGuards,
  Request,
  Patch, // 👈 Importez Patch
  Delete, // 👈 Importez Delete
  HttpCode, // 👈 Importez HttpCode pour un meilleur statut de réponse
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('notifications')
@UseGuards(AuthGuard('jwt'))
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  findAll(@Request() req) {
    // req.user.sub contient l'ID de l'utilisateur grâce à votre JwtStrategy
    return this.notificationsService.findAll(req.user.sub);
  }

  @Patch('read-all')
  @HttpCode(204) // 204 (No Content) est idéal pour une action qui réussit sans rien renvoyer
  markAllAsRead(@Request() req) {
    return this.notificationsService.markAllAsRead(req.user.sub);
  }

  @Delete('delete-all')
  @HttpCode(204)
  deleteAllForUser(@Request() req) {
    return this.notificationsService.deleteAllForUser(req.user.sub);
  }
}
