/**
 * ============================================================================
 * SUITE DE TESTS AUTOMATISÉE / حزمة الاختبارات الآلية والتحقق الأمني
 * ============================================================================
 * Auteurs / المؤلفون : Salhi Issam & Chouikha Imane (L3 ISIL - Module PAWEB)
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

console.log('🧪 DÉBUT DES TESTS DE SÉCURITÉ ET FONCTIONNELS / بدء الاختبارات الأمنية والوظيفية...\n');

// TEST 1 : Dérivation de clé avec scrypt / اختبار 1: اشتقاق المفاتيح بـ scrypt
console.log('Test 1 : Vérification de la dérivation de clé (scrypt) / التحقق من اشتقاق المفتاح 256 بت...');
const salt1 = Buffer.alloc(16, 0xaa);
const key1 = deriveKey('MasterPass123!', salt1);
assert.strictEqual(key1.length, 32, 'La clé dérivée doit faire exactement 32 octets (256 bits).');
console.log('  ✅ Clé 256 bits dérivée avec succès / تم اشتقاق المفتاح بنجاح.');

// TEST 2 : Chiffrement et Déchiffrement AES-256-GCM / اختبار 2: التشفير وفك التشفير
console.log('Test 2 : Chiffrement & Déchiffrement AES-256-GCM / دورة التشفير وفك التشفير...');
const secretData = JSON.stringify([{ id: '2024001', nom: 'SALHI', note: 18.5 }]);
const payload = encryptData(secretData, 'SecretMasterPassword123');

assert.ok(payload.salt, 'Le Salt doit être présent / يجب وجود الملح');
assert.ok(payload.iv, 'Le vecteur IV doit être présent / يجب وجود متجه التهيئة');
assert.ok(payload.authTag, 'L\'Auth Tag doit être présent / يجب وجود وسم الأصالة');
assert.ok(payload.ciphertext, 'Le ciphertext doit être présent / يجب وجود النص المشفر');

const decrypted = decryptData(payload, 'SecretMasterPassword123');
assert.strictEqual(decrypted, secretData, 'Les données déchiffrées doivent correspondre exactement.');
console.log('  ✅ Chiffrement et déchiffrement validés avec succès / نجاح عملية التشفير وفك التشفير.');

// TEST 3 : Unicité de l'IV et du Salt / اختبار 3: عدم تكرار متجه التهيئة والملح
console.log('Test 3 : Génération d\'un nouvel IV à chaque opération / توليد IV جديد فريد في كل عملية...');
const payloadA = encryptData('Même contenu', 'MonMotDePasse');
const payloadB = encryptData('Même contenu', 'MonMotDePasse');
assert.notStrictEqual(payloadA.iv, payloadB.iv, 'Chaque chiffrement DOIT produire un IV unique.');
assert.notStrictEqual(payloadA.ciphertext, payloadB.ciphertext, 'Deux chiffrements identiques ne doivent pas avoir le même ciphertext.');
console.log('  ✅ Vecteur d\'initialisation (IV) unique garanti pour chaque chiffrement / ضمان فرادة الـ IV.');

// TEST 4 : Rejet d'un mauvais mot de passe / اختبار 4: رفض كلمة المرور الخاطئة
console.log('Test 4 : Résistance aux mauvais mots de passe (Vérification Auth Tag) / كشف كلمة المرور الخاطئة...');
let authFailed = false;
try {
  decryptData(payload, 'MauvaisMotDePasse');
} catch (err) {
  authFailed = true;
  assert.strictEqual(err.code, 'ERR_CRYPTO_AUTH_FAILED');
}
assert.ok(authFailed, 'Le déchiffrement avec un mauvais mot de passe doit obligatoirement échouer.');
console.log('  ✅ Mauvais mot de passe rejeté via l\'Authentication Tag / تم رفض كلمة المرور بنجاح.');

// TEST 5 : Détection d'altération / اختبار 5: كشف أي تلاعب أو تعديل على الملف المشفر
console.log('Test 5 : Détection de falsification des données chiffrées / كشف التلاعب بالبيانات المشفرة...');
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
assert.ok(tamperDetected, 'Toute altération du ciphertext doit être détectée immédiatement.');
console.log('  ✅ Altération de données détectée avec succès / تم كشف محاولة التلاعب بالبيانات.');

// TEST 6 : Stockage sécurisé sans aucun texte en clair / اختبار 6: انعدام النص الصريح على القرص
console.log('Test 6 : Test de bout en bout du stockage étudiant (Zero Plain Text) / التحقق من انعدام النص الصريح...');
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
console.log('  ✅ Confirmation : Zéro texte en clair présent sur le disque local / تأكيد خلو القرص من النصوص الصريحة.');

// TEST 7 : Recherche, Consultation et Suppression / اختبار 7: العمليات الوظيفية
console.log('Test 7 : Recherche, consultation et suppression d\'étudiant / اختبار البحث والحذف...');
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
console.log('  ✅ Fonctions d\'ajout, recherche et suppression validées / تم التحقق من كافة الدوال الوظيفية.');

// Nettoyage du fichier de test / تنظيف ملف الاختبار المؤقت
if (fs.existsSync(vaultPath)) {
  fs.unlinkSync(vaultPath);
  console.log('\n🧹 Fichier de test temporaire nettoyé / تم تنظيف ملف الاختبار.');
}

console.log('\n=================================================================');
console.log('🎉 TOUS LES TESTS CRYPTOGRAPHIQUES ET FONCTIONNELS ONT RÉUSSI !');
console.log('🎉 كافة الاختبارات الأمنية والوظيفية تمت بنجاح تام وفق المعايير !');
console.log('=================================================================\n');
