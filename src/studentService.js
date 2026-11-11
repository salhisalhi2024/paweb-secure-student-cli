/**
 * ============================================================================
 * SERVICE DE GESTION DES ETUDIANTS (STUDENT RECORD SERVICE)
 * ============================================================================
 * Auteurs : Salhi Issam & Chouik Imane (L3 ISIL - Module PAWEB)
 * ============================================================================
 */

import { loadStudents, saveStudents, vaultExists } from './storage.js';

/**
 * Calcule l'appreciation / mention selon la note.
 * @param {number} grade 
 * @returns {string}
 */
export function getMention(grade) {
  if (grade >= 16) return 'Tres Bien';
  if (grade >= 14) return 'Bien';
  if (grade >= 12) return 'Assez Bien';
  if (grade >= 10) return 'Passable';
  return 'Ajourne';
}

/**
 * Affiche un tableau stylise pour un etudiant.
 * @param {Object} student 
 */
export function formatStudent(student) {
  const mention = getMention(student.grade);
  return `
  +----------------------------------------------------------+
  | MATRICULE / ID : ${String(student.id).padEnd(40)}|
  | NOM & PRENOM   : ${(student.nom + ' ' + student.prenom).padEnd(40)}|
  | FILIERE        : ${String(student.filiere || 'L3 ISIL').padEnd(40)}|
  | MODULE         : ${String(student.module || 'PAWEB').padEnd(40)}|
  | NOTE / MOYENNE : ${(student.grade.toFixed(2) + ' / 20 (' + mention + ')').padEnd(40)}|
  | DATE D'AJOUT   : ${String(student.createdAt || 'N/A').padEnd(40)}|
  +----------------------------------------------------------+`;
}

/**
 * Genere un releve de notes officiel formate facon bulletin academique.
 * @param {Object} student 
 * @returns {string}
 */
export function formatTranscript(student) {
  const mention = getMention(student.grade);
  const status = student.grade >= 10 ? 'VALIDE (ADMIS)' : 'NON VALIDE (AJOURNE)';
  
  return `
  ==============================================================
             REPUBLIQUE ALGERIENNE DEMOCRATIQUE ET POPULAIRE
             MINISTERE DE L'ENSEIGNEMENT SUPERIEUR ET DE LA R.S
                   RELEVE DE NOTES OFFICIEL - 2025/2026
  ==============================================================
  INFORMATIONS DE L'ETUDIANT :
    * Matricule / ID : ${String(student.id).padEnd(41)}
    * Nom de Famille : ${String(student.nom).padEnd(41)}
    * Prenom         : ${String(student.prenom).padEnd(41)}
    * Filiere / Cycle: ${String(student.filiere || 'L3 ISIL').padEnd(41)}
  --------------------------------------------------------------
  RESULTATS PEDAGOGIQUES :
    * Module d'Enseignement : ${String(student.module || 'PAWEB').padEnd(34)}
    * Note Finale / Moyenne : ${(student.grade.toFixed(2) + ' / 20.00').padEnd(34)}
    * Mention Attribuee     : ${mention.padEnd(34)}
    * Decision du Jury      : ${status.padEnd(34)}
  --------------------------------------------------------------
  SECURITE CRYPTOGRAPHIQUE :
    * Signature Coffre-Fort : AES-256-GCM Authentifie (128-bit)
    * Date d'Horodatage     : ${String(student.createdAt).padEnd(34)}
  ==============================================================`;
}

/**
 * Ajoute un nouvel enregistrement etudiant dans le coffre-fort chiffre.
 * 
 * @param {Object} studentData - Donnees { id, nom, prenom, filiere, module, grade }
 * @param {string} masterPassword - Mot de passe maitre pour le chiffrement.
 * @returns {Object} L'etudiant ajoute.
 */
export function addStudent(studentData, masterPassword) {
  const students = loadStudents(masterPassword);

  const exists = students.some((s) => s.id.toLowerCase() === studentData.id.toLowerCase());
  if (exists) {
    throw new Error(`Un etudiant avec le matricule "${studentData.id}" existe deja.`);
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
 * Recherche des etudiants par matricule, nom ou prenom.
 * 
 * @param {string} query - Terme de recherche.
 * @param {string} masterPassword - Mot de passe maitre pour dechiffrer.
 * @returns {Array<Object>} Liste des etudiants correspondants.
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
 * Recupere un etudiant par son matricule exact.
 * 
 * @param {string} id - Matricule de l'etudiant.
 * @param {string} masterPassword - Mot de passe maitre.
 * @returns {Object|null}
 */
export function getStudentById(id, masterPassword) {
  const students = loadStudents(masterPassword);
  return students.find((s) => s.id.toLowerCase() === id.trim().toLowerCase()) || null;
}

/**
 * Supprime un etudiant par son matricule et re-encrypte le coffre.
 * 
 * @param {string} id - Matricule de l'etudiant a supprimer.
 * @param {string} masterPassword - Mot de passe maitre.
 * @returns {boolean} True si supprime, false si introuvable.
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
 * Recupere tous les etudiants enregistres avec calcul de statistiques.
 * 
 * @param {string} masterPassword - Mot de passe maitre.
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
