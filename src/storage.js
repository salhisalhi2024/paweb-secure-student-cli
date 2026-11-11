/**
 * ============================================================================
 * MODULE DE STOCKAGE LOCAL CHIFFRÉ (ENCRYPTED LOCAL STORAGE MODULE)
 * Auteurs : Salhi Issam & Chouikha Imane (L3 ISIL - Module PAWEB)
 * ============================================================================
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { encryptData, decryptData } from './crypto.js';

// Résolution du chemin absolu du fichier de base de données chiffrée
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');
const VAULT_FILE = path.join(DATA_DIR, 'students_vault.enc.json');

/**
 * Assure l'existence du répertoire de données local.
 */
function ensureDataDirectory() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

/**
 * Vérifie si le fichier de données chiffrées existe sur le disque.
 * @returns {boolean}
 */
export function vaultExists() {
  return fs.existsSync(VAULT_FILE);
}

/**
 * Charge et déchiffre la liste des étudiants en mémoire.
 * 
 * ملاحظة بالعربية (Note en Arabe) :
 * لا يتم تخزين أي سجل بصيغة نصية واضحة على القرص الصلب نهائياً.
 * يتم قراءة الملف المشفر وفك تشفيره حصراً في ذاكرة الرام (RAM) أثناء تشغيل البرنامج،
 * ثم يتلاشى فور انتهاء العملية.
 * 
 * @param {string} masterPassword - Mot de passe maître.
 * @returns {Array<Object>} Liste des étudiants déchiffrée.
 */
export function loadStudents(masterPassword) {
  ensureDataDirectory();

  if (!fs.existsSync(VAULT_FILE)) {
    // Si le fichier n'existe pas encore, renvoie une liste vide
    return [];
  }

  try {
    const rawContent = fs.readFileSync(VAULT_FILE, 'utf8');
    const encryptedPayload = JSON.parse(rawContent);

    const decryptedText = decryptData(encryptedPayload, masterPassword);
    const students = JSON.parse(decryptedText);

    if (!Array.isArray(students)) {
      return [];
    }

    return students;
  } catch (error) {
    if (error.code === 'ERR_CRYPTO_AUTH_FAILED') {
      throw error;
    }
    throw new Error(`Erreur lors de la lecture du fichier chiffré : ${error.message}`);
  }
}

/**
 * Chiffre et enregistre la liste complète des étudiants sur le disque local.
 * 
 * ملاحظة بالعربية (Note en Arabe) :
 * يتم إنشاء ملف آمن مشفر بتقنية AES-256-GCM. في كل عملية حفظ،
 * يتم توليد Salt و IV جديدين بالكامل لحماية السجلات من أي هجمات تكرارية.
 * 
 * @param {Array<Object>} students - Liste des enregistrements étudiants.
 * @param {string} masterPassword - Mot de passe maître pour le chiffrement.
 */
export function saveStudents(students, masterPassword) {
  ensureDataDirectory();

  const plainJson = JSON.stringify(students, null, 2);
  const encryptedPayload = encryptData(plainJson, masterPassword);

  // Écriture du conteneur cryptographique JSON sur le disque (AUCUN texte en clair)
  fs.writeFileSync(VAULT_FILE, JSON.stringify(encryptedPayload, null, 2), 'utf8');
}

/**
 * Renvoie le chemin d'accès au fichier de coffre-fort chiffré.
 * @returns {string}
 */
export function getVaultPath() {
  return VAULT_FILE;
}
