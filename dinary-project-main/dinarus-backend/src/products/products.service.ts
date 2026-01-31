// src/products/products.service.ts

import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { GamificationService } from 'src/gamification/gamification.service';
import { NotificationsService } from 'src/notifications/notifications.service';
import { promises as fs } from 'fs';
import * as path from 'path';
const LOW_STOCK_THRESHOLD = 10;

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    private gamificationService: GamificationService,
    private notificationsService: NotificationsService,
  ) {}

  private async getMerchantFromUserId(userId: string) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { userId },
    });
    if (!merchant) {
      throw new UnauthorizedException(
        'Profil commerçant non trouvé pour cet utilisateur.',
      );
    }
    return merchant;
  }

  async create(
    createProductDto: CreateProductDto,
    userId: string,
    file?: Express.Multer.File,
  ) {
    const merchant = await this.getMerchantFromUserId(userId);
    let imageUrl: string | undefined = undefined;

    if (file) {
      const filename = `${userId}-${Date.now()}${path.extname(
        file.originalname,
      )}`;
      const imagePath = path.join(
        process.cwd(),
        'uploads',
        'products',
        filename,
      );
      await fs.mkdir(path.dirname(imagePath), { recursive: true });
      await fs.writeFile(imagePath, file.buffer);

      // ✅ CORRECTION : On inclut /uploads dans l'URL sauvegardée
      imageUrl = `/uploads/products/${filename}`;
    }

    const newProduct = await this.prisma.product.create({
      // <--- On sauvegarde le produit créé
      data: {
        ...createProductDto,
        imageUrl,
        merchant: { connect: { id: merchant.id } },
      },
    });
    // --- ✨ AJOUT : Vérification stock faible à la création ---
    // 👇 AJOUTER CE CHECK 👇
    if (newProduct.stock !== null) {
      if (newProduct.stock < LOW_STOCK_THRESHOLD) {
        // On passe 'newProduct.stock' qui est maintenant vérifié comme non-null
        await this.sendLowStockNotification(
          userId,
          newProduct.name,
          newProduct.stock,
        );
      }
    }

    // --- ✨ CORRECTION : AJOUT DE L'APPEL AU SERVICE DE GAMIFICATION ---
    try {
      // 1. On calcule l'XP à donner en fonction de la règle "ADD_PRODUCT" pour cet utilisateur
      const xpToAdd = await this.gamificationService.calculateXpForTransaction(
        'ADD_PRODUCT', // L'identifiant de ton action
        userId, // L'ID du commerçant
      );

      if (xpToAdd > 0) {
        // 2. On ajoute l'XP au profil du commerçant
        await this.gamificationService.addXp(userId, xpToAdd);
      }

      // 3. On met aussi à jour la progression des missions (si une mission "ADD_PRODUCT" existe)
      await this.gamificationService.updateMissionProgress(
        userId,
        'ADD_PRODUCT',
      );
    } catch (gamificationError) {
      // On ne bloque pas la création du produit si la gamification échoue
      
    }
    // --- FIN DE LA CORRECTION ---

    return newProduct; // On renvoie le produit créé
  }

  // ... (findAllForUser reste identique)
  async findAllForUser(userId: string) {
    const merchant = await this.getMerchantFromUserId(userId);
    return this.prisma.product.findMany({
      where: { merchantId: merchant.id },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(
    id: string,
    updateProductDto: CreateProductDto,
    userId: string,
    file?: Express.Multer.File,
  ) {
    const merchant = await this.getMerchantFromUserId(userId);
    const product = await this.prisma.product.findUnique({ where: { id } });

    if (!product || product.merchantId !== merchant.id) {
      throw new UnauthorizedException('Produit non trouvé ou non autorisé.');
    }

    let imageUrl: string | null | undefined = product.imageUrl;

    if (file) {
      if (product.imageUrl) {
        const oldPath = path.join(process.cwd(), product.imageUrl);
        await fs.unlink(oldPath).catch((err) => void 0);
      }

      const filename = `${userId}-${Date.now()}${path.extname(file.originalname)}`;
      const imagePath = path.join('uploads', 'products', filename);
      await fs.mkdir(path.dirname(imagePath), { recursive: true });
      await fs.writeFile(imagePath, file.buffer);

      // ✅ CORRECTION : On inclut aussi /uploads ici
      imageUrl = `/uploads/products/${filename}`;
    }

    return this.prisma.product.update({
      where: { id },
      data: {
        ...updateProductDto,
        imageUrl,
      },
    });
  }

  // ... (les autres fonctions remove et decreaseStock ne changent pas)
  async remove(productId: string, userId: string) {
    const merchant = await this.getMerchantFromUserId(userId);
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Produit non trouvé.');
    }
    if (product.merchantId !== merchant.id) {
      throw new UnauthorizedException('Action non autorisée.');
    }

    if (product.imageUrl) {
      const imagePath = path.join(process.cwd(), product.imageUrl);
      await fs.unlink(imagePath).catch((err) => void 0);
    }

    await this.prisma.product.delete({ where: { id: productId } });
    return { message: 'Produit supprimé avec succès.' };
  }

  async decreaseStock(
    merchantUserId: string,
    items: { id: string; quantity: number }[],
  ) {
    return this.prisma.$transaction(async (tx) => {
      for (const item of items) {
        const product = await tx.product.findUnique({ where: { id: item.id } });
        if (!product) {
          throw new NotFoundException(
            `Produit avec l'ID ${item.id} non trouvé.`,
          );
        }

        // Si le stock n'est pas suivi (null), on ne fait rien pour ce produit
        if (product.stock === null) {
          continue; // Passe à l'article suivant
        }

        if (product.stock < item.quantity) {
          // Lance BadRequestException pour une meilleure gestion par le frontend
          throw new BadRequestException(
            `Stock insuffisant pour le produit "${product.name}". Requis: ${item.quantity}, Disponible: ${product.stock}.`,
          );
        }

        const previousStock = product.stock; // Stock avant décrémentation

        const updatedProduct = await tx.product.update({
          where: { id: item.id },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });

        // --- ✨ AJOUT : Vérification stock faible après décrémentation ---
        const currentStock = updatedProduct.stock; // Stock après décrémentation
        // 👇 AJOUTER CE CHECK (même si théoriquement `decrement` ne devrait pas rendre null) 👇
        if (currentStock !== null) {
          if (currentStock < LOW_STOCK_THRESHOLD) {
            // Vérifie si le stock précédent n'était PAS déjà faible
            // (previousStock ne peut pas être null ici car on l'a vérifié avant)
            if (previousStock >= LOW_STOCK_THRESHOLD) {
              // On passe 'currentStock' qui est maintenant vérifié comme non-null
              await this.sendLowStockNotification(
                merchantUserId,
                updatedProduct.name,
                currentStock,
              );
            }
          }
        }
        // --- FIN AJOUT ---
      }
    });
  }

  // ✨ NOUVELLE MÉTHODE privée pour envoyer la notification
  private async sendLowStockNotification(
    userId: string,
    productName: string,
    currentStock: number,
  ) {
    try {
      await this.notificationsService.create({
        // AVANT: userId: userId,
        user: { connect: { id: userId } }, // CORRECT ✅
        message: `⚠️ Stock faible pour "${productName}". Il reste ${currentStock} unité(s).`,
        // Vous pourriez ajouter un 'type' ou un 'category' ici si besoin
      });
    } catch (error) {
      
      // Ne pas bloquer l'opération principale si la notification échoue
    }
  }
}
