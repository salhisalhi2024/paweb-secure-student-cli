/**
 * ============================================================================
 * SCRIPT DE DEMONSTRATION PEDAGOGIQUE (SEED DATA)
 * ============================================================================
 * Auteurs : Salhi Issam & Chouikha Imane (L3 ISIL - Module PAWEB)
 * ============================================================================
 */

import { addStudent } from './src/studentService.js';
import { vaultExists, getVaultPath } from './src/storage.js';
import { askPassword } from './src/prompt.js';

console.log(`
================================================================================
   GENERATEUR DE DONNEES DE DEMONSTRATION (SEED)
   Conforme au cursus L3 ISIL - Module PAWEB
================================================================================`);

const sampleStudents = [
  { id: '2024001', nom: 'SALHI', prenom: 'Issam', filiere: 'L3 ISIL', module: 'PAWEB', grade: 18.5 },
  { id: '2024002', nom: 'CHOUIKHA', prenom: 'Imane', filiere: 'L3 ISIL', module: 'PAWEB', grade: 18.0 },
  { id: '2024003', nom: 'BENALI', prenom: 'Youcef', filiere: 'L3 ISIL', module: 'PAWEB', grade: 15.75 },
  { id: '2024004', nom: 'MEZIANI', prenom: 'Amine', filiere: 'L3 ISIL', module: 'PAWEB', grade: 13.5 },
  { id: '2024005', nom: 'KACI', prenom: 'Nadia', filiere: 'L3 ISIL', module: 'PAWEB', grade: 11.0 }
];

async function run() {
  const pwd = await askPassword('Definissez ou entrez le mot de passe maitre pour initialiser le coffre : ');
  if (!pwd || pwd.length < 6) {
    console.log('[ERREUR] Le mot de passe doit comporter au moins 6 caracteres.');
    process.exit(1);
  }

  console.log('\nChiffrement et insertion des enregistrements d\'etudiants...');
  for (const s of sampleStudents) {
    try {
      addStudent(s, pwd);
      console.log(`  [OK] Etudiant chiffre et insere : ${s.id} - ${s.nom} ${s.prenom} (${s.grade}/20)`);
    } catch (err) {
      console.log(`  [ATTENTION] Note pour ${s.id} : ${err.message}`);
    }
  }

  console.log('\n[SUCCES] Base de donnees chiffree initialisee avec succes !');
  console.log(`Fichier protege par AES-256-GCM : ${getVaultPath()}`);
  console.log('Vous pouvez maintenant lancer : secure-student-cli list');
}

run();
