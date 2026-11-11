#!/usr/bin/env node

/**
 * ============================================================================
 * SECURE STUDENT CLI - INTERFACE EN LIGNE DE COMMANDE (CLI)
 * ============================================================================
 * Sujet 2 : Gestionnaire securise de dossiers et releves de notes d'etudiants
 * Auteurs : Salhi Issam & Chouik Imane
 * Niveau   : 3eme annee L3 ISIL - Module PAWEB
 * Chiffrement : AES-256-GCM strictly | Derivation de cle : scryptSync
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

// En-tete d'accueil standard sans emojis
function displayBanner() {
  console.log(`
================================================================================
   SECURE STUDENT CLI - SYSTEME DE GESTION SECURISE D'ETUDIANTS
   Chiffrement Militaire AES-256-GCM | 100% Hors-ligne | Zero Plain Text
   -----------------------------------------------------------------------------
   Auteurs : Salhi Issam & Chouik Imane
   Promotion : L3 ISIL - Module PAWEB
================================================================================`);
}

/**
 * Demande et valide le mot de passe maitre de l'utilisateur.
 * Si le coffre n'existe pas encore, invite a definir un nouveau mot de passe avec confirmation.
 */
async function getMasterPassword() {
  const exists = vaultExists();

  if (!exists) {
    console.log('\n[INFO] Aucun coffre-fort chiffre detecte.');
    console.log('Veuillez initialiser votre mot de passe maitre pour proteger la base de donnees :');

    while (true) {
      const p1 = await askPassword('Nouveau mot de passe maitre : ');
      if (!p1 || p1.length < 6) {
        console.log('[ATTENTION] Le mot de passe doit comporter au moins 6 caracteres pour des raisons de securite.\n');
        continue;
      }

      const p2 = await askPassword('Confirmez le mot de passe maitre : ');
      if (p1 !== p2) {
        console.log('[ATTENTION] Les mots de passe ne correspondent pas. Veuillez reessayer.\n');
        continue;
      }

      console.log('[OK] Mot de passe maitre configure avec succes !\n');
      return p1;
    }
  }

  // Si le coffre existe deja
  const pwd = await askPassword('Entrez le mot de passe maitre pour deverrouiller le coffre : ');
  if (!pwd) {
    throw new Error('Le mot de passe maitre ne peut pas etre vide.');
  }
  return pwd;
}

/**
 * Action : Ajouter un etudiant
 */
async function handleAdd(password) {
  console.log('\n--- AJOUT D\'UN NOUVEL ETUDIANT ---');
  const id = await askQuestion('Matricule / Identifiant etudiant (ex: 2024001) : ');
  if (!id) {
    console.log('[ERREUR] Le matricule est obligatoire.');
    return;
  }

  const nom = await askQuestion('Nom de famille (ex: BENALI) : ');
  if (!nom) {
    console.log('[ERREUR] Le nom est obligatoire.');
    return;
  }

  const prenom = await askQuestion('Prenom (ex: Mohamed) : ');
  if (!prenom) {
    console.log('[ERREUR] Le prenom est obligatoire.');
    return;
  }

  const filiere = (await askQuestion('Filiere [L3 ISIL] : ')) || 'L3 ISIL';
  const module = (await askQuestion('Module [PAWEB] : ')) || 'PAWEB';

  const noteStr = await askQuestion('Note / Moyenne sur 20 (ex: 16.5) : ');
  const grade = Number.parseFloat(noteStr);
  if (Number.isNaN(grade) || grade < 0 || grade > 20) {
    console.log('[ERREUR] La note doit etre un nombre valide entre 0 et 20.');
    return;
  }

  const student = addStudent({ id, nom, prenom, filiere, module, grade }, password);
  console.log('\n[OK] Etudiant chiffre avec succes et enregistre dans le coffre-fort !');
  console.log(formatStudent(student));
}

/**
 * Action : Rechercher un etudiant
 */
async function handleSearch(password, initialQuery = null) {
  const query = initialQuery || (await askQuestion('\nEntrez le matricule, nom ou prenom a rechercher : '));
  if (!query) {
    console.log('[ERREUR] La requete de recherche ne peut pas etre vide.');
    return;
  }

  const results = searchStudents(query, password);
  console.log(`\n--- RESULTATS DE RECHERCHE POUR "${query}" (${results.length} trouve(s)) ---`);

  if (results.length === 0) {
    console.log('Aucun etudiant ne correspond a vos criteres de recherche.');
    return;
  }

  for (const s of results) {
    console.log(formatStudent(s));
  }
}

/**
 * Action : Lister tous les etudiants
 */
async function handleList(password) {
  const { students, stats } = listAllStudents(password);
  console.log(`\n--- LISTE GLOBALE DES ETUDIANTS (${stats.count} enregistrement(s)) ---`);

  if (students.length === 0) {
    console.log('Le coffre-fort ne contient actuellement aucun etudiant.');
    return;
  }

  for (const s of students) {
    console.log(formatStudent(s));
  }

  console.log(`
  STATISTIQUES DE LA PROMOTION :
  --------------------------------------------------
  - Effectif total       : ${stats.count} etudiant(s)
  - Moyenne generale     : ${stats.moyenneGenerale} / 20
  - Note maximale        : ${stats.maxNote} / 20
  - Note minimale        : ${stats.minNote} / 20
  --------------------------------------------------`);
}

/**
 * Action : Afficher un releve de notes officiel (Bulletin)
 */
async function handleTranscript(password, initialId = null) {
  const id = initialId || (await askQuestion('\nEntrez le matricule de l\'etudiant pour le releve : '));
  if (!id) {
    console.log('[ERREUR] Le matricule est obligatoire.');
    return;
  }

  const student = getStudentById(id, password);
  if (!student) {
    console.log(`[ERREUR] Aucun etudiant trouve avec le matricule "${id}".`);
    return;
  }

  console.log(formatTranscript(student));
}

/**
 * Action : Supprimer un etudiant
 */
async function handleDelete(password, initialId = null) {
  const id = initialId || (await askQuestion('\nEntrez le matricule de l\'etudiant a supprimer : '));
  if (!id) {
    console.log('[ERREUR] Le matricule est obligatoire.');
    return;
  }

  const student = getStudentById(id, password);
  if (!student) {
    console.log(`[ERREUR] Aucun etudiant trouve avec le matricule "${id}".`);
    return;
  }

  const confirm = await askQuestion(`[ATTENTION] Etes-vous sur de vouloir supprimer definitivement ${student.nom} ${student.prenom} (${id}) ? (o/n) : `);
  if (confirm.toLowerCase() !== 'o' && confirm.toLowerCase() !== 'oui' && confirm.toLowerCase() !== 'y') {
    console.log('Operation annulee.');
    return;
  }

  const success = deleteStudent(id, password);
  if (success) {
    console.log(`\n[OK] L'etudiant "${id}" a ete supprime avec succes. Le coffre a ete re-chiffre avec un nouvel IV.`);
  } else {
    console.log('[ERREUR] Echec de la suppression.');
  }
}

/**
 * Action : Afficher les details de securite et statut du coffre
 */
function handleStatus() {
  const exists = vaultExists();
  console.log(`
--- STATUT DU COFFRE-FORT DE SECURITE ---
- Emplacement du fichier : ${getVaultPath()}
- Etat du stockage       : ${exists ? 'Chiffre sur disque (AES-256-GCM actif)' : 'Non initialise (Aucun fichier sur disque)'}
- Algorithme             : AES-256-GCM (Authenticated Encryption)
- Derivation de Cle      : scryptSync (Memory-hard KDF, N=16384, r=8, p=1)
- Vecteur d'init. (IV)   : 96 bits (12 octets) aleatoire genere a chaque ecriture
- Protection Integrite   : Authentication Tag 128 bits
- Connexion Reseau       : 0 API Web (100% Fonctionnement Hors-ligne local)
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
  [1] Ajouter un nouvel etudiant
  [2] Rechercher un etudiant
  [3] Lister tous les etudiants et releves
  [4] Releve de notes officiel (Bulletin)
  [5] Supprimer un etudiant
  [6] Statut du coffre et securite
  [7] Quitter l'application
================================================`);

    const choice = await askQuestion('Selectionnez une option [1-7] : ');

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
          console.log('\n[INFO] Fermeture securisee de l\'application. Au revoir.');
          running = false;
          break;
        }
        default:
          console.log('[ATTENTION] Option invalide. Veuillez saisir un chiffre entre 1 et 7.');
          break;
      }
    } catch (err) {
      if (err.code === 'ERR_CRYPTO_AUTH_FAILED') {
        console.log('\n[ERREUR CRITIQUE DE SECURITE]');
        console.log('Mot de passe maitre incorrect ou integrite du fichier violee.');
        console.log('Detail technique : Echec de validation de l\'Authentication Tag AES-GCM.\n');
      } else {
        console.log(`\n[ERREUR] : ${err.message}\n`);
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
  ssc (ou secure-student-cli)            Lance l'interface interactive complete
  ssc add                                Ajoute un etudiant directement
  ssc list                               Affiche tous les releves de notes
  ssc search <query>                     Recherche un etudiant par identifiant ou nom
  ssc transcript <id>                    Affiche le bulletin officiel d'un etudiant
  ssc delete <id>                        Supprime un etudiant du coffre
  ssc status                             Affiche les parametres de securite cryptographiques
  ssc --help, -h                         Affiche cette documentation d'aide

EXEMPLES :
  ssc
  ssc add
  ssc list
  ssc search "BENALI"
  ssc transcript "2024001"
  ssc delete "2024001"
  ssc status
`);
}

/**
 * Point d'entree principal (Main)
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
        console.log(`[ATTENTION] Commande inconnue : "${command}"`);
        displayHelp();
        break;
      }
    }
  } catch (err) {
    if (err.code === 'ERR_CRYPTO_AUTH_FAILED') {
      console.log('\n[ERREUR CRITIQUE DE SECURITE]');
      console.log('Mot de passe maitre incorrect ou integrite du fichier violee.');
      console.log('Detail technique : Echec de validation de l\'Authentication Tag AES-GCM.\n');
      process.exit(1);
    } else {
      console.log(`\n[ERREUR] : ${err.message}\n`);
      process.exit(1);
    }
  }
}

main();
