import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { TicketStatus } from '@prisma/client';

@Injectable()
export class TicketsService {
  constructor(private prisma: PrismaService) {}

  // Créer un nouveau ticket
  async create(userId: string, createTicketDto: CreateTicketDto) {
    const ticket = await this.prisma.supportTicket.create({
      data: {
        userId,
        subject: createTicketDto.subject,
        message: createTicketDto.message,
        category: createTicketDto.category || 'GENERAL',
        priority: createTicketDto.priority || 'NORMAL',
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return ticket;
  }

  // Récupérer tous les tickets d'un utilisateur
  async findByUser(userId: string) {
    return this.prisma.supportTicket.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            content: true,
            senderId: true,
            createdAt: true,
            read: true,
          },
        },
      },
    });
  }

  // Récupérer tous les tickets (pour l'admin)
  async findAll() {
    return this.prisma.supportTicket.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
            username: true,
          },
        },
        messages: {
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            content: true,
            senderId: true,
            createdAt: true,
            read: true,
          },
        },
      },
    });
  }

  // Compter le nombre de tickets ouverts (OPEN ou IN_PROGRESS)
  async getOpenTicketsCount() {
    const count = await this.prisma.supportTicket.count({
      where: {
        status: {
          in: [TicketStatus.OPEN, TicketStatus.IN_PROGRESS],
        },
      },
    });
    return { count };
  }

  // Récupérer un ticket par ID
  async findOne(id: string) {
    const ticket = await this.prisma.supportTicket.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
            username: true,
          },
        },
        messages: {
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            content: true,
            senderId: true,
            receiverId: true,
            fileUrl: true,
            fileName: true,
            fileType: true,
            createdAt: true,
            read: true,
          },
        },
      },
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket #${id} not found`);
    }

    return ticket;
  }

  // Mettre à jour un ticket (pour l'admin)
  async update(id: string, updateTicketDto: UpdateTicketDto) {
    const ticket = await this.findOne(id);

    const updateData: any = {};

    if (updateTicketDto.status) {
      updateData.status = updateTicketDto.status;

      if (updateTicketDto.status === TicketStatus.RESOLVED && !ticket.resolvedAt) {
        updateData.resolvedAt = new Date();
      }

      if (updateTicketDto.status === TicketStatus.CLOSED && !ticket.closedAt) {
        updateData.closedAt = new Date();
      }
    }

    if (updateTicketDto.priority) {
      updateData.priority = updateTicketDto.priority;
    }

    if (updateTicketDto.adminResponse) {
      updateData.adminResponse = updateTicketDto.adminResponse;
    }

    return this.prisma.supportTicket.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
          },
        },
      },
    });
  }

  // Répondre à un ticket via la messagerie (ADMIN)
  async respondToTicket(ticketId: string, response: string) {
    const ticket = await this.findOne(ticketId);

    // Créer un message admin lié au ticket
    const message = await this.prisma.adminMessage.create({
      data: {
        content: response,
        senderId: 'admin',
        receiverId: ticket.userId,
        userId: ticket.userId,
        ticketId: ticket.id,
      },
    });

    // Mettre à jour le statut du ticket
    await this.update(ticketId, { status: TicketStatus.IN_PROGRESS });

    // Créer une notification pour l'utilisateur
    await this.prisma.notification.create({
      data: {
        userId: ticket.userId,
        message: `Réponse de l'admin à votre ticket: ${ticket.subject}`,
        isRead: false,
      },
    });

    return message;
  }

  // Ajouter une réponse utilisateur à un ticket
  async addUserReply(ticketId: string, userId: string, message: string) {
    const ticket = await this.findOne(ticketId);

    // Vérifier que c'est bien le propriétaire du ticket
    if (ticket.userId !== userId) {
      throw new NotFoundException('Ticket non trouvé');
    }

    // Créer un message utilisateur lié au ticket
    const reply = await this.prisma.adminMessage.create({
      data: {
        content: message,
        senderId: userId,
        receiverId: 'admin',
        userId: userId,
        ticketId: ticket.id,
      },
    });

    return reply;
  }

  // Supprimer un ticket
  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.supportTicket.delete({
      where: { id },
    });
  }
}

