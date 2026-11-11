# 🔐 Secure Student CLI

> **Outil en ligne de commande (CLI) sécurisé pour le stockage, le chiffrement et la consultation des relevés de notes d'étudiants.**

---

### 👨‍💻 Contexte Académique & Auteurs
- **Auteurs :** Salhi Issam & Chouikha Imane
- **Niveau :** 3ème année Licence Informatique (L3 ISIL)
- **Module :** PAWEB (Programmation et Applications Web)
- **Projet :** Sujet 2 – Système de gestion locale sécurisée de relevés de notes

---

## 🌟 Points Forts & Garanties de Sécurité

- 🛡️ **Chiffrement Authentifié AES-256-GCM :** Garantit la **Confidentialité** et l'**Intégrité** absolue des dossiers étudiants.
- 🔑 **Dérivation de Clé Robuste (`scryptSync`) :** Protection contre les attaques par force brute (Brute-force) et attaques par dictionnaire via une KDF (Key Derivation Function) consommatrice de mémoire (Memory-hard).
- 🎲 **Vecteur d'Initialisation (IV) Unique :** Un nouvel `IV` de 96 bits (12 octets) et un nouveau `Salt` sont générés à chaque sauvegarde.
- 🚫 **Zéro Texte en Clair (Zero Plain Text) :** Aucune note, matricule ou identité d'étudiant n'est jamais écrite en clair sur le disque dur.
- 🔌 **100% Hors-ligne (Zero Web APIs) :** Fonctionnement totalement autonome, aucune dépendance réseau, aucune fuite de données vers des serveurs tiers.
- 📦 **Zéro Dépendance Externe :** Conçu exclusivement avec les modules natifs de Node.js (`crypto`, `fs`, `readline`).
- 🙈 **Saisie Masquée du Mot de Passe :** Le mot de passe maître n'apparaît jamais en clair dans le terminal.

> **ملاحظة بالعربية (Note de sécurité) :**  
> يعتمد هذا النظام على التشفير الموثق **AES-256-GCM** مع دالة اشتقاق المفاتيح **scrypt**. في كل مرة يتم فيها حفظ أو تعديل السجلات، يقوم النظام بتوليد متجه تهيئة (**IV**) عشوائي جديد تماماً، مما يمنع نهائياً إعادة استخدام المفاتيح ويضمن كشف أي محاولة تلاعب بالبيانات بفضل **Authentication Tag**.

---

## 📋 Prérequis

- [Node.js](https://nodejs.org/) version **18.x** ou supérieure (v20+ recommandé).
- `npm` (installé par défaut avec Node.js).
- `git`.

---

## 🚀 Installation & Configuration Rapide

En trois commandes simples dans votre terminal :

```bash
# 1. Cloner le dépôt GitHub
git clone https://github.com/salhisalhi2024/paweb-secure-student-cli.git

# 2. Accéder au répertoire du projet
cd paweb-secure-student-cli

# 3. Lier la commande globalement sur votre système
npm link
```

🎉 **C'est tout !** Vous pouvez désormais exécuter l'outil depuis n'importe quel dossier simplement en tapant :
```bash
secure-student-cli
```

---

## 💻 Guide d'Utilisation

L'outil offre deux modes d'utilisation : un **Menu Interactif convivial** et des **Commandes Directes**.

### 1. Mode Interactif (Recommandé)
Lancez simplement l'application sans argument :
```bash
secure-student-cli
```
Un menu interactif apparaîtra pour vous guider :
```text
================ MENU PRINCIPAL ================
  [1] ➕ Ajouter un nouvel étudiant
  [2] 🔍 Rechercher un étudiant
  [3] 📋 Lister tous les étudiants & relevés
  [4] 🛡️  Statut du coffre et sécurité
  [5] 🚪 Quitter l'application
================================================
```

---

### 2. Commandes Directes (Mode Rapide)

#### ➕ Ajouter un étudiant
```bash
secure-student-cli add
```
Le système vous demandera le mot de passe maître de manière sécurisée (masqué avec des `*`), puis vous invitera à saisir :
- Le Matricule / Identifiant (ex: `2024001`)
- Le Nom de famille (ex: `BENALI`)
- Le Prénom (ex: `Mohamed`)
- La Filière (ex: `L3 ISIL`)
- Le Module (ex: `PAWEB`)
- La Note / Moyenne sur 20 (ex: `16.5`)

#### 📋 Afficher tous les relevés de notes
```bash
secure-student-cli list
```
Affiche toutes les fiches d'étudiants enregistrées, la mention associée (*Très Bien*, *Bien*, *Passable*...), ainsi que les statistiques de promotion (Moyenne générale, Note Max, Note Min).

#### 🔍 Rechercher un étudiant
```bash
secure-student-cli search "BENALI"
# ou recherche par matricule
secure-student-cli search "2024001"
```

#### 🛡️ Vérifier le statut de sécurité du coffre-fort
```bash
secure-student-cli status
```

#### ❓ Afficher l'aide
```bash
secure-student-cli --help
```

---

## 🧪 Exécution des Tests de Sécurité

Une suite de tests complète a été développée pour valider la robustesse cryptographique et fonctionnelle. Pour exécuter les tests :

```bash
npm test
```

### Ce qui est testé automatiquement :
1. ✅ Dérivation conforme d'une clé 256 bits via `crypto.scryptSync`.
2. ✅ Chiffrement et déchiffrement aller-retour sans perte de données.
3. ✅ Unicité stricte du vecteur d'initialisation (`IV`) sur des chiffrements successifs.
4. ✅ Rejet immédiat de tout mot de passe incorrect grâce à l'Authentication Tag AES-GCM.
5. ✅ Détection immédiate de toute falsification de données (Tampering).
6. ✅ Absence totale de texte en clair dans le fichier de stockage physique.
7. ✅ Validation du filtrage de recherche et calcul des moyennes.

---

## 🗂️ Structure du Projet

```text
paweb-secure-student-cli/
├── index.js                      # Point d'entrée exécutable (CLI Router & Interactive loop)
├── package.json                  # Métadonnées, bin global et scripts
├── .gitignore                    # Exclusion des fichiers temporaires et données locales
├── test.js                       # Suite de tests cryptographiques et fonctionnels
├── README.md                     # Manuel utilisateur et documentation du projet
├── PROCESSUS_DE_DEVELOPPEMENT.md # Journal de bord détaillé du développement
└── src/
    ├── crypto.js                 # Cœur cryptographique (AES-256-GCM, scryptSync, IV, Salt)
    ├── storage.js                # Gestion du stockage local chiffré (Zero Plain Text)
    ├── studentService.js         # Logique métier (Ajout, Recherche, Relevés, Stats)
    └── prompt.js                 # Entrées sécurisées et masquage du mot de passe maître
```

---

## 🔐 Détails Techniques & Cryptographie

| Composant | Spécification | Rôle de sécurité |
| :--- | :--- | :--- |
| **Algorithme** | AES-256-GCM | Confidentialité et Authentification combinées (AEAD). |
| **KDF** | `scryptSync` (N=16384, r=8, p=1) | Dérivation du mot de passe maître résistant aux attaques matérielles. |
| **Longueur de Clé** | 256 bits (32 octets) | Niveau de sécurité militaire contre les ordinateurs quantiques et classiques. |
| **IV (Nonce)** | 96 bits (12 octets) aléatoires | Recommandation NIST SP 800-38D pour AES-GCM, renouvelé à chaque sauvegarde. |
| **Auth Tag** | 128 bits (16 octets) | Détection de toute altération même d'un seul bit du fichier chiffré. |

---

## ⚖️ Licence & Utilisation Académique

Projet réalisé dans le cadre du module **PAWEB** par les étudiants **Salhi Issam & Chouikha Imane** (L3 ISIL).  
Distribué sous licence **MIT**.
