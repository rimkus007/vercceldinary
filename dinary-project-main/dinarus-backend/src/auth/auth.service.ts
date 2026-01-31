// src/auth/auth.service.ts

import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterMerchantDto } from './dto/register-merchant.dto';
import { User, Prisma } from '@prisma/client';
import { nanoid } from 'nanoid';
import { GamificationService } from '../gamification/gamification.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private prisma: PrismaService,
    private gamificationService: GamificationService,
  ) {}

  async signIn(loginDto: LoginDto): Promise<{ access_token: string }> {
    const user = await this.usersService.findOneByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Email ou mot de passe invalide');
    }
    const isMatch = await bcrypt.compare(
      loginDto.password,
      user.hashedPassword,
    );
    if (!isMatch) {
      throw new UnauthorizedException('Email ou mot de passe invalide');
    }

    // Mettre à jour lastSeen lors de la connexion
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastSeen: new Date() },
    });

    const payload = {
      username: user.username,
      email: user.email,
      sub: user.id,
      role: user.role,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  // Le reste de votre fichier auth.service.ts reste inchangé...

  async register(
    createUserDto: CreateUserDto,
  ): Promise<Omit<User, 'hashedPassword'>> {
    const {
      password,
      referralCode: providedReferralCode,
      ...rest
    } = createUserDto;
    const hashedPassword = await bcrypt.hash(password, 10);
    let referredById: string | undefined = undefined;

    if (providedReferralCode) {
      const referrer =
        await this.usersService.findOneByReferralCode(providedReferralCode);
      if (referrer) {
        referredById = referrer.id;
      }
    }
    const referralCode = `DINARY-${nanoid(8).toUpperCase()}`;
    const userData: Prisma.UserCreateInput = {
      ...rest,
      hashedPassword: hashedPassword,
      referralCode: referralCode,
    };

    if (referredById) {
      userData.referredBy = { connect: { id: referredById } };
    }
    const user = await this.usersService.createUser(userData);

    if (referredById) {
      
    }
    const { hashedPassword: _, ...result } = user;
    return result;
  }

  async registerMerchant(registerMerchantDto: RegisterMerchantDto) {
    // Séparer les données utilisateur, marchand, et le code de suggestion
    const {
      name: merchantName, // Renommé pour clarté
      address,
      category,
      suggestionCode, // Récupérer le code
      password,
      referralCode: providedReferralCode, // Code de parrainage utilisateur
      ...userData // email, username, fullName, phoneNumber
    } = registerMerchantDto;

    // --- Vérification utilisateur existant (inchangée) ---
    const existingUser = await this.usersService.findOneByEmail(userData.email);
    if (existingUser) {
      throw new ConflictException('Un compte avec cet email existe déjà.');
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    // --- Logique du code de parrainage utilisateur (inchangée) ---
    let referredById: string | undefined = undefined;
    if (providedReferralCode) {
      const referrer =
        await this.usersService.findOneByReferralCode(providedReferralCode);
      if (referrer) {
        referredById = referrer.id;
      }
    }

    // --- Nouvelle logique pour le code de suggestion ---
    let linkedSuggestion: { id: string; suggestedById: string | null } | null =
      null;
    if (suggestionCode) {
      // Nettoyer le code (enlever espaces, mettre en majuscules)
      const cleanCode = suggestionCode.trim().toUpperCase();
      
      
      
      const suggestion = await this.prisma.merchantSuggestion.findUnique({
        where: { suggestionCode: cleanCode },
        select: { id: true, status: true, suggestedById: true }, // Sélectionner l'ID du suggéreur
      });

      

      if (!suggestion) {
        
        throw new BadRequestException(
          'Code de suggestion invalide ou introuvable. Vérifiez que le code est correct.',
        );
      }
      
      if (suggestion.status === 'claimed') {
        
        throw new BadRequestException(
          'Ce code de suggestion a déjà été utilisé par un autre marchand.',
        );
      }
      
      if (suggestion.status === 'rejected') {
        
        throw new BadRequestException(
          'Ce code de suggestion a été rejeté et ne peut plus être utilisé.',
        );
      }
      
      if (suggestion.status !== 'approved') {
        
        throw new BadRequestException(
          `Ce code de suggestion n'est pas encore approuvé. Statut actuel: ${suggestion.status}`,
        );
      }
      
      
      linkedSuggestion = {
        id: suggestion.id,
        suggestedById: suggestion.suggestedById,
      }; // Stocker l'ID de la suggestion
    }
    // --- Fin nouvelle logique ---

    // Création dans une transaction
    return this.prisma.$transaction(async (tx) => {
      // 1. Créer l'utilisateur marchand
      const user = await tx.user.create({
        data: {
          ...userData,
          hashedPassword,
          role: 'MERCHANT',
          referralCode: `DINARY-${nanoid(8).toUpperCase()}`, // Code de parrainage *pour ce marchand*
          ...(referredById && {
            referredBy: { connect: { id: referredById } },
          }), // Lien parrain utilisateur
        },
      });

      // 2. Créer Wallet et UserProfile (inchangé)
      await tx.wallet.create({ data: { userId: user.id } });
      await tx.userProfile.create({ data: { userId: user.id } });

      // 3. Créer le Merchant officiel
      const merchant = await tx.merchant.create({
        data: {
          userId: user.id,
          name: merchantName,
          address,
          category: category || 'other',
          isApproved: true, // Approuvé car vient d'une suggestion validée ou inscription directe
          status: 'active',
          isSuggestion: false, // Ce n'est PAS une suggestion
          // 👇 Lier à la suggestion si un code a été utilisé
          ...(linkedSuggestion && {
            claimedSuggestion: { connect: { id: linkedSuggestion.id } },
          }),
        },
      });

      // 4. Mettre à jour la suggestion comme "réclamée" si elle a été utilisée
      if (linkedSuggestion) {
        await tx.merchantSuggestion.update({
          where: { id: linkedSuggestion.id },
          data: {
            status: 'claimed',
            claimedByMerchantId: merchant.id, // Lier le marchand à la suggestion
          },
        });
        // Donner des points XP à l'utilisateur qui a fait la suggestion initiale
        if (linkedSuggestion.suggestedById) {
          const xpForClaimedSuggestion = 500; // Mettez la valeur souhaitée
          await this.gamificationService.addXp(
            linkedSuggestion.suggestedById,
            xpForClaimedSuggestion,
          );
          await tx.notification.create({
            data: {
              userId: linkedSuggestion.suggestedById,
              message: `🎉 Le commerçant "${merchantName}" que vous aviez suggéré a rejoint Dinary ! Vous gagnez ${xpForClaimedSuggestion} XP !`,
            },
          });
        }
      }

      // 5. Bonus de parrainage utilisateur (si applicable, inchangé)
      // await this.checkAndApplyReferralBonus(user.id); // Vous pourriez avoir cette logique ailleurs

      const { hashedPassword: _, ...userResult } = user;
      return { user: userResult, merchant };
    });
  }
}
