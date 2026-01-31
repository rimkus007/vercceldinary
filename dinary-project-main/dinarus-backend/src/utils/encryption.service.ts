import * as crypto from 'crypto';

/**
 * Service de chiffrement pour les données sensibles des archives de vérification
 * Utilise AES-256-GCM pour un chiffrement fort
 */
export class EncryptionService {
  private static readonly ALGORITHM = 'aes-256-gcm';
  private static readonly IV_LENGTH = 16;
  private static readonly AUTH_TAG_LENGTH = 16;
  private static readonly SALT_LENGTH = 64;

  /**
   * Obtient la clé de chiffrement depuis les variables d'environnement
   * 🔒 SÉCURITÉ: La clé DOIT être définie, sinon l'application ne démarre pas
   */
  private static getEncryptionKey(): Buffer {
    const key = process.env.ENCRYPTION_KEY;
    
    // 🔒 SÉCURITÉ CRITIQUE: On ne tolère plus l'absence de clé
    if (!key) {
      throw new Error(
        '❌ ERREUR CRITIQUE: ENCRYPTION_KEY manquante! ' +
        'Générez une clé avec: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"'
      );
    }

    // Vérifier que la clé a la bonne longueur (64 caractères hex = 32 bytes)
    if (key.length !== 64) {
      throw new Error(
        `❌ ERREUR CRITIQUE: ENCRYPTION_KEY invalide! ` +
        `Longueur actuelle: ${key.length} caractères, attendu: 64 caractères. ` +
        `Générez une nouvelle clé avec: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
      );
    }

    // Convertir la clé hexadécimale en Buffer
    try {
      return Buffer.from(key, 'hex');
    } catch (error) {
      throw new Error(
        '❌ ERREUR CRITIQUE: ENCRYPTION_KEY n\'est pas au format hexadécimal valide! ' +
        'Générez une nouvelle clé avec: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"'
      );
    }
  }

  /**
   * Chiffre des données sensibles avec AES-256-GCM
   */
  static encrypt(text: string): string {
    const key = this.getEncryptionKey();
    const iv = crypto.randomBytes(this.IV_LENGTH);
    
    const cipher = crypto.createCipheriv(this.ALGORITHM, key, iv);
    cipher.setAAD(Buffer.from('dinary-encryption', 'utf8'));
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    // Combiner IV + authTag + données chiffrées
    return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
  }

  /**
   * Déchiffre des données sensibles
   */
  static decrypt(encryptedData: string): string {
    const key = this.getEncryptionKey();
    
    // Séparer IV, authTag et données
    const parts = encryptedData.split(':');
    if (parts.length !== 3) {
      throw new Error('Format de données chiffrées invalide');
    }
    
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];
    
    const decipher = crypto.createDecipheriv(this.ALGORITHM, key, iv);
    decipher.setAAD(Buffer.from('dinary-encryption', 'utf8'));
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  /**
   * Génère une clé de chiffrement aléatoire
   */
  static generateKey(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Vérifie que la clé de chiffrement est valide
   */
  static validateKey(): boolean {
    try {
      this.getEncryptionKey();
      return true;
    } catch {
      return false;
    }
  }
}