// src/friends/friends.service.ts

import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { FriendshipStatus } from '@prisma/client';

@Injectable()
export class FriendsService {
  constructor(private prisma: PrismaService) {}

  async sendRequest(requesterId: string, addresseeUsername: string) {
    const addressee = await this.prisma.user.findUnique({
      where: { username: addresseeUsername },
    });

    if (!addressee) {
      throw new NotFoundException('Utilisateur non trouvé.');
    }
    if (requesterId === addressee.id) {
      throw new ConflictException('Vous ne pouvez pas vous ajouter vous-même.');
    }

    const existingRequest = await this.prisma.friendship.findFirst({
      where: {
        OR: [
          { requesterId, addresseeId: addressee.id },
          { requesterId: addressee.id, addresseeId: requesterId },
        ],
      },
    });

    if (existingRequest) {
      throw new ConflictException(
        "Une demande d'ami existe déjà avec cet utilisateur.",
      );
    }

    const requester = await this.prisma.user.findUnique({
      where: { id: requesterId },
    });
    if (!requester) {
      throw new NotFoundException('Demandeur non trouvé.');
    }

    const friendship = await this.prisma.friendship.create({
      data: {
        requesterId,
        addresseeId: addressee.id,
        status: 'PENDING', // Correction 1: Spécifier le statut
      },
    });

    await this.prisma.notification.create({
      data: {
        userId: addressee.id,
        message: `Vous avez reçu une demande d'ami de la part de ${requester.fullName}.`, // Correction 2: Utiliser l'objet 'requester'
      },
    });

    return friendship;
  }

  async respondToRequest(
    userId: string,
    requestId: string,
    status: FriendshipStatus,
  ) {
    const request = await this.prisma.friendship.findUnique({
      where: { id: requestId },
      include: {
        addressee: { select: { fullName: true } },
      },
    });

    if (!request || request.addresseeId !== userId) {
      throw new NotFoundException('Demande non trouvée ou non autorisée.');
    }

    const message =
      status === 'ACCEPTED'
        ? `${request.addressee.fullName} a accepté votre demande d'ami.`
        : `${request.addressee.fullName} a refusé votre demande d'ami.`;

    await this.prisma.notification.create({
      data: {
        userId: request.requesterId,
        message: message,
      },
    });

    return this.prisma.friendship.update({
      where: { id: requestId },
      data: { status },
    });
  }

  async getFriends(userId: string) {
    const friendships = await this.prisma.friendship.findMany({
      where: {
        status: 'ACCEPTED',
        OR: [{ requesterId: userId }, { addresseeId: userId }],
      },
      include: {
        requester: {
          select: { id: true, username: true, fullName: true, lastSeen: true },
        },
        addressee: {
          select: { id: true, username: true, fullName: true, lastSeen: true },
        },
      },
    });

    return friendships.map((f) => {
      return f.requesterId === userId ? f.addressee : f.requester;
    });
  }

  async getPendingRequests(userId: string) {
    return this.prisma.friendship.findMany({
      where: {
        addresseeId: userId,
        status: 'PENDING',
      },
      include: {
        requester: {
          select: { id: true, username: true, fullName: true },
        },
      },
    });
  }
}
