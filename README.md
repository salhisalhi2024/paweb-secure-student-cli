# Secure Student CLI | أداة الإدارة الآمنة لملفات الطلاب والدرجات

> **FR :** Outil en ligne de commande (CLI) securise pour le stockage, le chiffrement et la consultation des releves de notes d'etudiants.  
> **AR :** أداة سطر أوامر (CLI) مؤمّنة بالكامل لتخزين، وتشفير، والبحث، واستعراض كشوف نقاط وسجلات الطلاب الحساسة محلياً.

---

### Contexte Academique & Auteurs | السياق الأكاديمي والطلبة المساهمون
- **Auteurs / الطلبة المنجزون :** Salhi Issam & Chouikha Imane
- **Niveau / المستوى الدراسي :** 3eme annee LMD Licence Informatique (L3 ISIL)
- **Module / المقياس :** PAWEB (Programmation et Applications Web)
- **Projet / المشروع :** Sujet 2 - Systeme de gestion locale securisee de releves de notes
- **Date limite de remise / تاريخ التسليم النهائي :** 18 Novembre 2026

---

## Enonce Officiel du Projet (Sujet 2) | نص الموضوع الرسمي

<div align="center">
  <img src="./assets/sujet-2-paweb.jpg" alt="Enonce Officiel Sujet 2 - PAWEB L3 ISIL" width="650" style="border-radius: 6px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); margin: 15px 0;" />
  <p><em>FR : Figure 1 - Sujet officiel n°2 distribue dans le cadre du module PAWEB (L3 ISIL).<br>AR : صورة 1 - الورقة الرسمية للموضوع الثاني لمقياس PAWEB للسنة الثالثة لسانس ISIL.</em></p>
</div>

---

## Objectifs Pedagogiques & Conformite | الأهداف البيداغوجية ومطابقة المنهاج

| Exigence du Sujet / متطلبات الموضوع | Implementation dans l'outil / طريقة الإنجاز في النظام | Conformite / المطابقة |
| :--- | :--- | :---: |
| **Node.js CLI** (سطر أوامر) | Interface CLI autonome en Node.js avec mode interactif et sous-commandes. | 100% |
| **AES-256-GCM** (تشفير موثق) | Chiffrement symetrique authentifie AEAD avec cle 256 bits et Auth Tag 128 bits. | 100% |
| **Zero API Web** (100% بدون إنترنت) | Fonctionnement hors-ligne strict, aucune requete HTTP, zero dependance externe. | 100% |
| **Zero texte en clair** (انعدام النص الصريح) | Aucun nom, matricule ou note n'est stocke en clair sur le disque local. | 100% |
| **Mot de passe maitre** (كلمة المرور) | Saisie dynamique securisee et masquee, derivation par fonction `scryptSync`. | 100% |
| **IV unique par ecriture** (تجديد الـ IV) | Generation d'un nouveau vecteur de 96 bits et d'un nouveau Salt a chaque sauvegarde. | 100% |

---

## Points Forts & Garanties de Securite | المميزات والضمانات الأمنية

- **AES-256-GCM (Galois/Counter Mode) :**  
  *FR :* Assure simultanement la **confidentialite** des donnees et leur **integrite** par validation d'un `Authentication Tag` de 128 bits.  
  *AR :* يوفر في آن واحد السرية المطلقة وسلامة البيانات ومنع التلاعب عبر وسم أصالة بحجم 128 بت.
- **Derivation de Cle Robuste (`scryptSync`) :**  
  *FR :* Derive une cle symetrique de 32 octets (256 bits). L'algorithme `scrypt` est gourmand en memoire (*Memory-hard*), ce qui neutralise les attaques par force brute (Brute-force) et cartes GPU.  
  *AR :* اشتقاق مفتاح تشفير بطول 256 بت؛ تتميز خوارزمية scrypt بكونها تستهلك الذاكرة الحية بشكل مكثف لمنع هجمات القوة الغاشمة وبطاقات الرسوميات المتطورة.
- **Vecteur d'Initialisation (IV) & Sel (Salt) Uniques :**  
  *FR :* Generation dynamique de 96 bits d'IV et 128 bits de Salt a chaque enregistrement. Previent definitivement la vulnerabilite de reutilisation d'IV (*Nonce Reuse*).  
  *AR :* توليد متجه تهيئة (IV) وملح عشوائي جديد عند كل عملية حفظ لمنع كارثة إعادة استخدام المفاتيح.
- **Zero Donnee en Clair sur Disque (Zero Plain Text) :**  
  *FR :* Les donnees dechiffrees ne resident qu'en memoire vive (RAM) le temps du traitement et s'effacent des la fermeture du processus.  
  *AR :* لا يتم حفظ أي معلومة بنص واضح على القرص الصلب؛ يتم استرجاع البيانات فقط في ذاكرة الرام أثناء التشغيل وتتلاشى فوراً.
- **100% Hors-Ligne (Air-gapped / Local-only) :**  
  *FR :* Aucune connexion internet requise. Zero transmission vers des tiers.  
  *AR :* يعمل النظام دون الحاجة إلى أي اتصال بالشبكة، مما يضمن أماناً تاماً للبيانات المدرسية الحساسة.
- **Zero Dependance Externe (Zero npm Dependencies) :**  
  *FR :* Developpe exclusivement avec les bibliotheques officielles integrees de Node.js (`crypto`, `fs`, `readline`). Aucune faille de chaine d'approvisionnement.  
  *AR :* تم الاعتماد حصراً على مكتبات Node.js القياسية دون أي حزم خارجية لتفادي ثغرات الحزم الخارجية.
- **Saisie Masquee du Mot de Passe :**  
  *FR :* Prise en charge du mode brut (*Raw Mode*) masquant la frappe par des etoiles `*` pour contrer le *Shoulder Surfing*.  
  *AR :* إخفاء كلمة المرور الرئيسية أثناء إدخالها في الطرفية واستبدالها بنجوم (*) للحماية من التلصص البصري.

---

## Installation & Configuration Rapide | التثبيت والتشغيل السريع

```bash
# 1. Cloner le depot GitHub / استنساخ المستودع
git clone https://github.com/salhisalhi2024/paweb-secure-student-cli.git

# 2. Acceder au repertoire / الدخول إلى مجلد المشروع
cd paweb-secure-student-cli

# 3. Lier la commande de maniere globale / ربط الأمر بالنظام عالمياً
npm link
```

Vous pouvez desormais lancer l'outil depuis n'importe quel dossier en ecrivant :  
يمكنكم تشغيل الأداة من أي مسار في الطرفية بكتابة :
```bash
secure-student-cli
```

---

## Galerie Visuelle du Projet en Action | معرض الصور التجريبية للأداة

<div align="center">
  <h3>1. Menu Interactif Principal & Saisie Securisee | القائمة التفاعلية الرئيسية</h3>
  <img src="./assets/screenshots/03_interactive_menu.png" alt="Menu Principal" width="800" style="border-radius: 6px; margin-bottom: 20px;" />

  <h3>2. Consultation des Relevees et Statistiques de Promotion | عرض السجلات والإحصائيات</h3>
  <img src="./assets/screenshots/04_list_and_stats.png" alt="Liste et Statistiques" width="800" style="border-radius: 6px; margin-bottom: 20px;" />

  <h3>3. Releve de Notes Officiel (Bulletin Academique) | كشف النقاط الرسمي</h3>
  <img src="./assets/screenshots/05_official_transcript.png" alt="Bulletin Officiel" width="800" style="border-radius: 6px; margin-bottom: 20px;" />

  <h3>4. Preuve du Chiffrement Physique (Zero Plain Text) | إثبات خلو القرص من النصوص الصريحة</h3>
  <img src="./assets/screenshots/08_raw_encrypted_vault.png" alt="Fichier Chiffre sur Disque" width="800" style="border-radius: 6px; margin-bottom: 20px;" />
</div>

---

## Guide d'Utilisation | دليل الاستخدام

### 1. Mode Interactif Convivial (Recommande) | الوضع التفاعلي المباشر
Lancez la commande sans argument pour afficher le menu complet :
```bash
secure-student-cli
```
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

---

### 2. Commandes Directes en Ligne de Commande | الأوامر المباشرة

#### Ajouter un etudiant | إضافة طالب جديد
```bash
secure-student-cli add
```
*FR :* Saisie guidee du matricule, nom, prenom, filiere, module et note sur 20.  
*AR :* إدخال تفاعلي منظم: رقم التسجيل، اللقب، الاسم، التخصص، المقياس، والعلامة من 20.

#### Afficher tous les releves & statistiques | عرض قائمة الطلاب والإحصائيات
```bash
secure-student-cli list
```
*FR :* Calcule automatiquement la moyenne generale de promotion, la note maximale et minimale.  
*AR :* عرض شامل مع حساب المعدل العام للدفعة، وأعلى وأدنى علامة مسجلة.

#### Rechercher un etudiant | البحث عن طالب
```bash
secure-student-cli search "BENALI"
# ou recherche par matricule / أو البحث بواسطة رقم التسجيل
secure-student-cli search "2024001"
```

#### Generer un bulletin officiel | استخراج كشف نقاط رسمي
```bash
secure-student-cli transcript "2024001"
```

#### Supprimer un etudiant | حذف طالب وإعادة تشفير الخزنة
```bash
secure-student-cli delete "2024001"
```

#### Consulter les parametres cryptographiques | فحص حالة الأمان
```bash
secure-student-cli status
```

---

## Tests Automatises & Demonstration | حزمة الاختبارات والعرض التوضيحي

### 1. Execution de la suite de tests | تشغيل الاختبارات الآلية
```bash
npm test
```
*FR :* Valide automatiquement 7 scenarios rigoureux (scrypt 256-bit, cycle AES-GCM, non-reutilisation de l'IV, rejet de mot de passe errone, detection d'alteration de fichier, absence de texte en clair, recherche et suppression).  
*AR :* اختبار آلي متكامل يشمل 7 مراحل للتحقق من الأمان الرياضي، وكشف التلاعب، وسلامة التخزين.

### 2. Generation de donnees de test immediate (Seed) | توليد بيانات جاهزة للتقييم
```bash
npm run seed
```
*FR :* Genere instantanement 5 profils d'etudiants chiffres pour faciliter l'evaluation par l'enseignant.  
*AR :* إنشاء فوري لخمسة طلاب مشفرين لاختبار وعرض عمل البرنامج أمام لجنة التقييم.

---

## Structure du Projet | هيكلية ملفات المشروع

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

## Synthese Technique des Specifications | ملخص المواصفات التقنية

| Parametre / المعيار | Valeur / القيمة | Role de Securite / الدور الأمني |
| :--- | :--- | :--- |
| **Algorithme / خوارزمية التشفير** | AES-256-GCM | Authenticated Encryption (AEAD) : Confidentialite + Integrite. |
| **Fonction KDF / اشتقاق المفاتيح** | `scryptSync` (N=16384, r=8, p=1) | Resistance aux attaques massives par GPU/ASIC et Brute-Force. |
| **Longueur de Cle / طول المفتاح** | 256 bits (32 octets) | Securite militaire maximale contre le dechiffrement non autorise. |
| **IV (Nonce) / متجه التهيئة** | 96 bits (12 octets) aleatoires | Recommandation NIST SP 800-38D, renouvele a chaque sauvegarde. |
| **Auth Tag / وسم الأصالة** | 128 bits (16 octets) | Detection immediate de toute falsification ou corruption sur disque. |

---

## Auteurs & Licence Academique | حقوق المشروع

Projet realise dans le cadre du module **PAWEB** (3eme annee LMD ISIL) par les etudiants :  
- **Salhi Issam**  
- **Chouikha Imane**  

Distribue sous licence **MIT** pour valorisation academique et pedagogique.
