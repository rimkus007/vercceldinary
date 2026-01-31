// dinary-temp/dinarus-backend/src/auth/auth.service.ts

import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterMerchantDto } from './dto/register-merchant.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    // Vérification de l'existence de l'utilisateur pour éviter les doublons
    const existingUser = await this.usersService.findOneByEmail(
      createUserDto.email,
    );
    if (existingUser) {
      throw new ConflictException('Un compte avec cet email existe déjà.');
    }

    // Hashage du mot de passe
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // On appelle le UsersService pour créer l'utilisateur
    const user = await this.usersService.createUser({
      ...createUserDto,
      hashedPassword: hashedPassword,
      // Le champ 'password' n'existe pas dans le modèle User, on l'exclut.
      password: undefined,
    });

    const { passwordHash, ...result } = user;
    return result;
  }

  async registerMerchant(registerMerchantDto: RegisterMerchantDto) {
    const { name, address, category, ...userData } = registerMerchantDto;

    const existingUser = await this.usersService.findOneByEmail(userData.email);
    if (existingUser) {
      throw new ConflictException('Un compte avec cet email existe déjà.');
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          ...userData,
          passwordHash: hashedPassword,
          role: 'MERCHANT',
          // Le champ 'password' n'existe pas dans le modèle User
          password: undefined,
        },
      });

      const merchant = await tx.merchant.create({
        data: {
          userId: user.id,
          name,
          address,
          category,
        },
      });

      return { user, merchant };
    });
  }

  async signIn(loginDto: LoginDto): Promise<{ access_token: string }> {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
    });

    if (
      !user ||
      !(await bcrypt.compare(loginDto.password, user.passwordHash))
    ) {
      throw new UnauthorizedException('Email ou mot de passe invalide');
    }

    const payload = { username: user.username, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
