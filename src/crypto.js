/**
 * ============================================================================
 * MODULE DE SÉCURITÉ CRYPTOGRAPHIQUE / وحدة الأمان والتشفير الرياضي
 * ============================================================================
 * Auteurs / المؤلفون : Salhi Issam & Chouikha Imane
 * Niveau / المستوى : 3ème année L3 ISIL (LMD) - Module PAWEB (المنهاج الجامعي الجزائري)
 * Algorithme / خوارزمية التشفير : AES-256-GCM (Authenticated Encryption)
 * Dérivation de clé / اشتقاق المفاتيح : scryptSync (KDF - Key Derivation Function)
 * ============================================================================
 */

import crypto from 'node:crypto';

// Configuration cryptographique standard et robuste / الإعدادات المعيارية للتشفير
const ALGORITHM = 'aes-256-gcm'; // Mode de chiffrement symétrique authentifié / وضع التشفير المتناظر الموثق
const KEY_LENGTH = 32;          // 256 bits (32 octets) pour la clé de chiffrement / طول المفتاح: 256 بت
const IV_LENGTH = 12;           // 96 bits (12 octets) recommandé par le NIST SP 800-38D / طول متجه التهيئة القياسي
const SALT_LENGTH = 16;         // 128 bits (16 octets) de Salt cryptographique / طول الملح التشفيري
const AUTH_TAG_LENGTH = 16;     // 128 bits (16 octets) pour l'étiquette d'authentification / وسم التحقق من السلامة

/**
 * Dérive une clé cryptographique symétrique de 256 bits à partir d'un mot de passe maître et d'un Salt.
 * 
 * [FR] Utilise l'algorithme scrypt (KDF) qui est difficile à paralléliser et gourmand en mémoire (Memory-hard),
 *      neutralisant efficacement les attaques par force brute (Brute-Force) et les fermes de GPU/ASIC.
 * [AR] تقوم هذه الدالة باشتقاق مفتاح تشفير متناظر بطول 256 بت انطلاقاً من كلمة المرور الرئيسية والملح (Salt).
 *      تعتمد على دالة scrypt المصممة لتستهلك قدراً محسوباً من الذاكرة والمعالجة (Memory-hard problem)،
 *      مما يعطل هجمات القوة الغاشمة وهجمات القواميس عبر البطاقات الرسومية المتقدمة.
 * 
 * @param {string} password - Mot de passe maître saisi à l'exécution / كلمة المرور المدخلة
 * @param {Buffer} salt - Sel cryptographique aléatoire / ملح عشوائي
 * @returns {Buffer} Clé binaire dérivée de 32 octets (256 bits) / مفتاح مشتق بطول 32 بايت
 */
export function deriveKey(password, salt) {
  if (!password || typeof password !== 'string') {
    throw new Error('Le mot de passe doit être une chaîne de caractères non vide / يجب أن تكون كلمة المرور نصاً غير فارغ.');
  }
  if (!salt || !Buffer.isBuffer(salt) || salt.length !== SALT_LENGTH) {
    throw new Error(`Le Salt doit être un Buffer de ${SALT_LENGTH} octets / يجب أن يكون الملح مصفوفة بايت بطول ${SALT_LENGTH}.`);
  }

  // Paramètres scrypt recommandés selon les standards NIST / إعدادات scrypt المتوافقة مع معايير الأمان الدولية
  return crypto.scryptSync(password, salt, KEY_LENGTH, {
    N: 16384, // Coût CPU/Mémoire (Iterations) / معامل استهلاك المعالج والذاكرة
    r: 8,     // Taille des blocs internes / حجم الكتلة
    p: 1      // Degré de parallélisation / التوازي
  });
}

/**
 * Chiffre des données sensibles locales (étudiants, relevés) en AES-256-GCM.
 * Génère OBLIGATOIREMENT un nouvel IV (Initialization Vector) et un nouveau Salt à chaque appel.
 * 
 * [FR] Le mode GCM combine le chiffrement par compteur (CTR) et l'authentification de Galois (GMAC).
 *      Il garantit la Confidentialité (Confidentiality) et l'Intégrité (Integrity - AEAD).
 * [AR] تشفير سجلات الطلاب والدرجات الحساسة محلياً باستخدام خوارزمية AES-256-GCM.
 *      يتم إلزامياً توليد متجه تهيئة (IV) عشوائي جديد وملح (Salt) فريد مع كل عملية حفظ لحماية البيانات
 *      من ثغرة إعادة استخدام المفتاح (Nonce Reuse Disaster) ومنع ربط العمليات ببعضها.
 * 
 * @param {string|Object} plainText - Données en clair à chiffrer / البيانات الأصلية قبل التشفير
 * @param {string} password - Mot de passe maître / كلمة المرور الرئيسية
 * @returns {Object} Conteneur sécurisé { algorithm, salt, iv, authTag, ciphertext, createdAt }
 */
export function encryptData(plainText, password) {
  // Sérialisation si l'entrée est un objet JSON / تحويل الكائن إلى نص تسلسلي إذا لزم الأمر
  const dataString = typeof plainText === 'string' ? plainText : JSON.stringify(plainText);

  // 1. Génération d'un Sel cryptographique aléatoire / توليد ملح عشوائي جديد
  const salt = crypto.randomBytes(SALT_LENGTH);

  // 2. Dérivation de la clé secrète via scrypt / اشتقاق المفتاح السري عبر scrypt
  const key = deriveKey(password, salt);

  // 3. Génération d'un Vecteur d'Initialisation (IV) unique / توليد متجه تهيئة عشوائي فريد
  const iv = crypto.randomBytes(IV_LENGTH);

  // 4. Initialisation du Cipher AES-256-GCM / تهيئة محرك التشفير
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  // 5. Chiffrement effectif du flux de données / التشفير الفعلي للبيانات
  let encrypted = cipher.update(dataString, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  // 6. Extraction de l'Authentication Tag (128 bits) / استخراج وسم التحقق من السلامة والأصالة
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
 * Déchiffre les données sécurisées et valide l'intégrité via l'Authentication Tag.
 * 
 * [FR] Si le mot de passe est erroné ou si le moindre bit du fichier chiffré a été altéré,
 *      le déchiffrement échoue immédiatement lors de la vérification de l'Auth Tag.
 * [AR] فك تشفير البيانات والتحقق الرياضي الصارم من عدم التلاعب عبر وسم الأصالة (Auth Tag).
 *      إذا كانت كلمة المرور غير صحيحة أو تم تعديل بايت واحد فقط من الملف على القرص،
 *      ستفشل العملية فوراً وسيتم حجب البيانات تماماً لمنع أي تسريب.
 * 
 * @param {Object} encryptedPayload - Conteneur chiffré { salt, iv, authTag, ciphertext }
 * @param {string} password - Mot de passe maître / كلمة المرور الرئيسية
 * @returns {string} Données déchiffrées en clair / البيانات الأصلية المسترجعة
 * @throws {Error} En cas d'échec d'authentification ou altération de données
 */
export function decryptData(encryptedPayload, password) {
  const { salt, iv, authTag, ciphertext } = encryptedPayload;

  if (!salt || !iv || !authTag || ciphertext === undefined) {
    throw new Error('Structure du conteneur chiffré invalide ou corrompue / هيكل الحاوية المشفرة تالف أو غير صالح.');
  }

  // Conversion des chaînes hexadécimales en Buffers binaires / تحويل النصوص السداسية العشرية إلى مصفوفات ثنائية
  const saltBuffer = Buffer.from(salt, 'hex');
  const ivBuffer = Buffer.from(iv, 'hex');
  const authTagBuffer = Buffer.from(authTag, 'hex');

  // Dérivation de la même clé avec le Salt d'origine / اشتقاق نفس المفتاح باستخدام الملح المخزن
  const key = deriveKey(password, saltBuffer);

  try {
    // Initialisation du Decipher / تهيئة محرك فك التشفير
    const decipher = crypto.createDecipheriv(ALGORITHM, key, ivBuffer);

    // Injection de l'Auth Tag pour vérification d'intégrité / تزويد المحرك بوسم التحقق الأصلي
    decipher.setAuthTag(authTagBuffer);

    // Déchiffrement du Ciphertext / فك التشفير
    let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (err) {
    // Échec de l'Authentication Tag : Mot de passe faux ou Altération / فشل التحقق: كلمة مرور خاطئة أو تلاعب
    const error = new Error('ÉCHEC D\'AUTHENTIFICATION : Mot de passe incorrect ou données altérées / فشل التحقق: كلمة المرور خاطئة أو الملف معدل.');
    error.code = 'ERR_CRYPTO_AUTH_FAILED';
    error.originalMessage = err.message;
    throw error;
  }
}
