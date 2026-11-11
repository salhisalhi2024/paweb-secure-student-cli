/**
 * ============================================================================
 * SUITE DE TESTS AUTOMATISÉE - SECURE STUDENT CLI
 * Auteurs : Salhi Issam & Chouikha Imane (L3 ISIL - Module PAWEB)
 * ============================================================================
 */

import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { encryptData, decryptData, deriveKey } from './src/crypto.js';
import { addStudent, searchStudents, listAllStudents } from './src/studentService.js';
import { getVaultPath, vaultExists } from './src/storage.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧪 DÉBUT DES TESTS DE SÉCURITÉ ET FONCTIONNELS...\n');

// TEST 1 : Dérivation de clé avec scrypt
console.log('Test 1 : Vérification de la dérivation de clé (scrypt)...');
const salt1 = Buffer.alloc(16, 0xaa);
const key1 = deriveKey('MasterPass123!', salt1);
assert.strictEqual(key1.length, 32, 'La clé dérivée doit faire exactement 32 octets (256 bits).');
console.log('  ✅ Clé 256 bits dérivée avec succès.');

// TEST 2 : Chiffrement et Déchiffrement AES-256-GCM
console.log('Test 2 : Chiffrement & Déchiffrement AES-256-GCM (Aller-retour)...');
const secretData = JSON.stringify([{ id: '2024001', nom: 'SALHI', note: 18.5 }]);
const payload = encryptData(secretData, 'SecretMasterPassword123');

assert.ok(payload.salt, 'Le Salt doit être présent');
assert.ok(payload.iv, 'Le vecteur IV doit être présent');
assert.ok(payload.authTag, 'L\'Auth Tag doit être présent');
assert.ok(payload.ciphertext, 'Le ciphertext doit être présent');

const decrypted = decryptData(payload, 'SecretMasterPassword123');
assert.strictEqual(decrypted, secretData, 'Les données déchiffrées doivent correspondre exactement.');
console.log('  ✅ Chiffrement et déchiffrement validés avec succès.');

// TEST 3 : Unicité de l'IV et du Salt (Anti-rejeu et Nonce-reuse prevention)
console.log('Test 3 : Génération d\'un nouvel IV à chaque opération...');
const payloadA = encryptData('Même contenu', 'MonMotDePasse');
const payloadB = encryptData('Même contenu', 'MonMotDePasse');
assert.notStrictEqual(payloadA.iv, payloadB.iv, 'Chaque chiffrement DOIT produire un IV unique.');
assert.notStrictEqual(payloadA.ciphertext, payloadB.ciphertext, 'Deux chiffrements identiques ne doivent pas avoir le même ciphertext.');
console.log('  ✅ Vecteur d\'initialisation (IV) unique garanti pour chaque chiffrement.');

// TEST 4 : Rejet d'un mauvais mot de passe (Échec Auth Tag)
console.log('Test 4 : Résistance aux mauvais mots de passe (Vérification Auth Tag)...');
let authFailed = false;
try {
  decryptData(payload, 'MauvaisMotDePasse');
} catch (err) {
  authFailed = true;
  assert.strictEqual(err.code, 'ERR_CRYPTO_AUTH_FAILED');
}
assert.ok(authFailed, 'Le déchiffrement avec un mauvais mot de passe doit obligatoirement échouer.');
console.log('  ✅ Mauvais mot de passe rejeté via l\'Authentication Tag.');

// TEST 5 : Détection d'altération / falsification des données (Tampering detection)
console.log('Test 5 : Détection de falsification des données chiffrées (Intégrité)...');
let tamperDetected = false;
const tamperedPayload = { ...payload };
// Modifier un seul caractère hexadécimal du ciphertext
const originalHex = tamperedPayload.ciphertext;
const modifiedHex = (originalHex[0] === 'a' ? 'b' : 'a') + originalHex.slice(1);
tamperedPayload.ciphertext = modifiedHex;

try {
  decryptData(tamperedPayload, 'SecretMasterPassword123');
} catch (err) {
  tamperDetected = true;
  assert.strictEqual(err.code, 'ERR_CRYPTO_AUTH_FAILED');
}
assert.ok(tamperDetected, 'Toute altération du ciphertext doit être détectée immédiatement.');
console.log('  ✅ Altération de données détectée avec succès (Intégrité préservée).');

// TEST 6 : Stockage sécurisé sans aucun texte en clair sur le disque
console.log('Test 6 : Test de bout en bout du stockage étudiant (Zero Plain Text)...');
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
assert.ok(!fileContent.includes('TESTNOM'), 'Le nom de l\'étudiant NE DOIT PAS apparaître en clair sur le disque.');
assert.ok(!fileContent.includes('TestPrenom'), 'Le prénom NE DOIT PAS apparaître en clair.');
assert.ok(!fileContent.includes('17.25'), 'La note NE DOIT PAS apparaître en clair.');
console.log('  ✅ Confirmation : Zéro texte en clair présent sur le disque local.');

// TEST 7 : Recherche et Liste
console.log('Test 7 : Recherche et affichage des étudiants...');
const found = searchStudents('TESTNOM', testPassword);
assert.strictEqual(found.length, 1);
assert.strictEqual(found[0].id, '2024999');

const { students, stats } = listAllStudents(testPassword);
assert.ok(students.length >= 1);
assert.ok(stats.count >= 1);
console.log('  ✅ Fonctions d\'ajout, recherche et listage validées.');

// Nettoyage du fichier de test
if (fs.existsSync(vaultPath)) {
  fs.unlinkSync(vaultPath);
  console.log('\n🧹 Fichier de test temporaire nettoyé.');
}

console.log('\n=================================================================');
console.log('🎉 TOUS LES TESTS CRYPTOGRAPHIQUES ET FONCTIONNELS ONT RÉUSSI !');
console.log('=================================================================\n');
