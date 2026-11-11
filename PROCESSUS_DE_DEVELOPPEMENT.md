# 🛠️ Journal de Bord & Processus de Développement (Dev Journal)

> **Projet :** Outil CLI Sécurisé de Gestion des Relevés d'Étudiants (`secure-student-cli`)  
> **Contexte :** 3ème année L3 ISIL – Module PAWEB (Sujet 2)  
> **Auteurs :** Salhi Issam & Chouikha Imane  
> **Date :** Année Académique 2025 - 2026

---

## 1. Introduction & Contexte du Projet

Dans le cadre du module **PAWEB**, le **Sujet 2** impose la création d'un outil en ligne de commande (CLI) autonome développé avec **Node.js**, capable de gérer des données académiques hautement sensibles (identifiants d'étudiants, relevés de notes, moyennes).

<div align="center">
  <img src="./assets/sujet-2-paweb.jpg" alt="Énoncé Officiel Sujet 2 - PAWEB" width="600" style="border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); margin: 15px 0;" />
  <p><em>Figure : Énoncé officiel du Sujet 2 (PAWEB - 3ème LMD ISIL) remis le 28-10-2026.</em></p>
</div>

Les contraintes de sécurité formulées sont strictes :
1. **Algorithme de chiffrement :** Utilisation impérative d'**AES-256-GCM** (Galois/Counter Mode).
2. **Zéro API Web :** Fonctionnement à 100% hors-ligne (Air-gapped / Local-only).
3. **Zéro Texte en Clair sur Disque :** Aucune information sensible ne doit être enregistrée sans chiffrement préalable.
4. **Gestion du Mot de Passe Maître :** Le mot de passe ne doit jamais être codé en dur (hardcodé) ; il doit être saisi à l'exécution et transformé en clé de 256 bits via une fonction de dérivation robuste (`crypto.scryptSync`).
5. **Renouvellement du Vecteur d'Initialisation (IV) :** Un nouvel `IV` unique doit être produit pour chaque opération d'écriture.

---

## 2. Configuration de l'Environnement de Développement (Environment Setup)

### 2.1 Choix de l'Environnement d'Exécution
Nous avons opté pour **Node.js LTS (v24.x / compatible dès v18+)** avec l'activation native des **Modules ECMAScript (ESM)** via `"type": "module"` dans `package.json`.

### 2.2 Zéro Dépendance Externe (Principe de Minimisation de la Surface d'Attaque)
En cybersécurité logicielle, les dépendances externes tierces (`node_modules`) représentent le vecteur numéro un d'attaques par chaîne d'approvisionnement (Supply Chain Attacks / failles npm). Pour respecter les plus hauts standards d'intégrité, notre projet utilise **exclusivement** les modules natifs fournis par le runtime Node.js :
- `node:crypto` : Primitives cryptographiques certifiées (CSPRNG, AES-256-GCM, scrypt).
- `node:fs` : Manipulation du File System local pour la persistance chiffrée.
- `node:readline` : Gestion des flux d'entrée/sortie du terminal et invite utilisateur.
- `node:path` & `node:url` : Résolution déterministe des chemins de fichiers.
- `node:assert` : Validation formelle dans la suite de tests unitaires.

### 2.3 Définition du binaire global
Pour permettre l'exécution directe de l'outil sous le nom `secure-student-cli`, le fichier `package.json` a été configuré avec la section `"bin"` :
```json
{
  "name": "paweb-secure-student-cli",
  "version": "1.0.0",
  "type": "module",
  "bin": {
    "secure-student-cli": "./index.js"
  }
}
```
L'en-tête du fichier `index.js` intègre la directive Shebang universelle :
```javascript
#!/usr/bin/env node
```

---

## 3. Architecture Logicielle & Modularité

Afin de garantir la maintenabilité, la lisibilité et la testabilité du code, nous avons séparé le projet en modules découplés selon le principe de responsabilité unique (Single Responsibility Principle) :

```text
paweb-secure-student-cli/
├── index.js                  # Point d'entrée, parseur de commandes CLI & menu interactif
├── package.json              # Configuration du projet et commande globale
├── test.js                   # Suite de tests cryptographiques et fonctionnels
├── assets/
│   └── sujet-2-paweb.jpg     # Copie de l'énoncé officiel du sujet
├── src/
│   ├── crypto.js             # Moteur cryptographique (scrypt, AES-GCM, IV, Salt, AuthTag)
│   ├── storage.js            # Couche d'accès aux données chiffrées sur le File System
│   ├── studentService.js     # Logique métier (Ajout, Recherche, Relevés, Statistiques)
│   └── prompt.js             # Interaction terminal et masquage du mot de passe maître
```

### Flux d'Exécution :
1. L'utilisateur lance `secure-student-cli`.
2. L'interface affiche le menu ou traite l'argument passé en ligne de commande.
3. Le module `prompt.js` sollicite le mot de passe maître de manière sécurisée en masquant les frappes.
4. Le module `storage.js` lit le conteneur JSON chiffré depuis le disque.
5. Le module `crypto.js` vérifie l'Authentication Tag et déchiffre les données en mémoire vive (RAM).
6. L'opération demandée (recherche, ajout, consultation) est exécutée.
7. En cas de modification, un nouveau Salt et un nouveau vecteur d'initialisation (IV) sont générés, le tout est ré-encodé en AES-256-GCM et réécrit sur le disque.

---

## 4. Implémentation Cryptographique Approfondie (AES-256-GCM)

### 4.1 Pourquoi AES-256-GCM ?
Contrairement aux modes opératoires historiques comme CBC ou CTR, **AES-GCM (Galois/Counter Mode)** est un algorithme de type **AEAD (Authenticated Encryption with Associated Data)**.

> **ملاحظة بالعربية (توضيح مفهوم التشفير الموثق AEAD) :**  
> في خوارزميات التشفير التقليدية مثل AES-CBC، يحصل المستخدم على السرية فقط، لكن البيانات تكون عرضة للتلاعب أو هجمات Padding Oracle.  
> وضع **AES-256-GCM** يجمع بين التشفير فائق السرعة وتوليد وسم تحقق أصالة (**Authentication Tag**) بطول 128 بت. إذا قام أي شخص بتغيير حتى بايت واحد في الملف المشفر، ستفشل عملية فك التشفير تلقائياً ولن يتم تسريب أي بيانات.

### 4.2 Dérivation de Clé avec `crypto.scryptSync`
Un mot de passe humain ne possède pas l'entropie requise pour servir directement de clé AES de 256 bits (32 octets). De plus, l'utilisation d'une simple fonction de hachage comme SHA-256 est vulnérable aux attaques par tables précalculées (Rainbow Tables) et attaques massives par GPU/FPGA.

Nous utilisons donc **`scryptSync`**, une fonction de dérivation de clé (KDF) conçue pour être coûteuse en mémoire et en cycles processeur :

```javascript
export function deriveKey(password, salt) {
  return crypto.scryptSync(password, salt, 32, {
    N: 16384, // Coût CPU / Mémoire
    r: 8,     // Facteur de bloc
    p: 1      // Parallélisme
  });
}
```

> **ملاحظة بالعربية (لماذا scrypt وليس SHA-256؟) :**  
> تم تصميم خوارزمية **scrypt** لتكون صلبة على مستوى الذاكرة (**Memory-hard**)، مما يعني أنها تتطلب حجماً معلوماً من ذاكرة الرام لكل محاولة تخمين، مما يشل قدرة المهاجمين على استخدام مزارع كروت الشاشة (GPUs) أو أجهزة ASIC المتخصصة لكسر كلمات المرور.

### 4.3 Génération d'un Sel (Salt) et d'un Vecteur d'Initialisation (IV) Uniques
Pour chaque opération de chiffrement :
1. Un **Salt** de 16 octets (128 bits) est généré aléatoirement avec `crypto.randomBytes(16)`.
2. Un **IV** de 12 octets (96 bits, standard NIST SP 800-38D pour GCM) est généré avec `crypto.randomBytes(12)`.

> **ملاحظة بالعربية (أهمية تجديد IV في كل عملية) :**  
> إعادة استخدام نفس متجه التهيئة (IV) مع نفس المفتاح في وضع GCM يُعد خطأً أمنياً فادحاً (Nonce Reuse Disaster) قد يؤدي إلى كشف البيانات. لذلك، يحرص نظامنا على توليد IV جديد وعشوائي بالكامل مع كل حفظ.

### 4.4 Structure du Conteneur Cryptographique
Les données stockées sur le disque ne contiennent aucun texte en clair. Elles adoptent la structure suivante :

```json
{
  "algorithm": "aes-256-gcm",
  "salt": "3f9a7c... (32 caractères hex)",
  "iv": "e14b2d... (24 caractères hex)",
  "authTag": "8a01f9... (32 caractères hex)",
  "ciphertext": "6c4e09... (données chiffrées en hex)",
  "createdAt": "2026-11-11T00:45:00.000Z"
}
```

---

## 5. Conception de l'Interface en Ligne de Commande (CLI)

### 5.1 Saisie Sécurisée du Mot de Passe Maître (`src/prompt.js`)
Par défaut, lorsque l'utilisateur tape un mot de passe dans un terminal, les caractères s'affichent en clair. Pour pallier cela sans installer de paquet npm lourd, nous avons basculé le flux standard `process.stdin` en **Mode Brut (Raw Mode)** :
- Chaque frappe est interceptée individuellement.
- Un astérisque `*` est renvoyé à l'écran à chaque touche pour confirmer la frappe sans révéler la valeur.
- Les touches spéciales (Retour arrière `\b`, Entrée `\r\n`, et `Ctrl+C` pour l'interruption propre) sont prises en charge nativement.

### 5.2 Double Mode d'Exécution : Interactif & Argumentaire
Pour répondre aux exigences d'utilisabilité de l'évaluation académique, l'outil propose :
- **Mode Interactif :** En tapant simplement `secure-student-cli`, l'utilisateur dispose d'un menu complet avec choix numérique `[1-5]`.
- **Mode Ligne de Commande Directe :**
  - `secure-student-cli add`
  - `secure-student-cli list`
  - `secure-student-cli search <requête>`
  - `secure-student-cli status`
  - `secure-student-cli --help`

---

## 6. Méthodologie de Tests & Validation de Sécurité

Nous avons conçu une suite de tests unitaires et d'intégration (`test.js`) couvrant 7 scénarios de test critiques :

| N° | Intitulé du Test | Objectif de Sécurité / Fonctionnel | Résultat |
| :---: | :--- | :--- | :---: |
| **1** | Dérivation de clé scrypt | Vérification de la taille exacte (32 octets / 256 bits) et de la cohérence. | **PASS** |
| **2** | Aller-retour AES-256-GCM | Validation de l'intégrité des données après cycle Chiffrement / Déchiffrement. | **PASS** |
| **3** | Unicité stricte de l'IV | Vérification que 2 chiffrements d'un même texte produisent des IV et ciphertexts distincts. | **PASS** |
| **4** | Rejet de mauvais mot de passe | Vérification que le déchiffrement avec un mot de passe erroné lève `ERR_CRYPTO_AUTH_FAILED`. | **PASS** |
| **5** | Détection d'altération (Tampering) | Modification d'un bit dans le ciphertext : l'Auth Tag bloque immédiatement la lecture. | **PASS** |
| **6** | Zero Plain Text sur le disque | Lecture directe du fichier physique : aucun mot-clé sensible présent en clair. | **PASS** |
| **7** | Recherche & Statistiques | Validation de la logique métier (calcul de moyenne, recherche multi-critères). | **PASS** |

La suite s'exécute via la commande standard :
```bash
npm test
```

---

## 7. Bilan & Conclusion

Le développement de ce projet répond point par point au cahier des charges du **Sujet 2 (PAWEB)** :
- **Flawless & Production-ready :** Code robuste, modulaire, exempt de dépendances instables.
- **Sécurité Maximale :** Authenticated Encryption AES-256-GCM, dérivation scrypt, protection contre le rejeu de vecteur d'initialisation, absence de stockage en clair.
- **Ergonomie :** Interface interactive soignée en français avec masquage de saisie, commande globale via `npm link`.

---
*Document rédigé par Salhi Issam & Chouikha Imane – L3 ISIL – PAWEB.*

