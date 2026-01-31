import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { RespondTicketDto } from './dto/respond-ticket.dto';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  // Créer un nouveau ticket
  @Post()
  create(@Request() req, @Body() createTicketDto: CreateTicketDto) {
    const userId = req.user.sub || req.user.userId;
    return this.ticketsService.create(userId, createTicketDto);
  }

  // Récupérer mes tickets
  @Get('my-tickets')
  findMyTickets(@Request() req) {
    const userId = req.user.sub || req.user.userId;
    return this.ticketsService.findByUser(userId);
  }

  // Récupérer un ticket spécifique
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ticketsService.findOne(id);
  }

  // Répondre à un ticket (utilisateur/marchand)
  @Post(':id/reply')
  replyToTicket(
    @Request() req,
    @Param('id') id: string,
    @Body('message') message: string,
  ) {
    const userId = req.user.sub || req.user.userId;
    return this.ticketsService.addUserReply(id, userId, message);
  }
}

