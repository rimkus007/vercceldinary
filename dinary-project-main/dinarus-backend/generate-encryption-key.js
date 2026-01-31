// Script pour générer une clé de chiffrement valide pour ENCRYPTION_KEY
const crypto = require('crypto');

console.log('\n🔐 Génération d\'une nouvelle clé de chiffrement AES-256...\n');

const encryptionKey = crypto.randomBytes(32).toString('hex');

console.log('✅ Clé générée avec succès!\n');
console.log('📋 Copiez cette ligne dans votre fichier .env:\n');
console.log(`ENCRYPTION_KEY=${encryptionKey}\n`);
console.log('⚠️  IMPORTANT: Gardez cette clé secrète et ne la partagez jamais!\n');
console.log(`Longueur: ${encryptionKey.length} caractères (64 requis) ✓\n`);
