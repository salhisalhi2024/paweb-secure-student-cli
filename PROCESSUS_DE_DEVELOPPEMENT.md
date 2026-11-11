# 🛠️ Journal de Bord & Processus de Développement (Dev Journal)
# سجل ومراحل التطوير التفصيلية وفق المنهاج الجامعي الجزائري

---

> **Projet / المشروع :** Outil CLI Sécurisé de Gestion des Relevés de Notes (`secure-student-cli`)  
> **Niveau / المستوى الدراسي :** 3ème année LMD Licence Informatique (Option : ISIL - Ingénierie des Systèmes d'Information et des Logiciels)  
> **Module / المقياس :** PAWEB (Programmation et Applications Web)  
> **Sujet / موضوع المشروع :** Sujet n°2 – Système de stockage local chiffré sans API Web  
> **Auteurs / الطلبة المنجزون :** Salhi Issam & Chouikha Imane  
> **Date de remise / تاريخ التسليم :** 18 Novembre 2026

---

## 1. Introduction & Contexte Académique (Sujet 2 PAWEB)
## 1. المقدمة والسياق الأكاديمي لمشروع مقياس PAWEB

<div align="center">
  <img src="./assets/sujet-2-paweb.jpg" alt="Énoncé Officiel Sujet 2 - PAWEB" width="600" style="border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); margin: 15px 0;" />
  <p><em>FR : Figure 1 – Copie officielle de l'énoncé du Sujet n°2 remis aux étudiants le 28-10-2026.<br>AR : صورة 1 – النسخة الرسمية لنص الموضوع الثاني الموزع على طلبة السنة الثالثة LMD ISIL بتاريخ 28-10-2026.</em></p>
</div>

### Français :
Dans le cadre des travaux pratiques avancés du module **PAWEB** en 3ème année Licence ISIL, le **Sujet 2** impose la création d'une application Node.js en ligne de commande (CLI) autonome permettant de stocker, chiffrer, rechercher et consulter des relevés de notes d'étudiants.  
Les exigences fondamentales sont :
1. Utilisation exclusive de l'algorithme de chiffrement symétrique authentifié **AES-256-GCM**.
2. **Zéro API Web :** Fonctionnement en totale autarcie locale (100% Hors-ligne / Air-gapped).
3. **Zéro texte en clair :** Aucune note ni dossier personnel ne doit être stocké en clair sur le disque.
4. **Gestion dynamique du mot de passe maître :** Dérivation cryptographique robuste via `crypto.scryptSync`.
5. Renouvellement impératif du vecteur d'initialisation (`IV`) à chaque opération d'écriture.

### العربية :
يندرج هذا المشروع ضمن الأعمال التطبيقية المتقدمة لمقياس **PAWEB** (برمجة وتطبيقات الويب) الموجه لطلبة السنة الثالثة ليسانس إعلام آلي تخصص **ISIL** (هندسة نظم المعلومات والبرمجيات).  
يهدف **الموضوع الثاني (Sujet 2)** إلى تطوير أداة طرفية (CLI) باستخدام منصة **Node.js** لإدارة كشوف وعلامات الطلاب الحساسة محلياً، مع الامتثال الصارم للشروط التالية:
1. الاعتماد حصراً على خوارزمية التشفير المتناظر الموثق **AES-256-GCM**.
2. **انعدام استخدام واجهات البرمجة الشبكية (Zéro API Web)**: تشغيل محلي 100% دون أي اتصال خارجي.
3. **منع التخزين الصريح (Zero Plain Text)**: حظر حفظ أي علامة أو اسم طالب كنص واضح على القرص الصلب.
4. **الإدارة الآمنة لكلمة المرور**: طلب كلمة المرور في وقت التشغيل واشتقاق مفتاح 256 بت باستخدام دالة `scryptSync`.
5. **تجديد متجه التهيئة (IV)**: إلزامية توليد متجه عشوائي جديد عند كل عملية تشفير وتخزين.

---

## 2. Configuration de l'Environnement de Développement
## 2. إعداد بيئة التطوير والمنصة البرمجية

### Français :
- **Runtime :** Node.js LTS (v24.x, rétrocompatible dès v18+).
- **Format des modules :** ECMAScript Modules (ESM) natifs grâce à `"type": "module"` dans `package.json`.
- **Principe de minimisation de la surface d'attaque (Zero npm Dependencies) :**  
  Pour éviter toute vulnérabilité liée aux paquets tiers (Supply Chain Vulnerabilities), le projet n'utilise **aucune dépendance externe**. Il s'appuie à 100% sur les modules intégrés au cœur de Node.js :
  - `node:crypto` : Fonctions cryptographiques de haut niveau (scryptSync, AES-256-GCM, randomBytes).
  - `node:fs` : Manipulation sécurisée des fichiers locaux.
  - `node:readline` : Lecture interactive et gestion des flux d'entrée du terminal.
  - `node:path` & `node:url` : Résolution robuste et portable des chemins de fichiers.
  - `node:assert` : Cadre formel de validation pour les tests unitaires.

### العربية :
- **بيئة التشغيل :** Node.js بإصداره طويل الدعم (LTS).
- **نظام الوحدات :** الوحدات الحديثة (ES Modules) المعرفة عبر `"type": "module"` في ملف `package.json`.
- **مبدأ تقليص مساحة الهجوم وانعدام الحزم الخارجية (Zero External Dependencies) :**  
  تطبيقاً لمفاهيم الأمان السيبراني المدروسة في مقياس أمن النظم، تم تجنب تثبيت أي مكتبة خارجية عبر npm لتفادي هجمات سلاسل التوريد البرمجية (Supply Chain Attacks). تم الاكتفاء كلياً بمكتبات Node.js القياسية الموثوقة:
  - `node:crypto` : لتنفيذ العمليات الرياضية التشفيرية المتقدمة وتوليد الأرقام العشوائية الأمنية.
  - `node:fs` : للقراءة والكتابة الفيزيائية المشفرة على القرص.
  - `node:readline` : لإدارة التفاعل وقراءة مدخلات المستخدم عبر الطرفية.
  - `node:path` و `node:url` : للتعامل المحكم مع مسارات الملفات عبر مختلف أنظمة التشغيل.
  - `node:assert` : لإجراء اختبارات الوحدة الصارمة والتحقق من صحة النتائج.

---

## 3. Architecture Logicielle Modulaire
## 3. الهيكلية البرمجية وتوزيع المسؤوليات (Software Architecture)

### Français :
L'application a été conçue selon le principe de séparation des responsabilités (*Separation of Concerns*) :

```text
paweb-secure-student-cli/
├── index.js                      # Point d'entrée exécutable (CLI Router & Menu interactif)
├── package.json                  # Définition du projet, binaire global et scripts
├── .gitignore                    # Exclusion des fichiers temporaires et données sensibles
├── test.js                       # Suite complète de tests unitaires et cryptographiques
├── seed.js                       # Générateur de données de démonstration pour évaluation
├── README.md                     # Manuel utilisateur bilingue (Français / Arabe)
├── PROCESSUS_DE_DEVELOPPEMENT.md # Journal de bord technique approfondi selon le cursus
├── assets/
│   └── sujet-2-paweb.jpg         # Photo scannée de l'énoncé officiel du sujet
└── src/
    ├── crypto.js                 # Cœur cryptographique (AES-256-GCM, scryptSync, IV, Salt)
    ├── storage.js                # Gestion du stockage chiffré sur disque (Zero Plain Text)
    ├── studentService.js         # Logique métier (Ajout, Recherche, Relevés, Bulletins, Stats)
    └── prompt.js                 # Saisie sécurisée et masquage du mot de passe en Raw Mode
```

### العربية :
تم بناء التطبيق وفق أفضل الممارسات الهندسية لفصل المهام (Separation of Concerns)، حيث تم تقسيم المشروع إلى وحدات وظيفية مستقلة:
- `index.js`: الموجه الرئيسي للأوامر، يحتوي على القائمة التفاعلية ونظام توجيه المدخلات.
- `src/crypto.js`: المحرك التشفيري، مسؤول عن اشتقاق المفاتيح وخوارزمية AES-GCM.
- `src/storage.js`: وحدة التخزين المحلي، تضمن قراءة وكتابة الحاويات المشفرة فقط.
- `src/studentService.js`: منطق الأعمال الأكاديمي (إضافة، بحث، حساب المعدلات، كشوف النقاط الرسمية، والحذف).
- `src/prompt.js`: وحدة قراءة المدخلات بشكل آمن مع إخفاء كلمة المرور الرئيسية.

---

## 4. Implémentation Cryptographique Détaillée (AES-256-GCM & scrypt)
## 4. البناء الرياضي لنظام التشفير (AES-256-GCM واشتقاق المفاتيح)

### 4.1 Pourquoi le mode AES-256-GCM ? | لماذا وضع GCM؟
#### Français :
Le mode GCM (*Galois/Counter Mode*) est un standard de chiffrement symétrique authentifié (**AEAD**). Il combine le mode CTR pour la rapidité et la confidentialité, avec la multiplication de Galois (GMAC) pour produire une étiquette d'authentification (**Authentication Tag**) de 128 bits. Si un attaquant modifie ne serait-ce qu'un seul octet dans le fichier chiffré, le déchiffrement est immédiatement bloqué.

#### العربية :
يعد وضع **GCM** المعيار الذهبي في التشفير المتناظر الموثق (**AEAD - Authenticated Encryption with Associated Data**). فهو يدمج بين السرعة الفائقة لنمط العداد (CTR) والتحقق الرياضي الدقيق عبر حقول غالوا (Galois GMAC) لينتج وسم تحقق أصالة (**Authentication Tag**) بطول 128 بت. يضمن هذا النمط الحماية المتزامنة للسرية والسلامة، ويكتشف فوراً أي محاولة تعديل أو تخريب للملف المشفر.

---

### 4.2 Dérivation de Clé avec `crypto.scryptSync` | اشتقاق المفاتيح بواسطة scrypt
#### Français :
Une clé AES-256 nécessite exactement 32 octets pseudo-aléatoires à haute entropie. Un mot de passe humain en est dépourvu. Pour pallier cela, nous utilisons `scrypt`, une fonction KDF conçue pour être coûteuse en mémoire vive (**Memory-hard**), rendant les attaques par GPU ou circuits spécialisés (ASIC) inopérantes :

```javascript
export function deriveKey(password, salt) {
  return crypto.scryptSync(password, salt, 32, {
    N: 16384, // Coût mémoire/CPU (Iterations)
    r: 8,     // Taille des blocs
    p: 1      // Parallélisme
  });
}
```

#### العربية :
تتطلب خوارزمية AES-256 مفتاحاً ثنائياً عالي العشوائية بطول 32 بايت (256 بت)، وهو ما لا تحققه كلمات المرور النصية العادية. لذا تم استخدام دالة **scrypt** المصنفة كدالة اشتقاق مفاتيح مكلفة من حيث استهلاك الذاكرة والمعالجة (**Memory-hard**)، مما يحبط هجمات القوة الغاشمة (Brute-force) وهجمات القواميس المنفذة عبر كروت الشاشة الحديثة أو أجهزة التعدين المخصصة.

---

### 4.3 Gestion Unique du Vecteur d'Initialisation (IV) & Sel (Salt) | إدارة متجه التهيئة والملح
#### Français :
La réutilisation d'un même IV avec la même clé dans le mode GCM détruit la sécurité cryptographique (*Nonce Reuse Disaster*). Pour respecter strictement le sujet :
1. Un nouveau **Salt** aléatoire de 16 octets est tiré à chaque écriture.
2. Un nouveau vecteur **IV** aléatoire de 12 octets (96 bits, standard NIST SP 800-38D) est tiré à chaque écriture via `crypto.randomBytes(12)`.
3. Le conteneur enregistré sur disque contient : `{ algorithm, salt, iv, authTag, ciphertext, createdAt }`.

#### العربية :
إن إعادة استخدام نفس متجه التهيئة (IV) مع نفس المفتاح في نمط GCM يؤدي إلى انهيار منظومة الأمان الرياضية بالكامل. لتفادي هذا الخطر:
1. يتم توليد ملح تشفيري (**Salt**) جديد عشوائي بطول 16 بايت في كل عملية حفظ.
2. يتم توليد متجه تهيئة (**IV**) جديد وعشوائي بطول 12 بايت (96 بت وفق توصية NIST الدولية) باستخدام المولد الآمن `crypto.randomBytes(12)`.
3. يتم تجميع الحاوية المشفرة على شكل كائن JSON خالٍ تماماً من أي نص صريح.

---

## 5. Interaction Terminal Sécurisée (Mode Brut / Raw Mode)
## 5. إدارة واجهة سطر الأوامر والإدخال السري لكلمة المرور

### Français :
Par défaut, le terminal affiche les caractères saisis. Pour protéger le mot de passe maître des regards indiscrets (*Shoulder Surfing*), le module `src/prompt.js` active le mode brut de Node.js (`process.stdin.setRawMode(true)`) :
- Les caractères ne sont pas affichés en clair mais remplacés en temps réel par des astérisques `*`.
- La touche retour arrière (`Backspace`) est gérée pour effacer proprement le caractère en mémoire et sur la console (`\b \b`).
- La combinaison `Ctrl+C` est interceptée pour quitter proprement sans laisser de traces.

### العربية :
في الأحوال العادية، تقوم الطرفية بطباعة الحروف المدخلة مباشرة على الشاشة. لحماية كلمة المرور الرئيسية من التلصص البصري المباشر (Shoulder Surfing):
- تم تفعيل الوضع الخام للطرفية (`Raw Mode`) لالتقاط كل ضغطة زر فرادى.
- استبدال الحروف بنجوم مسايرة لحجم الكلمة (`*`) دون إظهار النص الحقيقي.
- دعم كامل لزر المسح (`Backspace`) لتعديل الكلمة، والتعامل السليم مع اختصار المقاطعة (`Ctrl+C`).

---

## 6. Méthodologie de Test & Validation de Sécurité
## 6. منهجية الاختبار والتحقق الأمني الشامل

### Français :
Le fichier [`test.js`](file:///c:/Users/PCSTAR/Documents/paweb-secure-student-cli/test.js) exécute une batterie complète de 7 tests automatisés validant :
1. **Conformité de la dérivation de clé :** Clé scrypt de 256 bits conforme.
2. **Cycle de chiffrement/déchiffrement :** Restitution parfaite des données sans altération.
3. **Unicité stricte de l'IV :** Deux chiffrements consécutifs produisent des IV et des ciphertexts différents.
4. **Rejet de mot de passe erroné :** Échec immédiat avec levée de `ERR_CRYPTO_AUTH_FAILED`.
5. **Détection d'altération (Tampering) :** La modification d'un seul octet dans le fichier chiffré bloque le déchiffrement via l'Auth Tag.
6. **Zéro texte en clair :** Inspection directe du fichier physique vérifiant l'absence absolue de noms, notes ou matricules en clair.
7. **Fonctions métier :** Ajout, recherche multi-critères, consultation et suppression d'étudiants.

### العربية :
يتضمن ملف الاختبارات المدمج [`test.js`](file:///c:/Users/PCSTAR/Documents/paweb-secure-student-cli/test.js) سبعة اختبارات آلية صارمة يمكن تشغيلها عبر `npm test`:
1. التحقق من صحة طول المفتاح المشتق (256 بت).
2. التحقق من سلامة دورة التشفير وفك التشفير التناظري.
3. التأكد من فرادة متجه التهيئة (IV) عند كل عملية متتالية.
4. التأكد من الرفض الفوري لأي كلمة مرور غير صحيحة.
5. اختبار كشف التلاعب (Tampering): تعديل بايت واحد في النص المشفر يؤدي مباشرة لفشل التحقق وحجب البيانات.
6. التأكد الفيزيائي من خلو ملف التخزين على القرص من أي نص صريح للطلاب أو النقاط.
7. التحقق من كافة الدوال الوظيفية: الإضافة، البحث، استخراج كشف النقاط، والحذف.

---

## 7. Guide d'Évaluation & Démonstration Académique
## 7. دليل التقييم الأكاديمي والعرض التوضيحي للجنة المناقشة

### Français :
Pour une soutenance ou une évaluation rapide par l'enseignant du module PAWEB :

```bash
# 1. Cloner et configurer l'outil / استنساخ وتهيئة الأداة
git clone https://github.com/salhisalhi2024/paweb-secure-student-cli.git
cd paweb-secure-student-cli
npm link

# 2. Exécuter la suite complète de tests de sécurité / تشغيل الاختبارات الآلية
npm test

# 3. Générer instantanément des données de test réalistes / توليد بيانات تجريبية فورية
npm run seed

# 4. Lancer le menu interactif ou les commandes directes / تشغيل الأداة
secure-student-cli list
secure-student-cli transcript "2024001"
secure-student-cli search "SALHI"
secure-student-cli status
```

### العربية :
لتسهيل تقييم المشروع من قبل الأستاذ المشرف أثناء المداولات أو المناقشة الحضورية:
1. استنساخ المشروع وربطه بالأمر العام عبر `npm link`.
2. تشغيل الاختبارات للتأكد من نجاح كافة الشروط الأمنية عبر `npm test`.
3. استخدام أمر `npm run seed` لتوليد 5 طلاب تجريبيين بدرجات مختلفة لتسهيل المعاينة الفورية.
4. استعراض كشف النقاط الرسمي عبر `secure-student-cli transcript "2024001"`.

---

## 8. Bilan & Conclusion
## 8. الخاتمة وحصيلة الإنجاز

### Français :
Ce projet concrétise l'ensemble des notions théoriques et pratiques dispensées dans le cursus **L3 ISIL** :
- Maîtrise avancée du runtime **Node.js** et de l'architecture sans dépendances.
- Application rigoureuse des standards cryptographiques modernes (**AES-256-GCM**, **scrypt**).
- Ergonomie soignée répondant aux exigences des logiciels en ligne de commande de qualité industrielle.

### العربية :
يجسد هذا المشروع المخرجات التعليمية المستهدفة في منهاج **السنة الثالثة ليسانس ISIL**:
- التحكم البرمجي العالي في منصة **Node.js** واستغلال مكتباتها الأصلية دون حزم خارجية.
- التطبيق العملي لمفاهيم التشفير الموثق والأمان السيبراني الحديث (**AES-256-GCM** و **scrypt**).
- بناء أداة طرفية احترافية ذات واجهة تفاعلية سهلة الاستخدام وموثقة بالكامل لخدمة الإدارة الجامعية.

---
*Fait par Salhi Issam & Chouikha Imane – L3 ISIL – PAWEB 2025/2026.*  
*تم الإنجاز بعون الله وتوفيقه من قبل الطالبين: صالحي عصام وشويخة إيمان.*
