import { BadRequestException } from '@nestjs/common';

/**
 * 🔒 SÉCURITÉ: Validation des types de fichiers pour uploads
 */

// Types MIME autorisés pour les images
const ALLOWED_IMAGE_MIMES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/heic', // Pour iOS
];

// Extensions autorisées
const ALLOWED_IMAGE_EXTENSIONS = [
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.heic',
];

// Taille maximale: 5MB pour les images
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

// Taille maximale: 10MB pour les documents/fichiers généraux
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * Filtre pour valider les images uniquement
 * @param req Requête HTTP
 * @param file Fichier uploadé
 * @param callback Callback Multer
 */
export const imageFileFilter = (
  req: any,
  file: Express.Multer.File,
  callback: (error: Error | null, acceptFile: boolean) => void,
) => {
  // Vérification du type MIME
  if (!ALLOWED_IMAGE_MIMES.includes(file.mimetype)) {
    return callback(
      new BadRequestException(
        `Type de fichier non autorisé. Types acceptés: ${ALLOWED_IMAGE_MIMES.join(', ')}`
      ),
      false,
    );
  }

  // Vérification de l'extension
  const fileExtension = file.originalname.toLowerCase().match(/\.[^.]+$/)?.[0];
  if (!fileExtension || !ALLOWED_IMAGE_EXTENSIONS.includes(fileExtension)) {
    return callback(
      new BadRequestException(
        `Extension de fichier non autorisée. Extensions acceptées: ${ALLOWED_IMAGE_EXTENSIONS.join(', ')}`
      ),
      false,
    );
  }

  // Fichier valide
  callback(null, true);
};

/**
 * Valide manuellement un fichier image
 * @param file Fichier à valider
 * @throws BadRequestException si le fichier est invalide
 */
export function validateImageFile(file: Express.Multer.File | undefined): void {
  if (!file) {
    throw new BadRequestException('Aucun fichier fourni');
  }

  // Vérification du type MIME
  if (!ALLOWED_IMAGE_MIMES.includes(file.mimetype)) {
    throw new BadRequestException(
      `Type de fichier non autorisé: ${file.mimetype}. Types acceptés: ${ALLOWED_IMAGE_MIMES.join(', ')}`
    );
  }

  // Vérification de la taille
  if (file.size > MAX_IMAGE_SIZE) {
    throw new BadRequestException(
      `Fichier trop volumineux (${(file.size / 1024 / 1024).toFixed(2)} MB). Taille max: 5 MB`
    );
  }

  // Vérification de l'extension
  const fileExtension = file.originalname.toLowerCase().match(/\.[^.]+$/)?.[0];
  if (!fileExtension || !ALLOWED_IMAGE_EXTENSIONS.includes(fileExtension)) {
    throw new BadRequestException(
      `Extension de fichier non autorisée: ${fileExtension}. Extensions acceptées: ${ALLOWED_IMAGE_EXTENSIONS.join(', ')}`
    );
  }
}

/**
 * Valide un tableau de fichiers images
 * @param files Fichiers à valider
 * @throws BadRequestException si un fichier est invalide
 */
export function validateImageFiles(files: Express.Multer.File[] | undefined): void {
  if (!files || files.length === 0) {
    throw new BadRequestException('Aucun fichier fourni');
  }

  files.forEach((file, index) => {
    try {
      validateImageFile(file);
    } catch (error) {
      throw new BadRequestException(`Fichier ${index + 1}: ${error.message}`);
    }
  });
}


