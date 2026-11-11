# Secure Student CLI (ssc)

Outil en ligne de commande (CLI) securise pour le stockage, le chiffrement et la consultation des releves de notes d'etudiants en local.

أداة سطر أوامر مؤمنة لتخزين وتشفير واستعراض كشوف نقاط وسجلات الطلاب محلياً وفق معايير الأمان AES-256-GCM ودون أي اتصال بالإنترنت.

---

## Contexte & Auteurs

- **Auteurs :** Salhi Issam & Chouik Imane
- **Niveau :** 3eme annee LMD Licence Informatique (L3 ISIL)
- **Module :** PAWEB (Programmation et Applications Web)
- **Projet :** Sujet 2 - Systeme de gestion locale securisee de releves de notes
- **Date limite :** 18 Novembre 2026

---

## Enonce Officiel du Projet (Sujet 2)

<div align="center">
  <img src="./assets/sujet-2-paweb.jpg" alt="Enonce Officiel Sujet 2 - PAWEB L3 ISIL" width="650" style="border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); margin: 15px 0;" />
  <p><em>Figure 1 - Sujet officiel n°2 remis dans le cadre du module PAWEB (L3 ISIL).</em></p>
</div>

---

## Installation Rapide

Vous pouvez utiliser indifferemment la commande complete `secure-student-cli` ou son alias court `ssc` :

```bash
# 1. Cloner le depot
git clone https://github.com/salhisalhi2024/paweb-secure-student-cli.git

# 2. Acceder au dossier
cd paweb-secure-student-cli

# 3. Lier les commandes globales (ssc et secure-student-cli)
npm link
```

Apres cette commande, l'outil est disponible immediatement en tapant :
```bash
ssc
```
*(ou `secure-student-cli`)*

---

## Galerie Visuelle du Projet en Action

<div align="center">
  <h3>1. Menu Interactif Principal & Saisie Securisee</h3>
  <img src="./assets/screenshots/03_interactive_menu.png" alt="Menu Principal" width="800" style="border-radius: 6px; margin-bottom: 20px;" />

  <h3>2. Consultation des Releves et Statistiques</h3>
  <img src="./assets/screenshots/04_list_and_stats.png" alt="Liste et Statistiques" width="800" style="border-radius: 6px; margin-bottom: 20px;" />

  <h3>3. Releve de Notes Officiel (Bulletin Academique)</h3>
  <img src="./assets/screenshots/05_official_transcript.png" alt="Bulletin Officiel" width="800" style="border-radius: 6px; margin-bottom: 20px;" />

  <h3>4. Preuve du Chiffrement Physique sur Disque (Zero Plain Text)</h3>
  <img src="./assets/screenshots/08_raw_encrypted_vault.png" alt="Fichier Chiffre sur Disque" width="800" style="border-radius: 6px; margin-bottom: 20px;" />
</div>

---

## Guide d'Utilisation

### Mode Interactif (Menu)
```bash
ssc
```
Affiche le menu interactif avec saisie securisee et masquee du mot de passe maitre :
```text
================ MENU PRINCIPAL ================
  [1] Ajouter un nouvel etudiant
  [2] Rechercher un etudiant
  [3] Lister tous les etudiants et releves
  [4] Releve de notes officiel (Bulletin)
  [5] Supprimer un etudiant
  [6] Statut du coffre et securite
  [7] Quitter l'application
================================================
```

### Commandes Directes
```bash
# Ajouter un etudiant
ssc add

# Lister tous les etudiants et statistiques
ssc list

# Rechercher un etudiant par nom ou matricule
ssc search "BENALI"
ssc search "2024001"

# Generer le bulletin officiel d'un etudiant
ssc transcript "2024001"

# Supprimer un etudiant
ssc delete "2024001"

# Verifier les parametres de securite cryptographiques
ssc status

# Afficher l'aide
ssc --help
```

---

## Tests Automatises & Demonstration

### Suite de tests de securite
```bash
npm test
```
Verifie la derivation scrypt 256-bit, le chiffrement/dechiffrement AES-GCM, le rejet des mauvais mots de passe via Auth Tag, la non-reutilisation de l'IV, la detection d'alteration et l'absence totale de texte en clair sur disque.

### Generation de donnees d'essai (Seed)
```bash
npm run seed
```
Genere instantanement 5 dossiers d'etudiants chiffres pour evaluer rapidement l'outil.

---

## Architecture du Projet

```text
paweb-secure-student-cli/
├── index.js                      # Point d'entree CLI (commandes ssc et secure-student-cli)
├── package.json                  # Binaires globaux ssc / secure-student-cli et scripts
├── .gitignore                    # Exclusion des donnees locales et caches
├── test.js                       # 7 tests automatises de securite et de conformite
├── seed.js                       # Script de generation de donnees d'evaluation
├── README.md                     # Manuel d'utilisation
├── PROCESSUS_DE_DEVELOPPEMENT.md # Journal de developpement detaille
├── assets/
│   ├── sujet-2-paweb.jpg         # Enonce officiel du sujet
│   └── screenshots/              # Captures d'ecran des tests et de l'interface
└── src/
    ├── crypto.js                 # Algorithme AES-256-GCM, scryptSync, IV, Salt, AuthTag
    ├── storage.js                # Stockage physique chiffre (Zero Plain Text)
    ├── studentService.js         # Logique metier (Ajout, Recherche, Releve, Suppression)
    └── prompt.js                 # Entrees terminal securisees en Raw Mode
```

---

## Specifications Cryptographiques

| Parametre | Valeur | Role de Securite |
| :--- | :--- | :--- |
| **Algorithme** | AES-256-GCM | Chiffrement symetrique authentifie (AEAD) assurant confidentialite et integrite. |
| **Derivation (KDF)** | `scryptSync` (N=16384, r=8, p=1) | Protection contre les attaques par force brute (Brute-force) et cartes GPU. |
| **Cle** | 256 bits (32 octets) | Niveau de securite militaire. |
| **IV (Nonce)** | 96 bits (12 octets) aleatoires | Genere a chaque ecriture (anti-rejeu / non-reutilisation d'IV). |
| **Auth Tag** | 128 bits (16 octets) | Detection immediate de toute falsification de donnees sur le disque. |
| **Reseau** | 0 API Web | Fonctionnement 100% hors-ligne local. |

---

## Licence

Projet realise dans le cadre du module **PAWEB** (L3 ISIL) par Salhi Issam & Chouik Imane. Licence MIT.
