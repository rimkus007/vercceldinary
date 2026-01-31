import {
  BadRequestException,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import { extname } from 'path';

export interface FileValidationOptions {
  maxSize: number; // en bytes
  allowedMimeTypes: string[];
  allowedExtensions: string[];
}

export const DEFAULT_UPLOAD_OPTIONS: FileValidationOptions = {
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedMimeTypes: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf', '.txt', '.doc', '.docx'],
};

export const AVATAR_UPLOAD_OPTIONS: FileValidationOptions = {
  maxSize: 2 * 1024 * 1024, // 2MB
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
};

export const DOCUMENT_UPLOAD_OPTIONS: FileValidationOptions = {
  maxSize: 10 * 1024 * 1024, // 10MB
  allowedMimeTypes: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
  ],
  allowedExtensions: ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'],
};

export class FileUploadValidator {
  static validateFile(file: Express.Multer.File, options: FileValidationOptions = DEFAULT_UPLOAD_OPTIONS): void {
    if (!file) {
      throw new BadRequestException('Aucun fichier fourni');
    }

    // Vérifier la taille
    if (file.size > options.maxSize) {
      throw new BadRequestException(
        `Fichier trop volumineux. Taille maximale: ${Math.round(options.maxSize / (1024 * 1024))}MB`,
      );
    }

    // Vérifier le type MIME
    if (!options.allowedMimeTypes.includes(file.mimetype)) {
      throw new UnsupportedMediaTypeException(
        `Type de fichier non autorisé. Types acceptés: ${options.allowedMimeTypes.join(', ')}`,
      );
    }

    // Vérifier l'extension
    const fileExtension = extname(file.originalname).toLowerCase();
    if (!options.allowedExtensions.includes(fileExtension)) {
      throw new UnsupportedMediaTypeException(
        `Extension de fichier non autorisée. Extensions acceptées: ${options.allowedExtensions.join(', ')}`,
      );
    }

    // Vérification supplémentaire : magic numbers
    this.validateMagicNumbers(file);
  }

  private static validateMagicNumbers(file: Express.Multer.File): void {
    // Vérification basique des magic numbers pour prévenir les uploads malveillants
    const buffer = file.buffer;
    
    if (!buffer || buffer.length < 4) {
      throw new BadRequestException('Fichier corrompu ou invalide');
    }

    // Vérifier que le fichier ne commence pas par des signatures exécutables
    const executableSignatures = [
      Buffer.from([0x4D, 0x5A]), // PE executable
      Buffer.from([0x7F, 0x45, 0x4C, 0x46]), // ELF executable
      Buffer.from([0xCA, 0xFE, 0xBA, 0xBE]), // Mach-O executable
    ];

    for (const signature of executableSignatures) {
      if (buffer.subarray(0, signature.length).equals(signature)) {
        throw new BadRequestException('Les fichiers exécutables ne sont pas autorisés');
      }
    }
  }

  static sanitizeFileName(fileName: string): string {
    // Supprimer les caractères dangereux et normaliser le nom
    return fileName
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/_{2,}/g, '_')
      .toLowerCase();
  }

  static generateUniqueFileName(originalName: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2);
    const extension = extname(originalName);
    const baseName = this.sanitizeFileName(originalName.replace(extension, ''));
    
    return `${timestamp}_${random}_${baseName}${extension}`;
  }
}
