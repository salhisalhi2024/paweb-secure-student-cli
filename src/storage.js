/**
 * ============================================================================
 * MODULE DE STOCKAGE LOCAL CHIFFRE
 * ============================================================================
 * Auteurs : Salhi Issam & Chouikha Imane (L3 ISIL - Module PAWEB)
 * Objectif : Zero texte en clair sur le disque dur (Zero Plain Text Storage)
 * ============================================================================
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { encryptData, decryptData } from './crypto.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');
const VAULT_FILE = path.join(DATA_DIR, 'students_vault.enc.json');

/**
 * Assure l'existence du dossier de donnees local.
 */
function ensureDataDirectory() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

/**
 * Verifie si le fichier de coffre-fort existe sur le disque.
 * @returns {boolean}
 */
export function vaultExists() {
  return fs.existsSync(VAULT_FILE);
}

/**
 * Charge et dechiffre les dossiers etudiants en memoire vive (RAM).
 * 
 * @param {string} masterPassword - Mot de passe maitre
 * @returns {Array<Object>} Liste des etudiants dechiffree
 */
export function loadStudents(masterPassword) {
  ensureDataDirectory();

  if (!fs.existsSync(VAULT_FILE)) {
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
    throw new Error(`Erreur lors de la lecture du fichier chiffre : ${error.message}`);
  }
}

/**
 * Chiffre et enregistre la collection complete des etudiants sur le disque.
 * 
 * @param {Array<Object>} students - Liste des enregistrements
 * @param {string} masterPassword - Mot de passe maitre
 */
export function saveStudents(students, masterPassword) {
  ensureDataDirectory();

  const plainJson = JSON.stringify(students, null, 2);
  const encryptedPayload = encryptData(plainJson, masterPassword);

  fs.writeFileSync(VAULT_FILE, JSON.stringify(encryptedPayload, null, 2), 'utf8');
}

/**
 * Renvoie le chemin physique du coffre chiffre.
 * @returns {string}
 */
export function getVaultPath() {
  return VAULT_FILE;
}
