# Journal de Bord & Processus de Developpement (Dev Journal)
# سجل ومراحل التطوير التفصيلية وفق المنهاج الجامعي الجزائري

---

> **Projet / المشروع :** Outil CLI Securise de Gestion des Releves de Notes (`secure-student-cli`)  
> **Niveau / المستوى الدراسي :** 3eme annee LMD Licence Informatique (Option : ISIL - Ingenierie des Systemes d'Information et des Logiciels)  
> **Module / المقياس :** PAWEB (Programmation et Applications Web)  
> **Sujet / موضوع المشروع :** Sujet n°2 - Systeme de stockage local chiffre sans API Web  
> **Auteurs / الطلبة المنجزون :** Salhi Issam & Chouikha Imane  
> **Date de remise / تاريخ التسليم :** 18 Novembre 2026

---

## 1. Introduction & Contexte Academique (Sujet 2 PAWEB)
## 1. المقدمة والسياق الأكاديمي لمشروع مقياس PAWEB

<div align="center">
  <img src="./assets/sujet-2-paweb.jpg" alt="Enonce Officiel Sujet 2 - PAWEB" width="620" style="border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); margin: 15px 0;" />
  <p><em>FR : Figure 1 - Copie officielle de l'enonce du Sujet n°2 remis aux etudiants le 28-10-2026.<br>AR : صورة 1 - النسخة الرسمية لنص الموضوع الثاني الموزع على طلبة السنة الثالثة LMD ISIL بتاريخ 28-10-2026.</em></p>
</div>

### Francais :
Dans le cadre des travaux pratiques avances du module **PAWEB** en 3eme annee Licence ISIL, le **Sujet 2** impose la creation d'une application Node.js en ligne de commande (CLI) autonome permettant de stocker, chiffrer, rechercher et consulter des releves de notes d'etudiants.  
Les exigences fondamentales sont :
1. Utilisation exclusive de l'algorithme de chiffrement symetrique authentifie **AES-256-GCM**.
2. **Zero API Web :** Fonctionnement en totale autarcie locale (100% Hors-ligne / Air-gapped).
3. **Zero texte en clair :** Aucune note ni dossier personnel ne doit etre stocke en clair sur le disque.
4. **Gestion dynamique du mot de passe maitre :** Derivation cryptographique robuste via `crypto.scryptSync`.
5. Renouvellement imperatif du vecteur d'initialisation (`IV`) a chaque operation d'ecriture.

### العربية :
يندرج هذا المشروع ضمن الأعمال التطبيقية المتقدمة لمقياس **PAWEB** (برمجة وتطبيقات الويب) الموجه لطلبة السنة الثالثة ليسانس إعلام آلي تخصص **ISIL** (هندسة نظم المعلومات والبرمجيات).  
يهدف **الموضوع الثاني (Sujet 2)** إلى تطوير أداة طرفية (CLI) باستخدام منصة **Node.js** لإدارة كشوف وعلامات الطلاب الحساسة محلياً، مع الامتثال الصارم للشروط التالية:
1. الاعتماد حصراً على خوارزمية التشفير المتناظر الموثق **AES-256-GCM**.
2. **انعدام استخدام واجهات البرمجة الشبكية (Zero API Web)**: تشغيل محلي 100% دون أي اتصال خارجي.
3. **منع التخزين الصريح (Zero Plain Text)**: حظر حفظ أي علامة أو اسم طالب كنص واضح على القرص الصلب.
4. **الإدارة الآمنة لكلمة المرور**: طلب كلمة المرور في وقت التشغيل واشتقاق مفتاح 256 بت باستخدام دالة `scryptSync`.
5. **تجديد متجه التهيئة (IV)**: إلزامية توليد متجه عشوائي جديد عند كل عملية تشفير وتخزين.

---

## 2. Configuration de l'Environnement de Developpement
## 2. إعداد بيئة التطوير والمنصة البرمجية

### Francais :
- **Runtime :** Node.js LTS (v24.x, retrocompatible des v18+).
- **Format des modules :** ECMAScript Modules (ESM) natifs grace a `"type": "module"` dans `package.json`.
- **Principe de minimisation de la surface d'attaque (Zero npm Dependencies) :**  
  Pour eviter toute vulnerabilite liee aux paquets tiers (Supply Chain Vulnerabilities), le projet n'utilise **aucune dependance externe**. Il s'appuie a 100% sur les modules integres au coeur de Node.js :
  - `node:crypto` : Fonctions cryptographiques certifiees (scryptSync, AES-256-GCM, randomBytes).
  - `node:fs` : Manipulation securisee des fichiers locaux.
  - `node:readline` : Lecture interactive et gestion des flux d'entree du terminal.
  - `node:path` & `node:url` : Resolution robuste et portable des chemins de fichiers.
  - `node:assert` : Cadre formel de validation pour les tests unitaires.

### العربية :
- **بيئة التشغيل :** Node.js بإصداره طويل الدعم (LTS).
- **نظام الوحدات :** الوحدات الحديثة (ES Modules) المعرفة عبر `"type": "module"` في ملف `package.json`.
- **مبدأ تقليص مساحة الهجوم وانعدام الحزم الخارجية (Zero External Dependencies) :**  
  تطبيقاً لمفاهيم الأمان السيبراني المدروسة في مقياس أمن النظم، تم تجنب تثبيت أي مكتبة خارجية عبر npm لتفادي هجمات سلاسل التوريد البرمجية (Supply Chain Attacks). تم الاكتفاء كلياً بمكتبات Node.js القياسية الموثوقة.

---

## 3. Architecture Logicielle Modulaire
## 3. الهيكلية البرمجية وتوزيع المسؤوليات (Software Architecture)

```text
paweb-secure-student-cli/
├── index.js                      # Point d'entree executable (CLI Router & Menu interactif)
├── package.json                  # Definition du projet, binaire global et scripts
├── .gitignore                    # Exclusion des fichiers temporaires et donnees sensibles
├── test.js                       # Suite complete de tests unitaires et cryptographiques
├── seed.js                       # Generateur de donnees de demonstration pour evaluation
├── generate_screenshots.js       # Script de generation des captures de demonstration
├── README.md                     # Manuel utilisateur bilingue (Francais / Arabe)
├── PROCESSUS_DE_DEVELOPPEMENT.md # Journal de bord technique approfondi selon le cursus
├── assets/
│   ├── sujet-2-paweb.jpg         # Photo scannee de l'enonce officiel du sujet
│   └── screenshots/              # Captures d'ecran haute precision de chaque etape
└── src/
    ├── crypto.js                 # Coeur cryptographique (AES-256-GCM, scryptSync, IV, Salt)
    ├── storage.js                # Gestion du stockage chiffre sur disque (Zero Plain Text)
    ├── studentService.js         # Logique metier (Ajout, Recherche, Releves, Bulletins, Stats)
    └── prompt.js                 # Saisie securisee et masquage du mot de passe en Raw Mode
```

---

## 4. Implementation Cryptographique & Preuve de Securite
## 4. البناء الرياضي لنظام التشفير والدليل على انعدام النص الصريح

### 4.1 Pourquoi AES-256-GCM et scrypt ? | لماذا AES-256-GCM و scrypt؟
- **AES-256-GCM (Galois/Counter Mode) :** Mode de chiffrement symetrique authentifie (**AEAD**) garantissant la **confidentialite** et l'**integrite** via une etiquette d'authentification (**Authentication Tag**) de 128 bits.
- **scryptSync :** Fonction de derivation de cle (**Memory-hard**) concue pour neutraliser les attaques par force brute (Brute-force) et cartes GPU.
- **Renouvellement IV & Sel :** Generation aleatoire d'un nouvel `IV` (12 octets / 96 bits) et d'un nouveau `Salt` (16 octets / 128 bits) a chaque ecriture pour interdire la vulnerabilite de reutilisation d'IV (*Nonce Reuse Disaster*).

### 4.2 Preuve Experimentale du Chiffrement sur Disque (Zero Plain Text)
<div align="center">
  <img src="./assets/screenshots/08_raw_encrypted_vault.png" alt="Preuve du chiffrement physique sur disque" width="850" style="border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.25); margin: 15px 0;" />
  <p><em>FR : Figure 2 - Inspection directe du fichier physique : Aucun nom, matricule ou note n'apparait en clair.<br>AR : صورة 2 - المعاينة المباشرة للملف الفيزيائي على القرص الصلب تثبت غياب أي بيانات نصية صريحة.</em></p>
</div>

---

## 5. Interface Utilisateur & Interaction Securisee
## 5. واجهة الاستخدام والأوامر التفاعلية المنفذة

### 5.1 Menu Interactif Principal (secure-student-cli)
<div align="center">
  <img src="./assets/screenshots/03_interactive_menu.png" alt="Menu Interactif Principal" width="850" style="border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.25); margin: 15px 0;" />
  <p><em>FR : Figure 3 - Menu principal interactif offrant un acces intuitif a l'ensemble des fonctionnalites.<br>AR : صورة 3 - القائمة الرئيسية التفاعلية للأداة مع إبراز معلومات الطلبة والخيارات المتاحة.</em></p>
</div>

---

### 5.2 Consultation Globale des Releves & Statistiques de Promotion
<div align="center">
  <img src="./assets/screenshots/04_list_and_stats.png" alt="Consultation et Statistiques" width="850" style="border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.25); margin: 15px 0;" />
  <p><em>FR : Figure 4 - Affichage formate des dossiers etudiants, mentions et calcul automatique des statistiques de promotion.<br>AR : صورة 4 - عرض سجلات الطلبة مع التقديرات والحساب الآلي لمعدل الدفعة وأعلى وأدنى علامة.</em></p>
</div>

---

### 5.3 Generation d'un Releve de Notes Officiel (Bulletin Academique)
<div align="center">
  <img src="./assets/screenshots/05_official_transcript.png" alt="Bulletin Officiel de Notes" width="850" style="border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.25); margin: 15px 0;" />
  <p><em>FR : Figure 5 - Releve de notes officiel complet avec decision du jury et signature cryptographique.<br>AR : صورة 5 - كشف نقاط أكاديمي رسمي متكامل مع قرار اللجنة والبصمة التشفيرية.</em></p>
</div>

---

### 5.4 Recherche Instantanee d'Etudiant
<div align="center">
  <img src="./assets/screenshots/06_search_student.png" alt="Recherche Instantanee" width="850" style="border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.25); margin: 15px 0;" />
  <p><em>FR : Figure 6 - Recherche instantanee insensible a la casse par matricule, nom ou prenom.<br>AR : صورة 6 - محرك البحث الفوري عن الطلبة بالاسم أو برقم التسجيل.</em></p>
</div>

---

### 5.5 Audit et Statut de Securite du Coffre-Fort
<div align="center">
  <img src="./assets/screenshots/07_security_status.png" alt="Audit et Parametres Cryptographiques" width="850" style="border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.25); margin: 15px 0;" />
  <p><em>FR : Figure 7 - Rapport d'audit de securite confirmant l'etat actif d'AES-256-GCM et le fonctionnement 100% hors-ligne.<br>AR : صورة 7 - تقرير التدقيق الأمني الذي يؤكد فاعلية التشفير وانعدام أي استهلاك للشبكة.</em></p>
</div>

---

## 6. Methodologie de Tests & Validation de Securite
## 6. منهجية الاختبار والتحقق الأمني الشامل

<div align="center">
  <img src="./assets/screenshots/01_tests_execution.png" alt="Execution des Tests Automatises" width="850" style="border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.25); margin: 15px 0;" />
  <p><em>FR : Figure 8 - Validation avec succes des 7 tests cryptographiques et fonctionnels (npm test).<br>AR : صورة 8 - النجاح التام لكافة الاختبارات الأمنية والوظيفية السبعة عبر أمر npm test.</em></p>
</div>

### Scenarios valides automatiquement :
1. **Test 1 - Derivation scrypt :** Cle de 32 octets (256 bits) conforme aux specifications.
2. **Test 2 - Aller-retour AES-256-GCM :** Restitution parfaite des donnees chiffrees sans corruption.
3. **Test 3 - Unicite de l'IV & Salt :** Deux chiffrements successifs du meme texte produisent obligatoirement des IV et ciphertexts differents.
4. **Test 4 - Rejet de mauvais mot de passe :** Levee immediate de l'erreur `ERR_CRYPTO_AUTH_FAILED` via l'Authentication Tag.
5. **Test 5 - Detection d'alteration (Anti-Tampering) :** La modification d'un seul octet dans le fichier chiffre bloque le dechiffrement.
6. **Test 6 - Zero Plain Text :** Absence absolue de texte en clair dans le fichier de stockage sur disque.
7. **Test 7 - Fonctions metier :** Ajout, recherche, consultation et suppression d'etudiants.

---

## 7. Guide d'Evaluation Rapide pour l'Enseignant
## 7. دليل التقييم السريع الموجه للأستاذ المشرف

<div align="center">
  <img src="./assets/screenshots/02_seed_initialization.png" alt="Generation de Donnees de Test" width="850" style="border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.25); margin: 15px 0;" />
  <p><em>FR : Figure 9 - Initialisation instantanee de 5 dossiers d'etudiants chiffres pour faciliter la soutenance.<br>AR : صورة 9 - التوليد الفوري لخمسة ملفات طلاب مشفرة لتسهيل العرض والمناقشة.</em></p>
</div>

### Commandes a executer lors de la soutenance :
```bash
# 1. Cloner et configurer l'outil / استنساخ وتهيئة الأداة
git clone https://github.com/salhisalhi2024/paweb-secure-student-cli.git
cd paweb-secure-student-cli
npm link

# 2. Executer la suite complete de tests de securite / تشغيل الاختبارات الآلية
npm test

# 3. Generer instantanement des donnees de test realistes / توليد بيانات تجريبية فورية
npm run seed

# 4. Lancer les commandes de consultation / استعراض البيانات
secure-student-cli list
secure-student-cli transcript "2024001"
secure-student-cli search "SALHI"
secure-student-cli status
```

---

## 8. Bilan & Conclusion
## 8. الخاتمة وحصيلة الإنجاز

### Francais :
Ce projet concretise l'ensemble des notions theoriques et pratiques dispensees dans le cursus **L3 ISIL** :
- Maitrise avancee du runtime **Node.js** et de l'architecture sans dependances.
- Application rigoureuse des standards cryptographiques modernes (**AES-256-GCM**, **scrypt**).
- Ergonomie soignee repondant aux exigences des logiciels en ligne de commande de qualite professionnelle.

### العربية :
يجسد هذا المشروع المخرجات التعليمية المستهدفة في منهاج **السنة الثالثة ليسانس ISIL**:
- التحكم البرمجي العالي في منصة **Node.js** واستغلال مكتباتها الأصلية دون حزم خارجية.
- التطبيق العملي لمفاهيم التشفير الموثق والأمان السيبراني الحديث (**AES-256-GCM** و **scrypt**).
- بناء أداة طرفية احترافية ذات واجهة تفاعلية سهلة الاستخدام وموثقة بالكامل لخدمة الإدارة الجامعية.

---
*Fait par Salhi Issam & Chouikha Imane - L3 ISIL - PAWEB 2025/2026.*  
*تم الإنجاز بعون الله وتوفيقه من قبل الطالبين: صالحي عصام وشويخة إيمان.*
