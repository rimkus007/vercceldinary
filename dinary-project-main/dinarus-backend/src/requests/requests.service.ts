import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { RespondRequestDto } from './dto/respond-request.dto';
import { WalletService } from 'src/wallet/wallet.service';
import { User } from '@prisma/client';

@Injectable()
export class RequestsService {
  constructor(
    private prisma: PrismaService,
    private walletService: WalletService,
  ) {}

  async respondToRequest(
    payerId: string,
    requestId: string,
    respondRequestDto: RespondRequestDto,
  ) {
    const { action } = respondRequestDto;

    const moneyRequest = await this.prisma.moneyRequest.findUnique({
      where: { id: requestId },
      include: { requester: true }, // Inclure les infos du demandeur
    });

    if (!moneyRequest) {
      throw new NotFoundException('Demande non trouvée.');
    }

    // Ajout d'une vérification pour le demandeur
    if (!moneyRequest.requester) {
      throw new NotFoundException(
        'Utilisateur demandeur associé à cette requête est introuvable.',
      );
    }

    if (moneyRequest.payerId !== payerId) {
      throw new ForbiddenException(
        "Vous n'êtes pas autorisé à répondre à cette demande.",
      );
    }

    if (moneyRequest.status !== 'pending') {
      throw new ConflictException('Il a déjà été répondu à cette demande.');
    }

    if (action === 'rejected') {
      return this.prisma.moneyRequest.update({
        where: { id: requestId },
        data: { status: 'rejected' },
      });
    }

    if (action === 'accepted') {
      // Utiliser la logique de transfert du WalletService
      await this.walletService.sendMoney(payerId, {
        amount: moneyRequest.amount,
        receiverId: moneyRequest.requester.id, // CORRECTION : On envoie l'ID, pas le username
      });

      return this.prisma.moneyRequest.update({
        where: { id: requestId },
        data: { status: 'accepted' },
      });
    }
  }

  async create(requesterId: string, createRequestDto: CreateRequestDto) {
    const { payerUsername, amount, description } = createRequestDto;

    const payer = await this.prisma.user.findUnique({
      where: { username: payerUsername },
    });

    if (!payer) {
      throw new NotFoundException('Utilisateur payeur non trouvé.');
    }

    const newRequest = await this.prisma.moneyRequest.create({
      data: {
        amount,
        description,
        requesterId,
        payerId: payer.id,
      },
    });

    return newRequest;
  }

  async findReceived(userId: string) {
    return this.prisma.moneyRequest.findMany({
      where: {
        payerId: userId,
        status: 'pending',
      },
      include: {
        requester: {
          select: {
            username: true,
            fullName: true,
          },
        },
      },
    });
  }
}
