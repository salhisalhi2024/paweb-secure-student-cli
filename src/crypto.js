/**
 * ============================================================================
 * MODULE DE SÉCURITÉ CRYPTOGRAPHIQUE (CRYPTOGRAPHIC SECURITY MODULE)
 * Auteurs : Salhi Issam & Chouikha Imane (L3 ISIL - Module PAWEB)
 * Algorithme : AES-256-GCM (Galois/Counter Mode) avec dérivation scrypt
 * ============================================================================
 */

import crypto from 'node:crypto';

// Configuration cryptographique standard et robuste
const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;       // 256 bits
const IV_LENGTH = 12;        // 96 bits recommandé par le NIST pour AES-GCM (NIST SP 800-38D)
const SALT_LENGTH = 16;      // 128 bits pour le Salt de dérivation
const AUTH_TAG_LENGTH = 16;  // 128 bits d'intégrité (Authentication Tag)

/**
 * Dérive une clé cryptographique de 256 bits à partir d'un mot de passe maître et d'un Salt.
 * 
 * ملاحظة بالعربية (Note en Arabe) :
 * وظيفة اشتقاق المفتاح (Key Derivation Function - KDF) باستخدام دالة scrypt.
 * صُممت خوارزمية scrypt لتكون مكلفة من حيث استهلاك الذاكرة والمعالجة (Memory-hard)،
 * مما يحمي كلمة المرور من هجمات القوة الغاشمة (Brute-force attacks) وبطاقات الرسوميات (GPUs/ASICs).
 * 
 * @param {string} password - Mot de passe maître fourni par l'utilisateur.
 * @param {Buffer} salt - Sel cryptographique aléatoire.
 * @returns {Buffer} Clé binaire symétrique de 32 octets (256 bits).
 */
export function deriveKey(password, salt) {
  if (!password || typeof password !== 'string') {
    throw new Error('Le mot de passe doit être une chaîne de caractères non vide.');
  }
  if (!salt || !Buffer.isBuffer(salt) || salt.length !== SALT_LENGTH) {
    throw new Error(`Le Salt doit être un Buffer de ${SALT_LENGTH} octets.`);
  }

  // Options scrypt recommandées pour un équilibre sécurité / performance CLI
  return crypto.scryptSync(password, salt, KEY_LENGTH, {
    N: 16384, // Facteur de coût CPU/Mémoire
    r: 8,     // Taille de bloc
    p: 1      // Parallélisme
  });
}

/**
 * Chiffre des données sensibles (texte ou objet sérialisé) en utilisant AES-256-GCM.
 * Génère obligatoirement un NOUVEAU vecteur d'initialisation (IV) et un nouveau Salt à chaque appel.
 * 
 * ملاحظة بالعربية (Note en Arabe) :
 * وضع GCM (Galois/Counter Mode) هو تشفير موثق (AEAD - Authenticated Encryption with Associated Data).
 * يوفر السرية (Confidentiality) والسلامة (Integrity).
 * توليد متجه تهيئة (IV) عشوائي وجديد في كل عملية أمر حاسم أمنياً لمنع إعادة استخدام المفتاح (Nonce Reuse Vulnerability).
 * 
 * @param {string} plainText - Données en clair à chiffrer.
 * @param {string} password - Mot de passe maître de l'utilisateur.
 * @returns {Object} Objet contenant les métadonnées et le texte chiffré au format Hexadécimal.
 */
export function encryptData(plainText, password) {
  if (typeof plainText !== 'string') {
    plainText = JSON.stringify(plainText);
  }

  // 1. Génération d'un nouveau Salt aléatoire pour cette opération
  const salt = crypto.randomBytes(SALT_LENGTH);

  // 2. Dérivation de la clé 256 bits avec scrypt
  const key = deriveKey(password, salt);

  // 3. Génération OBLIGATOIRE d'un nouvel IV (Initialization Vector) aléatoire
  const iv = crypto.randomBytes(IV_LENGTH);

  // 4. Initialisation du Cipher AES-256-GCM
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  // 5. Chiffrement des données en clair
  let encrypted = cipher.update(plainText, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  // 6. Extraction de l'Authentication Tag (Garantit l'intégrité et la non-altération)
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
 * Déchiffre les données sécurisées et vérifie rigoureusement l'intégrité via l'Auth Tag.
 * 
 * ملاحظة بالعربية (Note en Arabe) :
 * في حالة إدخال كلمة مرور خاطئة أو محاولة العبث بالبيانات (Tampering)،
 * ستفشل عملية التحقق من الـ Authentication Tag تلقائياً ولن يتم فك التشفير إطلاقاً.
 * 
 * @param {Object} encryptedPayload - Conteneur chiffré { salt, iv, authTag, ciphertext }.
 * @param {string} password - Mot de passe maître pour dériver la clé.
 * @returns {string} Données déchiffrées en clair.
 * @throws {Error} En cas de mauvais mot de passe ou d'altération du fichier.
 */
export function decryptData(encryptedPayload, password) {
  const { salt, iv, authTag, ciphertext } = encryptedPayload;

  if (!salt || !iv || !authTag || ciphertext === undefined) {
    throw new Error('Structure du conteneur chiffré invalide ou corrompue.');
  }

  // Conversion des chaînes hexadécimales en Buffers binaires
  const saltBuffer = Buffer.from(salt, 'hex');
  const ivBuffer = Buffer.from(iv, 'hex');
  const authTagBuffer = Buffer.from(authTag, 'hex');

  // Dérivation de la clé à l'aide du Salt stocké
  const key = deriveKey(password, saltBuffer);

  try {
    // Initialisation du Decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, key, ivBuffer);

    // Définition de l'Auth Tag attendu pour la vérification d'intégrité
    decipher.setAuthTag(authTagBuffer);

    // Déchiffrement du Ciphertext
    let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (err) {
    // Si le mot de passe est faux ou si le texte a été modifié, GCM échoue ici
    const error = new Error('ÉCHEC D\'AUTHENTIFICATION : Mot de passe incorrect ou données altérées.');
    error.code = 'ERR_CRYPTO_AUTH_FAILED';
    error.originalMessage = err.message;
    throw error;
  }
}

