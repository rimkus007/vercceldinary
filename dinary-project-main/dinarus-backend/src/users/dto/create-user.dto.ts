// src/users/dto/create-user.dto.ts
import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  IsNotEmpty,
  IsOptional,
  Matches,
} from 'class-validator';

export class CreateUserDto {
  // 🔒 SÉCURITÉ: Validation stricte de l'email
  @IsEmail({}, { message: 'Veuillez fournir un email valide.' })
  @IsNotEmpty({ message: "L'email ne peut pas être vide." })
  @MaxLength(255, { message: 'L\'email est trop long.' })
  email: string;

  // 🔒 SÉCURITÉ: Validation du nom complet
  @IsString()
  @IsNotEmpty({ message: 'Le nom complet ne peut pas être vide.' })
  @MinLength(2, { message: 'Le nom complet doit contenir au moins 2 caractères.' })
  @MaxLength(100, { message: 'Le nom complet est trop long.' })
  @Matches(/^[a-zA-ZÀ-ÿ\s'-]+$/, {
    message: 'Le nom complet ne peut contenir que des lettres, espaces et tirets.',
  })
  fullName: string;

  // 🔒 SÉCURITÉ: Validation du nom d'utilisateur
  @IsString()
  @IsNotEmpty({ message: "Le nom d'utilisateur ne peut pas être vide." })
  @MinLength(3, { message: 'Le nom d\'utilisateur doit contenir au moins 3 caractères.' })
  @MaxLength(30, { message: 'Le nom d\'utilisateur est trop long.' })
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message: 'Le nom d\'utilisateur ne peut contenir que des lettres, chiffres, tirets et underscores.',
  })
  username: string;

  // 🔒 SÉCURITÉ: Validation du numéro de téléphone
  @IsString()
  @IsNotEmpty({ message: 'Le numéro de téléphone ne peut pas être vide.' })
  @Matches(/^(\+213|0)[5-7][0-9]{8}$/, {
    message: 'Veuillez fournir un numéro de téléphone algérien valide.',
  })
  phoneNumber: string;

  // 🔒 SÉCURITÉ: Validation FORTE du mot de passe
  @IsString()
  @MinLength(8, {
    message: 'Le mot de passe doit contenir au moins 8 caractères.',
  })
  @MaxLength(128, {
    message: 'Le mot de passe est trop long.',
  })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
    {
      message: 
        'Le mot de passe doit contenir au moins: ' +
        '1 majuscule, 1 minuscule, 1 chiffre et 1 caractère spécial (@$!%*?&)',
    },
  )
  password: string;

  // Code de parrainage optionnel
  @IsString()
  @IsOptional()
  @MaxLength(20, { message: 'Le code de parrainage est invalide.' })
  referralCode?: string;
}
