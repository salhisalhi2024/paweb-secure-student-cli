/**
 * ============================================================================
 * SERVICE DE GESTION DES ÉTUDIANTS (STUDENT RECORD SERVICE)
 * Auteurs : Salhi Issam & Chouikha Imane (L3 ISIL - Module PAWEB)
 * ============================================================================
 */

import { loadStudents, saveStudents, vaultExists } from './storage.js';

/**
 * Calcule l'appréciation / mention selon la note.
 * @param {number} grade 
 * @returns {string}
 */
export function getMention(grade) {
  if (grade >= 16) return 'Très Bien';
  if (grade >= 14) return 'Bien';
  if (grade >= 12) return 'Assez Bien';
  if (grade >= 10) return 'Passable';
  return 'Ajourné';
}

/**
 * Affiche un tableau stylisé pour un étudiant.
 * @param {Object} student 
 */
export function formatStudent(student) {
  const mention = getMention(student.grade);
  return `
  ┌──────────────────────────────────────────────────────────┐
  │ MATRICULE / ID : ${String(student.id).padEnd(39)}│
  │ NOM & PRÉNOM   : ${(student.nom + ' ' + student.prenom).padEnd(39)}│
  │ FILIÈRE        : ${String(student.filiere || 'L3 ISIL').padEnd(39)}│
  │ MODULE         : ${String(student.module || 'PAWEB').padEnd(39)}│
  │ NOTE / MOYENNE : ${(student.grade.toFixed(2) + ' / 20 (' + mention + ')').padEnd(39)}│
  │ DATE D'AJOUT   : ${String(student.createdAt || 'N/A').padEnd(39)}│
  └──────────────────────────────────────────────────────────┘`;
}

/**
 * Génère un relevé de notes officiel formaté façon bulletin académique.
 * @param {Object} student 
 * @returns {string}
 */
export function formatTranscript(student) {
  const mention = getMention(student.grade);
  const status = student.grade >= 10 ? 'VALIDÉ (ADMIS)' : 'NON VALIDÉ (AJOURNÉ)';
  
  return `
  ╔══════════════════════════════════════════════════════════════╗
  ║           RÉPUBLIQUE ALGÉRIENNE DÉMOCRATIQUE ET POPULAIRE    ║
  ║           MINISTÈRE DE L'ENSEIGNEMENT SUPÉRIEUR ET DE LA R.S ║
  ║                 RELEVÉ DE NOTES OFFICIEL - 2025/2026         ║
  ╠══════════════════════════════════════════════════════════════╣
  ║ INFORMATIONS DE L'ÉTUDIANT :                                 ║
  ║   • Matricule / ID : ${String(student.id).padEnd(38)}║
  ║   • Nom de Famille : ${String(student.nom).padEnd(38)}║
  ║   • Prénom         : ${String(student.prenom).padEnd(38)}║
  ║   • Filière / Cycle: ${String(student.filiere || 'L3 ISIL').padEnd(38)}║
  ╠══════════════════════════════════════════════════════════════╣
  ║ RÉSULTATS PÉDAGOGIQUES :                                     ║
  ║   • Module d'Enseignement : ${String(student.module || 'PAWEB').padEnd(31)}║
  ║   • Note Finale / Moyenne : ${(student.grade.toFixed(2) + ' / 20.00').padEnd(31)}║
  ║   • Mention Attribuée     : ${mention.padEnd(31)}║
  ║   • Décision du Jury      : ${status.padEnd(31)}║
  ╠══════════════════════════════════════════════════════════════╣
  ║ SÉCURITÉ CRYPTOGRAPHIQUE :                                   ║
  ║   • Signature Coffre-Fort : AES-256-GCM Authentifié (128-bit)║
  ║   • Date d'Horodatage     : ${String(student.createdAt).padEnd(31)}║
  ╚══════════════════════════════════════════════════════════════╝`;
}

/**
 * Ajoute un nouvel enregistrement étudiant dans le coffre-fort chiffré.
 * 
 * @param {Object} studentData - Données { id, nom, prenom, filiere, module, grade }
 * @param {string} masterPassword - Mot de passe maître pour le chiffrement.
 * @returns {Object} L'étudiant ajouté.
 */
export function addStudent(studentData, masterPassword) {
  const students = loadStudents(masterPassword);

  // Vérification de l'unicité du matricule
  const exists = students.some((s) => s.id.toLowerCase() === studentData.id.toLowerCase());
  if (exists) {
    throw new Error(`Un étudiant avec le matricule "${studentData.id}" existe déjà.`);
  }

  const newRecord = {
    id: studentData.id.trim(),
    nom: studentData.nom.trim().toUpperCase(),
    prenom: studentData.prenom.trim(),
    filiere: (studentData.filiere || 'L3 ISIL').trim(),
    module: (studentData.module || 'PAWEB').trim(),
    grade: Number.parseFloat(studentData.grade),
    createdAt: new Date().toISOString()
  };

  students.push(newRecord);
  saveStudents(students, masterPassword);

  return newRecord;
}

/**
 * Recherche des étudiants par matricule, nom ou prénom.
 * 
 * @param {string} query - Terme de recherche.
 * @param {string} masterPassword - Mot de passe maître pour déchiffrer.
 * @returns {Array<Object>} Liste des étudiants correspondants.
 */
export function searchStudents(query, masterPassword) {
  const students = loadStudents(masterPassword);
  const q = query.trim().toLowerCase();

  return students.filter((s) => {
    return (
      s.id.toLowerCase().includes(q) ||
      s.nom.toLowerCase().includes(q) ||
      s.prenom.toLowerCase().includes(q) ||
      (s.filiere && s.filiere.toLowerCase().includes(q))
    );
  });
}

/**
 * Récupère un étudiant par son matricule exact.
 * 
 * @param {string} id - Matricule de l'étudiant.
 * @param {string} masterPassword - Mot de passe maître.
 * @returns {Object|null}
 */
export function getStudentById(id, masterPassword) {
  const students = loadStudents(masterPassword);
  return students.find((s) => s.id.toLowerCase() === id.trim().toLowerCase()) || null;
}

/**
 * Supprime un étudiant par son matricule et ré-encrypte le coffre.
 * 
 * @param {string} id - Matricule de l'étudiant à supprimer.
 * @param {string} masterPassword - Mot de passe maître.
 * @returns {boolean} True si supprimé, false si introuvable.
 */
export function deleteStudent(id, masterPassword) {
  const students = loadStudents(masterPassword);
  const initialLength = students.length;
  const filtered = students.filter((s) => s.id.toLowerCase() !== id.trim().toLowerCase());

  if (filtered.length === initialLength) {
    return false;
  }

  saveStudents(filtered, masterPassword);
  return true;
}

/**
 * Récupère tous les étudiants enregistrés avec calcul de statistiques.
 * 
 * @param {string} masterPassword - Mot de passe maître.
 * @returns {{ students: Array<Object>, stats: Object }}
 */
export function listAllStudents(masterPassword) {
  const students = loadStudents(masterPassword);

  let totalNotes = 0;
  let maxNote = 0;
  let minNote = 20;

  for (const s of students) {
    totalNotes += s.grade;
    if (s.grade > maxNote) maxNote = s.grade;
    if (s.grade < minNote) minNote = s.grade;
  }

  const stats = {
    count: students.length,
    moyenneGenerale: students.length > 0 ? (totalNotes / students.length).toFixed(2) : '0.00',
    maxNote: students.length > 0 ? maxNote.toFixed(2) : '0.00',
    minNote: students.length > 0 ? minNote.toFixed(2) : '0.00'
  };

  return { students, stats };
}
