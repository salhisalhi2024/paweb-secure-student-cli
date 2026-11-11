/**
 * ============================================================================
 * SUITE DE TESTS AUTOMATISEE
 * ============================================================================
 * Auteurs : Salhi Issam & Chouikha Imane (L3 ISIL - Module PAWEB)
 * ============================================================================
 */

import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { encryptData, decryptData, deriveKey } from './src/crypto.js';
import { addStudent, searchStudents, listAllStudents, deleteStudent, getStudentById } from './src/studentService.js';
import { getVaultPath, vaultExists } from './src/storage.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('[TEST] DEBUT DES TESTS DE SECURITE ET FONCTIONNELS...\n');

// TEST 1 : Derivation de cle avec scrypt
console.log('Test 1 : Verification de la derivation de cle (scrypt)...');
const salt1 = Buffer.alloc(16, 0xaa);
const key1 = deriveKey('MasterPass123!', salt1);
assert.strictEqual(key1.length, 32, 'La cle derivee doit faire exactement 32 octets (256 bits).');
console.log('  [OK] Cle 256 bits derivee avec succes.');

// TEST 2 : Chiffrement et Dechiffrement AES-256-GCM
console.log('Test 2 : Chiffrement & Dechiffrement AES-256-GCM (Aller-retour)...');
const secretData = JSON.stringify([{ id: '2024001', nom: 'SALHI', note: 18.5 }]);
const payload = encryptData(secretData, 'SecretMasterPassword123');

assert.ok(payload.salt, 'Le Salt doit etre present.');
assert.ok(payload.iv, 'Le vecteur IV doit etre present.');
assert.ok(payload.authTag, 'L\'Auth Tag doit etre present.');
assert.ok(payload.ciphertext, 'Le ciphertext doit etre present.');

const decrypted = decryptData(payload, 'SecretMasterPassword123');
assert.strictEqual(decrypted, secretData, 'Les donnees dechiffrees doivent correspondre exactement.');
console.log('  [OK] Chiffrement et dechiffrement valides avec succes.');

// TEST 3 : Unicite de l'IV et du Salt
console.log('Test 3 : Generation d\'un nouvel IV a chaque operation...');
const payloadA = encryptData('Meme contenu', 'MonMotDePasse');
const payloadB = encryptData('Meme contenu', 'MonMotDePasse');
assert.notStrictEqual(payloadA.iv, payloadB.iv, 'Chaque chiffrement DOIT produire un IV unique.');
assert.notStrictEqual(payloadA.ciphertext, payloadB.ciphertext, 'Deux chiffrements identiques ne doivent pas avoir le meme ciphertext.');
console.log('  [OK] Vecteur d\'initialisation (IV) unique garanti pour chaque chiffrement.');

// TEST 4 : Rejet d'un mauvais mot de passe
console.log('Test 4 : Resistance aux mauvais mots de passe (Verification Auth Tag)...');
let authFailed = false;
try {
  decryptData(payload, 'MauvaisMotDePasse');
} catch (err) {
  authFailed = true;
  assert.strictEqual(err.code, 'ERR_CRYPTO_AUTH_FAILED');
}
assert.ok(authFailed, 'Le dechiffrement avec un mauvais mot de passe doit obligatoirement echouer.');
console.log('  [OK] Mauvais mot de passe rejete via l\'Authentication Tag.');

// TEST 5 : Detection d'alteration
console.log('Test 5 : Detection de falsification des donnees chiffrees (Integrite)...');
let tamperDetected = false;
const tamperedPayload = { ...payload };
const originalHex = tamperedPayload.ciphertext;
const modifiedHex = (originalHex[0] === 'a' ? 'b' : 'a') + originalHex.slice(1);
tamperedPayload.ciphertext = modifiedHex;

try {
  decryptData(tamperedPayload, 'SecretMasterPassword123');
} catch (err) {
  tamperDetected = true;
  assert.strictEqual(err.code, 'ERR_CRYPTO_AUTH_FAILED');
}
assert.ok(tamperDetected, 'Toute alteration du ciphertext doit etre detectee immediatement.');
console.log('  [OK] Alteration de donnees detectee avec succes (Integrite preservee).');

// TEST 6 : Stockage securise sans aucun texte en clair
console.log('Test 6 : Test de bout en bout du stockage etudiant (Zero Plain Text)...');
const testPassword = 'AcademicEvaluation2026!';
const studentSample = {
  id: '2024999',
  nom: 'TESTNOM',
  prenom: 'TestPrenom',
  filiere: 'L3 ISIL',
  module: 'PAWEB',
  grade: 17.25
};

addStudent(studentSample, testPassword);
const vaultPath = getVaultPath();
assert.ok(fs.existsSync(vaultPath), 'Le fichier de coffre-fort doit exister sur le disque.');

const fileContent = fs.readFileSync(vaultPath, 'utf8');
assert.ok(!fileContent.includes('TESTNOM'), 'Le nom de l\'etudiant NE DOIT PAS apparaitre en clair sur le disque.');
assert.ok(!fileContent.includes('TestPrenom'), 'Le prenom NE DOIT PAS apparaitre en clair.');
assert.ok(!fileContent.includes('17.25'), 'La note NE DOIT PAS apparaitre en clair.');
console.log('  [OK] Confirmation : Zero texte en clair present sur le disque local.');

// TEST 7 : Recherche, Consultation et Suppression
console.log('Test 7 : Recherche, consultation et suppression d\'etudiant...');
const found = searchStudents('TESTNOM', testPassword);
assert.strictEqual(found.length, 1);
assert.strictEqual(found[0].id, '2024999');

const single = getStudentById('2024999', testPassword);
assert.ok(single);
assert.strictEqual(single.nom, 'TESTNOM');

const deleted = deleteStudent('2024999', testPassword);
assert.strictEqual(deleted, true);

const afterDelete = searchStudents('TESTNOM', testPassword);
assert.strictEqual(afterDelete.length, 0);
console.log('  [OK] Fonctions d\'ajout, recherche et suppression validees.');

// Nettoyage du fichier de test
if (fs.existsSync(vaultPath)) {
  fs.unlinkSync(vaultPath);
  console.log('\n[INFO] Fichier de test temporaire nettoye.');
}

console.log('\n=================================================================');
console.log('[SUCCES] TOUS LES TESTS CRYPTOGRAPHIQUES ET FONCTIONNELS ONT REUSSI !');
console.log('=================================================================\n');
