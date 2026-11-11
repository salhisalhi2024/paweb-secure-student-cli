#!/usr/bin/env node

/**
 * ============================================================================
 * SECURE STUDENT CLI - INTERFACE EN LIGNE DE COMMANDE (CLI)
 * ============================================================================
 * Sujet 2 : Gestionnaire sécurisé de dossiers et relevés de notes d'étudiants
 * Auteurs : Salhi Issam & Chouikha Imane
 * Niveau   : 3ème année L3 ISIL - Module PAWEB
 * Chiffrement : AES-256-GCM strictly | Dérivation de clé : scryptSync
 * ============================================================================
 */

import { vaultExists, getVaultPath } from './src/storage.js';
import {
  addStudent,
  searchStudents,
  listAllStudents,
  getStudentById,
  deleteStudent,
  formatStudent,
  formatTranscript
} from './src/studentService.js';
import { askQuestion, askPassword } from './src/prompt.js';

// En-tête d'accueil stylisé
function displayBanner() {
  console.log(`
================================================================================
   🔐 SECURE STUDENT CLI - SYSTÈME DE GESTION SÉCURISÉ D'ÉTUDIANTS
   Chiffrement Militaire AES-256-GCM | 100% Hors-ligne | Zero Plain Text
   -----------------------------------------------------------------------------
   Auteurs : Salhi Issam & Chouikha Imane
   Promotion : L3 ISIL - Module PAWEB
================================================================================`);
}

/**
 * Demande et valide le mot de passe maître de l'utilisateur.
 * Si le coffre n'existe pas encore, invite à définir un nouveau mot de passe avec confirmation.
 * 
 * ملاحظة بالعربية (Note en Arabe) :
 * التحقق من كلمة المرور الرئيسية. إذا كان النظام يُشغّل لأول مرة،
 * يُطلب من المستخدم تحديد كلمة مرور جديدة وتأكيدها.
 */
async function getMasterPassword() {
  const exists = vaultExists();

  if (!exists) {
    console.log('\n[INFO] Aucun coffre-fort chiffré détecté.');
    console.log('Veuillez initialiser votre mot de passe maître pour protéger la base de données :');

    while (true) {
      const p1 = await askPassword('Nouveau mot de passe maître : ');
      if (!p1 || p1.length < 6) {
        console.log('⚠️ Le mot de passe doit comporter au moins 6 caractères pour des raisons de sécurité.\n');
        continue;
      }

      const p2 = await askPassword('Confirmez le mot de passe maître : ');
      if (p1 !== p2) {
        console.log('⚠️ Les mots de passe ne correspondent pas. Veuillez réessayer.\n');
        continue;
      }

      console.log('✅ Mot de passe maître configuré avec succès !\n');
      return p1;
    }
  }

  // Si le coffre existe déjà
  const pwd = await askPassword('🔑 Entrez le mot de passe maître pour déverrouiller le coffre : ');
  if (!pwd) {
    throw new Error('Le mot de passe maître ne peut pas être vide.');
  }
  return pwd;
}

/**
 * Action : Ajouter un étudiant
 */
async function handleAdd(password) {
  console.log('\n--- AJOUT D\'UN NOUVEL ÉTUDIANT ---');
  const id = await askQuestion('Matricule / Identifiant étudiant (ex: 2024001) : ');
  if (!id) {
    console.log('❌ Le matricule est obligatoire.');
    return;
  }

  const nom = await askQuestion('Nom de famille (ex: BENALI) : ');
  if (!nom) {
    console.log('❌ Le nom est obligatoire.');
    return;
  }

  const prenom = await askQuestion('Prénom (ex: Mohamed) : ');
  if (!prenom) {
    console.log('❌ Le prénom est obligatoire.');
    return;
  }

  const filiere = (await askQuestion('Filière [L3 ISIL] : ')) || 'L3 ISIL';
  const module = (await askQuestion('Module [PAWEB] : ')) || 'PAWEB';

  const noteStr = await askQuestion('Note / Moyenne sur 20 (ex: 16.5) : ');
  const grade = Number.parseFloat(noteStr);
  if (Number.isNaN(grade) || grade < 0 || grade > 20) {
    console.log('❌ La note doit être un nombre valide entre 0 et 20.');
    return;
  }

  const student = addStudent({ id, nom, prenom, filiere, module, grade }, password);
  console.log('\n✅ Étudiant chiffré avec succès et enregistré dans le coffre-fort !');
  console.log(formatStudent(student));
}

/**
 * Action : Rechercher un étudiant
 */
async function handleSearch(password, initialQuery = null) {
  const query = initialQuery || (await askQuestion('\n🔍 Entrez le matricule, nom ou prénom à rechercher : '));
  if (!query) {
    console.log('❌ La requête de recherche ne peut pas être vide.');
    return;
  }

  const results = searchStudents(query, password);
  console.log(`\n--- RÉSULTATS DE RECHERCHE POUR "${query}" (${results.length} trouvé(s)) ---`);

  if (results.length === 0) {
    console.log('Aucun étudiant ne correspond à vos critères de recherche.');
    return;
  }

  for (const s of results) {
    console.log(formatStudent(s));
  }
}

/**
 * Action : Lister tous les étudiants
 */
async function handleList(password) {
  const { students, stats } = listAllStudents(password);
  console.log(`\n--- LISTE GLOBALE DES ÉTUDIANTS (${stats.count} enregistrement(s)) ---`);

  if (students.length === 0) {
    console.log('Le coffre-fort ne contient actuellement aucun étudiant.');
    return;
  }

  for (const s of students) {
    console.log(formatStudent(s));
  }

  console.log(`
  📊 STATISTIQUES DE LA PROMOTION :
  --------------------------------------------------
  • Effectif total       : ${stats.count} étudiant(s)
  • Moyenne générale     : ${stats.moyenneGenerale} / 20
  • Note maximale        : ${stats.maxNote} / 20
  • Note minimale        : ${stats.minNote} / 20
  --------------------------------------------------`);
}

/**
 * Action : Afficher un relevé de notes officiel (Bulletin)
 */
async function handleTranscript(password, initialId = null) {
  const id = initialId || (await askQuestion('\n🎓 Entrez le matricule de l\'étudiant pour le relevé : '));
  if (!id) {
    console.log('❌ Le matricule est obligatoire.');
    return;
  }

  const student = getStudentById(id, password);
  if (!student) {
    console.log(`❌ Aucun étudiant trouvé avec le matricule "${id}".`);
    return;
  }

  console.log(formatTranscript(student));
}

/**
 * Action : Supprimer un étudiant
 */
async function handleDelete(password, initialId = null) {
  const id = initialId || (await askQuestion('\n🗑️ Entrez le matricule de l\'étudiant à supprimer : '));
  if (!id) {
    console.log('❌ Le matricule est obligatoire.');
    return;
  }

  const student = getStudentById(id, password);
  if (!student) {
    console.log(`❌ Aucun étudiant trouvé avec le matricule "${id}".`);
    return;
  }

  const confirm = await askQuestion(`⚠️ Êtes-vous sûr de vouloir supprimer définitivement ${student.nom} ${student.prenom} (${id}) ? (o/n) : `);
  if (confirm.toLowerCase() !== 'o' && confirm.toLowerCase() !== 'oui' && confirm.toLowerCase() !== 'y') {
    console.log('Opération annulée.');
    return;
  }

  const success = deleteStudent(id, password);
  if (success) {
    console.log(`\n✅ L'étudiant "${id}" a été supprimé avec succès. Le coffre a été ré-encrypté avec un nouvel IV.`);
  } else {
    console.log('❌ Échec de la suppression.');
  }
}

/**
 * Action : Afficher les détails de sécurité et statut du coffre
 */
function handleStatus() {
  const exists = vaultExists();
  console.log(`
--- STATUT DU COFFRE-FORT DE SÉCURITÉ ---
• Emplacement du fichier : ${getVaultPath()}
• État du stockage       : ${exists ? 'Chiffré sur disque (AES-256-GCM actif)' : 'Non initialisé (Aucun fichier sur disque)'}
• Algorithme             : AES-256-GCM (Authenticated Encryption)
• Dérivation de Clé      : scryptSync (Memory-hard KDF, N=16384, r=8, p=1)
• Vecteur d'init. (IV)   : 96 bits (12 octets) aléatoire généré à chaque écriture
• Protection Intégrité   : Authentication Tag 128 bits
• Connexion Réseau       : 0 API Web (100% Fonctionnement Hors-ligne local)
`);
}

/**
 * Menu interactif principal
 */
async function interactiveMenu() {
  let running = true;

  while (running) {
    console.log(`
================ MENU PRINCIPAL ================
  [1] ➕ Ajouter un nouvel étudiant
  [2] 🔍 Rechercher un étudiant
  [3] 📋 Lister tous les étudiants & relevés
  [4] 🎓 Relevé de notes officiel (Bulletin)
  [5] 🗑️  Supprimer un étudiant
  [6] 🛡️  Statut du coffre et sécurité
  [7] 🚪 Quitter l'application
================================================`);

    const choice = await askQuestion('Sélectionnez une option [1-7] : ');

    try {
      switch (choice) {
        case '1': {
          const pwd = await getMasterPassword();
          await handleAdd(pwd);
          break;
        }
        case '2': {
          const pwd = await getMasterPassword();
          await handleSearch(pwd);
          break;
        }
        case '3': {
          const pwd = await getMasterPassword();
          await handleList(pwd);
          break;
        }
        case '4': {
          const pwd = await getMasterPassword();
          await handleTranscript(pwd);
          break;
        }
        case '5': {
          const pwd = await getMasterPassword();
          await handleDelete(pwd);
          break;
        }
        case '6': {
          handleStatus();
          break;
        }
        case '7': {
          console.log('\n🔒 Fermeture sécurisée de l\'application. À bientôt !');
          running = false;
          break;
        }
        default:
          console.log('⚠️ Option invalide. Veuillez saisir un chiffre entre 1 et 7.');
          break;
      }
    } catch (err) {
      if (err.code === 'ERR_CRYPTO_AUTH_FAILED') {
        console.log('\n🚨 ERREUR CRITIQUE DE SÉCURITÉ :');
        console.log('Mot de passe maître incorrect ou intégrité du fichier violée.');
        console.log('Détail technique : Échec de validation de l\'Authentication Tag AES-GCM.\n');
      } else {
        console.log(`\n❌ ERREUR : ${err.message}\n`);
      }
    }
  }
}

/**
 * Affichage de l'aide CLI
 */
function displayHelp() {
  console.log(`
UTILISATION :
  secure-student-cli                     Lance l'interface interactive complète
  secure-student-cli add                 Ajoute un étudiant directement
  secure-student-cli list                Affiche tous les relevés de notes
  secure-student-cli search <query>      Recherche un étudiant par identifiant ou nom
  secure-student-cli transcript <id>     Affiche le bulletin officiel d'un étudiant
  secure-student-cli delete <id>         Supprime un étudiant du coffre
  secure-student-cli status              Affiche les paramètres de sécurité cryptographiques
  secure-student-cli --help, -h          Affiche cette documentation d'aide

EXEMPLES :
  secure-student-cli
  secure-student-cli add
  secure-student-cli list
  secure-student-cli search "BENALI"
  secure-student-cli transcript "2024001"
  secure-student-cli delete "2024001"
  secure-student-cli status
`);
}

/**
 * Point d'entrée principal (Main)
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  displayBanner();

  if (!command) {
    await interactiveMenu();
    return;
  }

  try {
    switch (command.toLowerCase()) {
      case 'add': {
        const pwd = await getMasterPassword();
        await handleAdd(pwd);
        break;
      }
      case 'list': {
        const pwd = await getMasterPassword();
        await handleList(pwd);
        break;
      }
      case 'search': {
        const query = args.slice(1).join(' ');
        const pwd = await getMasterPassword();
        await handleSearch(pwd, query);
        break;
      }
      case 'transcript': {
        const id = args[1];
        const pwd = await getMasterPassword();
        await handleTranscript(pwd, id);
        break;
      }
      case 'delete': {
        const id = args[1];
        const pwd = await getMasterPassword();
        await handleDelete(pwd, id);
        break;
      }
      case 'status': {
        handleStatus();
        break;
      }
      case 'help':
      case '--help':
      case '-h': {
        displayHelp();
        break;
      }
      default: {
        console.log(`⚠️ Commande inconnue : "${command}"`);
        displayHelp();
        break;
      }
    }
  } catch (err) {
    if (err.code === 'ERR_CRYPTO_AUTH_FAILED') {
      console.log('\n🚨 ERREUR CRITIQUE DE SÉCURITÉ :');
      console.log('Mot de passe maître incorrect ou intégrité du fichier violée.');
      console.log('Détail technique : Échec de validation de l\'Authentication Tag AES-GCM.\n');
      process.exit(1);
    } else {
      console.log(`\n❌ ERREUR : ${err.message}\n`);
      process.exit(1);
    }
  }
}

main();
