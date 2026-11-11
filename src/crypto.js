/**
 * ============================================================================
 * MODULE DE SECURITE CRYPTOGRAPHIQUE
 * ============================================================================
 * Auteurs : Salhi Issam & Chouikha Imane
 * Niveau : 3eme annee L3 ISIL (LMD) - Module PAWEB
 * Algorithme : AES-256-GCM (Authenticated Encryption)
 * Derivation de cle : scryptSync (KDF - Key Derivation Function)
 * ============================================================================
 */

import crypto from 'node:crypto';

// Configuration cryptographique standard et robuste
const ALGORITHM = 'aes-256-gcm'; // Mode de chiffrement symetrique authentifie
const KEY_LENGTH = 32;          // 256 bits (32 octets) pour la cle de chiffrement
const IV_LENGTH = 12;           // 96 bits (12 octets) recommande par le NIST SP 800-38D
const SALT_LENGTH = 16;         // 128 bits (16 octets) de Salt cryptographique
const AUTH_TAG_LENGTH = 16;     // 128 bits (16 octets) pour l'etiquette d'authentification

/**
 * Derive une cle cryptographique symetrique de 256 bits a partir d'un mot de passe maitre et d'un Salt.
 * Utilise l'algorithme scrypt (KDF) qui est difficile a声 paralleliser et gourmand en memoire (Memory-hard),
 * neutralisant efficacement les attaques par force brute (Brute-Force) et les fermes de GPU/ASIC.
 * 
 * @param {string} password - Mot de passe maitre saisi a l'execution
 * @param {Buffer} salt - Sel cryptographique aleatoire
 * @returns {Buffer} Cle binaire derivee de 32 octets (256 bits)
 */
export function deriveKey(password, salt) {
  if (!password || typeof password !== 'string') {
    throw new Error('Le mot de passe doit etre une chaine de caracteres non vide.');
  }
  if (!salt || !Buffer.isBuffer(salt) || salt.length !== SALT_LENGTH) {
    throw new Error(`Le Salt doit etre un Buffer de ${SALT_LENGTH} octets.`);
  }

  // Parametres scrypt recommandes selon les standards NIST
  return crypto.scryptSync(password, salt, KEY_LENGTH, {
    N: 16384, // Cout CPU/Memoire (Iterations)
    r: 8,     // Taille des blocs internes
    p: 1      // Degre de parallelisation
  });
}

/**
 * Chiffre des donnees sensibles locales (etudiants, releves) en AES-256-GCM.
 * Genere OBLIGATOIREMENT un nouvel IV (Initialization Vector) et un nouveau Salt a chaque appel.
 * 
 * @param {string|Object} plainText - Donnees en clair a chiffrer
 * @param {string} password - Mot de passe maitre
 * @returns {Object} Conteneur securise { algorithm, salt, iv, authTag, ciphertext, createdAt }
 */
export function encryptData(plainText, password) {
  const dataString = typeof plainText === 'string' ? plainText : JSON.stringify(plainText);

  // 1. Generation d'un Sel cryptographique aleatoire
  const salt = crypto.randomBytes(SALT_LENGTH);

  // 2. Derivation de la cle secrete via scrypt
  const key = deriveKey(password, salt);

  // 3. Generation d'un Vecteur d'Initialisation (IV) unique
  const iv = crypto.randomBytes(IV_LENGTH);

  // 4. Initialisation du Cipher AES-256-GCM
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  // 5. Chiffrement effectif du flux de donnees
  let encrypted = cipher.update(dataString, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  // 6. Extraction de l'Authentication Tag (128 bits)
  const authTag = cipher.getAuthTag();

  return {
    algorithm: ALGORITHM,
    salt: salt.toString('hex'),
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex'),
    ciphertext: encrypted,
    createdAt: new Date().toISOString()
  };
}

/**
 * Dechiffre les donnees securisees et valide l'integrite via l'Authentication Tag.
 * 
 * @param {Object} encryptedPayload - Conteneur chiffre { salt, iv, authTag, ciphertext }
 * @param {string} password - Mot de passe maitre
 * @returns {string} Donnees dechiffrees en clair
 * @throws {Error} En cas d'echec d'authentification ou alteration de donnees
 */
export function decryptData(encryptedPayload, password) {
  const { salt, iv, authTag, ciphertext } = encryptedPayload;

  if (!salt || !iv || !authTag || ciphertext === undefined) {
    throw new Error('Structure du conteneur chiffre invalide ou corrompue.');
  }

  const saltBuffer = Buffer.from(salt, 'hex');
  const ivBuffer = Buffer.from(iv, 'hex');
  const authTagBuffer = Buffer.from(authTag, 'hex');

  const key = deriveKey(password, saltBuffer);

  try {
    const decipher = crypto.createDecipheriv(ALGORITHM, key, ivBuffer);
    decipher.setAuthTag(authTagBuffer);

    let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (err) {
    const error = new Error('ECHEC D\'AUTHENTIFICATION : Mot de passe incorrect ou donnees alterees.');
    error.code = 'ERR_CRYPTO_AUTH_FAILED';
    error.originalMessage = err.message;
    throw error;
  }
}
