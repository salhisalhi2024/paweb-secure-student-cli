/**
 * ============================================================================
 * SCRIPT DE DÉMONSTRATION PÉDAGOGIQUE (SEED DATA)
 * نص برمجي لإنشاء بيانات تجريبية فورية للتقييم الأكاديمي
 * ============================================================================
 * Auteurs / المؤلفون : Salhi Issam & Chouikha Imane (L3 ISIL - Module PAWEB)
 * ============================================================================
 */

import { addStudent } from './src/studentService.js';
import { vaultExists, getVaultPath } from './src/storage.js';
import { askPassword } from './src/prompt.js';

console.log(`
================================================================================
   🌱 GÉNÉRATEUR DE DONNÉES DE DÉMONSTRATION / توليد بيانات طلاب تجريبية
   Conforme au cursus L3 ISIL - Module PAWEB (المنهاج الجامعي الجزائري)
================================================================================`);

const sampleStudents = [
  { id: '2024001', nom: 'SALHI', prenom: 'Issam', filiere: 'L3 ISIL', module: 'PAWEB', grade: 18.5 },
  { id: '2024002', nom: 'CHOUIKHA', prenom: 'Imane', filiere: 'L3 ISIL', module: 'PAWEB', grade: 18.0 },
  { id: '2024003', nom: 'BENALI', prenom: 'Youcef', filiere: 'L3 ISIL', module: 'PAWEB', grade: 15.75 },
  { id: '2024004', nom: 'MEZIANI', prenom: 'Amine', filiere: 'L3 ISIL', module: 'PAWEB', grade: 13.5 },
  { id: '2024005', nom: 'KACI', prenom: 'Nadia', filiere: 'L3 ISIL', module: 'PAWEB', grade: 11.0 }
];

async function run() {
  const pwd = await askPassword('Définissez ou entrez le mot de passe maître pour initialiser le coffre : ');
  if (!pwd || pwd.length < 6) {
    console.log('❌ Le mot de passe doit comporter au moins 6 caractères.');
    process.exit(1);
  }

  console.log('\nChiffrement et insertion des enregistrements d\'étudiants...');
  for (const s of sampleStudents) {
    try {
      addStudent(s, pwd);
      console.log(`  ✅ Étudiant chiffré et inséré : ${s.id} - ${s.nom} ${s.prenom} (${s.grade}/20)`);
    } catch (err) {
      console.log(`  ⚠️ Note pour ${s.id} : ${err.message}`);
    }
  }

  console.log('\n🎉 Base de données chiffrée initialisée avec succès !');
  console.log(`Fichier protégé par AES-256-GCM : ${getVaultPath()}`);
  console.log('Vous pouvez maintenant lancer : secure-student-cli list');
}

run();

