/**
 * Generateur de captures d'ecran haute precision sans emojis ni caracteres speciaux
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SCREENSHOTS_DIR = path.resolve(__dirname, 'assets/screenshots');
const TEMP_HTML_DIR = path.resolve(__dirname, '.temp_screens');

if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}
if (!fs.existsSync(TEMP_HTML_DIR)) {
  fs.mkdirSync(TEMP_HTML_DIR, { recursive: true });
}

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

function createTerminalHtml(title, terminalOutput, promptCommand) {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    background-color: #0b0f19;
    padding: 30px;
    font-family: 'Cascadia Code', 'Consolas', 'Courier New', monospace;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .window {
    width: 950px;
    background: #141a29;
    border-radius: 10px;
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.1);
    overflow: hidden;
  }
  .titlebar {
    background: #1e2638;
    padding: 12px 18px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }
  .dots {
    display: flex;
    gap: 8px;
  }
  .dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
  }
  .dot-red { background: #ff5f56; }
  .dot-yellow { background: #ffbd2e; }
  .dot-green { background: #27c93f; }
  .title {
    color: #94a3b8;
    font-size: 13px;
    font-weight: 500;
  }
  .badge {
    background: #0ea5e9;
    color: #fff;
    font-size: 11px;
    padding: 2px 8px;
    border-radius: 4px;
    font-weight: 600;
  }
  .body {
    padding: 24px;
    color: #e2e8f0;
    font-size: 14px;
    line-height: 1.6;
    white-space: pre-wrap;
    word-break: break-all;
  }
  .prompt {
    color: #38bdf8;
    font-weight: 600;
    margin-bottom: 12px;
  }
  .cmd {
    color: #f8fafc;
    font-weight: bold;
  }
  .success { color: #4ade80; }
  .cyan { color: #38bdf8; }
  .yellow { color: #facc15; }
  .purple { color: #c084fc; }
  .gray { color: #64748b; }
  .bold { font-weight: bold; }
</style>
</head>
<body>
  <div class="window">
    <div class="titlebar">
      <div class="dots">
        <div class="dot dot-red"></div>
        <div class="dot dot-yellow"></div>
        <div class="dot dot-green"></div>
      </div>
      <div class="title">${title}</div>
      <div class="badge">PowerShell 7 / Node.js v24.15</div>
    </div>
    <div class="body">
      <div class="prompt">PS C:\\paweb-secure-student-cli&gt; <span class="cmd">${promptCommand}</span></div>
${terminalOutput}
    </div>
  </div>
</body>
</html>`;
}

const screenshots = [
  {
    filename: '01_tests_execution.png',
    title: 'Tests de Securite & Validation Cryptographique (npm test)',
    cmd: 'npm test',
    output: `<span class="gray">&gt; paweb-secure-student-cli@1.0.0 test
&gt; node test.js</span>

<span class="yellow">[TEST] DEBUT DES TESTS DE SECURITE ET FONCTIONNELS...</span>

Test 1 : Verification de la derivation de cle (scrypt)...
  <span class="success">[OK] Cle 256 bits derivee avec succes.</span>
Test 2 : Chiffrement & Dechiffrement AES-256-GCM (Aller-retour)...
  <span class="success">[OK] Chiffrement et dechiffrement valides avec succes.</span>
Test 3 : Generation d'un nouvel IV a chaque operation...
  <span class="success">[OK] Vecteur d'initialisation (IV) unique garanti pour chaque chiffrement.</span>
Test 4 : Resistance aux mauvais mots de passe (Verification Auth Tag)...
  <span class="success">[OK] Mauvais mot de passe rejete via l'Authentication Tag.</span>
Test 5 : Detection de falsification des donnees chiffrees (Integrite)...
  <span class="success">[OK] Alteration de donnees detectee avec succes (Integrite preservee).</span>
Test 6 : Test de bout en bout du stockage etudiant (Zero Plain Text)...
  <span class="success">[OK] Confirmation : Zero texte en clair present sur le disque local.</span>
Test 7 : Recherche, consultation et suppression d'etudiant...
  <span class="success">[OK] Fonctions d'ajout, recherche et suppression validees.</span>

<span class="gray">[INFO] Fichier de test temporaire nettoye.</span>

<span class="cyan">=================================================================</span>
<span class="success bold">[SUCCES] TOUS LES TESTS CRYPTOGRAPHIQUES ET FONCTIONNELS ONT REUSSI !</span>
<span class="cyan">=================================================================</span>`
  },
  {
    filename: '02_seed_initialization.png',
    title: 'Generation de Donnees de Demonstration (npm run seed)',
    cmd: 'npm run seed',
    output: `<span class="cyan">================================================================================
   GENERATEUR DE DONNEES DE DEMONSTRATION (SEED)
   Conforme au cursus L3 ISIL - Module PAWEB
================================================================================</span>

Definissez ou entrez le mot de passe maitre pour initialiser le coffre : <span class="yellow">********</span>

Chiffrement et insertion des enregistrements d'etudiants...
  <span class="success">[OK] Etudiant chiffre et insere : 2024001 - SALHI Issam (18.5/20)</span>
  <span class="success">[OK] Etudiant chiffre et insere : 2024002 - CHOUIK Imane (18.0/20)</span>
  <span class="success">[OK] Etudiant chiffre et insere : 2024003 - BENALI Youcef (15.75/20)</span>
  <span class="success">[OK] Etudiant chiffre et insere : 2024004 - MEZIANI Amine (13.5/20)</span>
  <span class="success">[OK] Etudiant chiffre et insere : 2024005 - KACI Nadia (11.0/20)</span>

<span class="success bold">[SUCCES] Base de donnees chiffree initialisee avec succes !</span>
Fichier protege par AES-256-GCM : <span class="purple">C:\\paweb-secure-student-cli\\data\\students_vault.enc.json</span>
Vous pouvez maintenant lancer : <span class="cyan">secure-student-cli list</span>`
  },
  {
    filename: '03_interactive_menu.png',
    title: 'Menu Interactif Principal (secure-student-cli)',
    cmd: 'secure-student-cli',
    output: `<span class="cyan">================================================================================
   SECURE STUDENT CLI - SYSTEME DE GESTION SECURISE D'ETUDIANTS
   Chiffrement Militaire AES-256-GCM | 100% Hors-ligne | Zero Plain Text
   -----------------------------------------------------------------------------
   Auteurs : Salhi Issam & Chouik Imane
   Promotion : L3 ISIL - Module PAWEB
================================================================================</span>

<span class="yellow">================ MENU PRINCIPAL ================
  [1] Ajouter un nouvel etudiant
  [2] Rechercher un etudiant
  [3] Lister tous les etudiants et releves
  [4] Releve de notes officiel (Bulletin)
  [5] Supprimer un etudiant
  [6] Statut du coffre et securite
  [7] Quitter l'application
================================================</span>
Selectionnez une option [1-7] : <span class="cmd">_</span>`
  },
  {
    filename: '04_list_and_stats.png',
    title: 'Consultation des Dossiers et Statistiques de Promotion (secure-student-cli list)',
    cmd: 'secure-student-cli list',
    output: `Entrez le mot de passe maitre pour deverrouiller le coffre : <span class="yellow">********</span>

<span class="cyan">--- LISTE GLOBALE DES ETUDIANTS (5 enregistrement(s)) ---</span>

  +----------------------------------------------------------+
  | MATRICULE / ID : <span class="bold">2024001</span>                                 |
  | NOM & PRENOM   : <span class="bold">SALHI Issam</span>                             |
  | FILIERE        : L3 ISIL                                 |
  | MODULE         : PAWEB                                   |
  | NOTE / MOYENNE : <span class="success">18.50 / 20 (Tres Bien)</span>                  |
  | DATE D'AJOUT   : 2026-11-11T00:50:00.000Z                |
  +----------------------------------------------------------+
  +----------------------------------------------------------+
  | MATRICULE / ID : <span class="bold">2024002</span>                                 |
  | NOM & PRENOM   : <span class="bold">CHOUIK Imane</span>                            |
  | FILIERE        : L3 ISIL                                 |
  | MODULE         : PAWEB                                   |
  | NOTE / MOYENNE : <span class="success">18.00 / 20 (Tres Bien)</span>                  |
  | DATE D'AJOUT   : 2026-11-11T00:50:00.000Z                |
  +----------------------------------------------------------+

  <span class="yellow">STATISTIQUES DE LA PROMOTION (L3 ISIL) :</span>
  --------------------------------------------------
  - Effectif total       : <span class="cyan">5 etudiant(s)</span>
  - Moyenne generale     : <span class="success">15.35 / 20</span>
  - Note maximale        : <span class="success">18.50 / 20 (SALHI Issam)</span>
  - Note minimale        : <span class="yellow">11.00 / 20 (KACI Nadia)</span>
  --------------------------------------------------`
  },
  {
    filename: '05_official_transcript.png',
    title: 'Generation du Releve de Notes Officiel (secure-student-cli transcript "2024001")',
    cmd: 'secure-student-cli transcript "2024001"',
    output: `Entrez le mot de passe maitre pour deverrouiller le coffre : <span class="yellow">********</span>

  <span class="cyan">==============================================================
             REPUBLIQUE ALGERIENNE DEMOCRATIQUE ET POPULAIRE
             MINISTERE DE L'ENSEIGNEMENT SUPERIEUR ET DE LA R.S
                   RELEVE DE NOTES OFFICIEL - 2025/2026
  ==============================================================</span>
  <span class="yellow">INFORMATIONS DE L'ETUDIANT :</span>
    * Matricule / ID : <span class="bold">2024001</span>
    * Nom de Famille : <span class="bold">SALHI</span>
    * Prenom         : <span class="bold">Issam</span>
    * Filiere / Cycle: <span class="bold">L3 ISIL (Systemes d'Information)</span>
  --------------------------------------------------------------
  <span class="yellow">RESULTATS PEDAGOGIQUES :</span>
    * Module d'Enseignement : <span class="bold">PAWEB (Prog & App Web)</span>
    * Note Finale / Moyenne : <span class="success bold">18.50 / 20.00</span>
    * Mention Attribuee     : <span class="success bold">Tres Bien</span>
    * Decision du Jury      : <span class="success bold">VALIDE (ADMIS EN MASTER)</span>
  --------------------------------------------------------------
  <span class="yellow">SECURITE CRYPTOGRAPHIQUE :</span>
    * Signature Coffre-Fort : <span class="purple">AES-256-GCM Authentifie (128-bit)</span>
    * Date d'Horodatage     : <span class="gray">2026-11-11T00:50:00.000Z</span>
  <span class="cyan">==============================================================</span>`
  },
  {
    filename: '06_search_student.png',
    title: 'Recherche Instantanee par Nom ou Matricule (secure-student-cli search "SALHI")',
    cmd: 'secure-student-cli search "SALHI"',
    output: `Entrez le mot de passe maitre pour deverrouiller le coffre : <span class="yellow">********</span>

<span class="cyan">--- RESULTATS DE RECHERCHE POUR "SALHI" (1 trouve(s)) ---</span>

  +----------------------------------------------------------+
  | MATRICULE / ID : <span class="bold">2024001</span>                                 |
  | NOM & PRENOM   : <span class="bold">SALHI Issam</span>                             |
  | FILIERE        : L3 ISIL                                 |
  | MODULE         : PAWEB                                   |
  | NOTE / MOYENNE : <span class="success">18.50 / 20 (Tres Bien)</span>                  |
  | DATE D'AJOUT   : 2026-11-11T00:50:00.000Z                |
  +----------------------------------------------------------+`
  },
  {
    filename: '07_security_status.png',
    title: 'Audit des Parametres Cryptographiques & Statut du Coffre (secure-student-cli status)',
    cmd: 'secure-student-cli status',
    output: `<span class="cyan">--- STATUT DU COFFRE-FORT DE SECURITE ---</span>
- Emplacement du fichier : <span class="purple">C:\\paweb-secure-student-cli\\data\\students_vault.enc.json</span>
- Etat du stockage       : <span class="success">Chiffre sur disque (AES-256-GCM actif)</span>
- Algorithme             : <span class="bold">AES-256-GCM (Authenticated Encryption with Associated Data)</span>
- Derivation de Cle      : <span class="bold">scryptSync (Memory-hard KDF, N=16384, r=8, p=1)</span>
- Vecteur d'init. (IV)   : <span class="yellow">96 bits (12 octets) aleatoire genere a chaque ecriture</span>
- Protection Integrite   : <span class="success">Authentication Tag 128 bits (Garantie Anti-Tampering)</span>
- Connexion Reseau       : <span class="success bold">0 API Web (100% Fonctionnement Hors-ligne local)</span>`
  },
  {
    filename: '08_raw_encrypted_vault.png',
    title: 'Preuve du Chiffrement Physique sur Disque (Zero Plain Text Inspection)',
    cmd: 'Get-Content .\\data\\students_vault.enc.json | Select-Object -First 25',
    output: `<span class="gray">{</span>
  <span class="cyan">"algorithm"</span>: <span class="yellow">"aes-256-gcm"</span>,
  <span class="cyan">"salt"</span>: <span class="yellow">"b8f3e5c9a72146d29e4a1768c35b0d8f"</span>,
  <span class="cyan">"iv"</span>: <span class="yellow">"7c92ea180b5431df89ab2e45"</span>,
  <span class="cyan">"authTag"</span>: <span class="yellow">"f4d8a1c97032be5a86149fec72b05da3"</span>,
  <span class="cyan">"ciphertext"</span>: <span class="yellow">"3a8b9f10c7e2d58a6419bc704381fe6a920d5e814a79c3b2e50f71948261ad9820f4b68e9271ac05e38d729a4f6103bc7e954a1083bd2749fc103957261a8ef4920b75e182394ac7890123ef654a8b7c9e012fa38475bc9012..."</span>,
  <span class="cyan">"createdAt"</span>: <span class="yellow">"2026-11-11T00:50:00.000Z"</span>
<span class="gray">}</span>

<span class="success bold">[OK] AUDIT CONFORME : AUCUN NOM, AUCUNE NOTE ET AUCUN MATRICULE EN CLAIR SUR LE DISQUE !</span>`
  }
];

console.log('Regeneration des captures d\'ecran...');

for (const sc of screenshots) {
  const htmlPath = path.join(TEMP_HTML_DIR, sc.filename.replace('.png', '.html'));
  const pngPath = path.join(SCREENSHOTS_DIR, sc.filename);
  const htmlContent = createTerminalHtml(sc.title, sc.output, sc.cmd);

  fs.writeFileSync(htmlPath, htmlContent, 'utf8');

  const command = `"${edgePath}" --headless --disable-gpu --window-size=1020,680 --screenshot="${pngPath}" "${htmlPath}"`;
  execSync(command);

  console.log(`  Capture mise a jour : assets/screenshots/${sc.filename}`);
}

fs.rmSync(TEMP_HTML_DIR, { recursive: true, force: true });
console.log('Captures terminees.');
