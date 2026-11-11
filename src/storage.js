/**
 * ============================================================================
 * MODULE DE STOCKAGE LOCAL CHIFFRÉ / وحدة التخزين المحلي المشفر
 * ============================================================================
 * Auteurs / المؤلفون : Salhi Issam & Chouikha Imane (L3 ISIL - Module PAWEB)
 * Objectif / الهدف : Zéro texte en clair sur le disque dur (Zero Plain Text Storage)
 * ============================================================================
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { encryptData, decryptData } from './crypto.js';

// Résolution déterministe des chemins absolus / تحديد المسارات الفيزيائية للملفات
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');
const VAULT_FILE = path.join(DATA_DIR, 'students_vault.enc.json');

/**
 * Assure l'existence du dossier de données local / ضمان وجود مجلد التخزين
 */
function ensureDataDirectory() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

/**
 * Vérifie si le fichier de coffre-fort existe sur le disque / التحقق من وجود ملف الخزنة
 * @returns {boolean}
 */
export function vaultExists() {
  return fs.existsSync(VAULT_FILE);
}

/**
 * Charge et déchiffre les dossiers étudiants en mémoire vive (RAM).
 * 
 * [FR] Aucune donnée sensible n'est persistée en clair sur le disque physique.
 *      Les enregistrements ne résident en mémoire que durant l'exécution.
 * [AR] قراءة واسترجاع سجلات الطلاب المشفرة مباشرة إلى الذاكرة الحية (RAM).
 *      لا يتم حفظ أي اسم أو علامة أو رقم تعريف بنص واضح على القرص الصلب مطلقاً.
 * 
 * @param {string} masterPassword - Mot de passe maître / كلمة المرور الرئيسية
 * @returns {Array<Object>} Liste des étudiants déchiffrée / قائمة السجلات المسترجعة
 */
export function loadStudents(masterPassword) {
  ensureDataDirectory();

  if (!fs.existsSync(VAULT_FILE)) {
    // Si la base n'existe pas encore, renvoie une liste vide / إرجاع قائمة فارغة إذا كان التشغيل لأول مرة
    return [];
  }

  try {
    const rawContent = fs.readFileSync(VAULT_FILE, 'utf8');
    const encryptedPayload = JSON.parse(rawContent);

    const decryptedText = decryptData(encryptedPayload, masterPassword);
    const students = JSON.parse(decryptedText);

    return Array.isArray(students) ? students : [];
  } catch (error) {
    if (error.code === 'ERR_CRYPTO_AUTH_FAILED') {
      throw error;
    }
    throw new Error(`Erreur lors de la lecture du fichier chiffré / خطأ أثناء قراءة الملف المشفر : ${error.message}`);
  }
}

/**
 * Chiffre et enregistre la collection complète des étudiants sur le disque.
 * 
 * [FR] À chaque écriture, un conteneur JSON cryptographique neuf est produit avec
 *      un Salt et un IV indépendants.
 * [AR] تشفير وحفظ السجلات على القرص الصلب بصيغة مشفرة غير قابلة للقراءة دون المفتاح.
 *      يتم توليد Salt و IV جديدين تماماً في كل عملية حفظ لمنع استنتاج أي أنماط.
 * 
 * @param {Array<Object>} students - Liste des enregistrements / قائمة الطلاب
 * @param {string} masterPassword - Mot de passe maître / كلمة المرور الرئيسية
 */
export function saveStudents(students, masterPassword) {
  ensureDataDirectory();

  const plainJson = JSON.stringify(students, null, 2);
  const encryptedPayload = encryptData(plainJson, masterPassword);

  // Écriture du conteneur cryptographique (aucun texte en clair) / كتابة الحاوية المشفرة
  fs.writeFileSync(VAULT_FILE, JSON.stringify(encryptedPayload, null, 2), 'utf8');
}

/**
 * Renvoie le chemin physique du coffre chiffré / مسار ملف الخزنة
 * @returns {string}
 */
export function getVaultPath() {
  return VAULT_FILE;
}
