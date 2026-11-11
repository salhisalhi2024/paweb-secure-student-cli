/**
 * ============================================================================
 * MODULE D'INTERACTION TERMINAL / وحدة التفاعل وقراءة المدخلات في الطرفية
 * ============================================================================
 * Auteurs / المؤلفون : Salhi Issam & Chouikha Imane (L3 ISIL - Module PAWEB)
 * Fonctionnalité clé / الميزة الأساسية : Saisie masquée du mot de passe (Raw Mode)
 * ============================================================================
 */

import readline from 'node:readline';

/**
 * Pose une question textuelle standard dans la console.
 * [FR] Utilise l'interface readline standard de Node.js.
 * [AR] طرح سؤال نصي قياسي على المستخدم وقراءة الإجابة.
 * 
 * @param {string} query - Question / نص السؤال
 * @returns {Promise<string>}
 */
export function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

/**
 * Invite l'utilisateur à saisir son mot de passe maître de façon sécurisée en masquant les frappes.
 * 
 * [FR] Active le Raw Mode sur process.stdin pour intercepter chaque caractère sans écho direct,
 *      remplaçant les caractères saisis par des astérisques (*) pour parer au Shoulder Surfing.
 * [AR] قراءة كلمة المرور الرئيسية في الطرفية بشكل آمن مع إخفاء الحروف واستبدالها بنجوم (*).
 *      يتم ضبط الطرفية على الوضع الخام (Raw Mode) لمنع طباعة النص الصريح في سجل الأوامر أو الشاشة،
 *      مما يحمي المفتاح من التلصص البصري المباشر.
 * 
 * @param {string} promptMessage - Message d'invite / رسالة الطلب
 * @returns {Promise<string>} Mot de passe saisi / كلمة المرور
 */
export function askPassword(promptMessage = 'Entrez le mot de passe maître / أدخل كلمة المرور الرئيسية : ') {
  return new Promise((resolve) => {
    const stdin = process.stdin;
    const stdout = process.stdout;

    stdout.write(promptMessage);

    // Si le terminal n'est pas un TTY (ex: script ou pipe automatisé) / إذا كان الإدخال غير تفاعلي
    if (!stdin.isTTY) {
      const rl = readline.createInterface({ input: stdin, output: stdout });
      rl.question('', (answer) => {
        rl.close();
        resolve(answer.trim());
      });
      return;
    }

    // Activation du mode brut (Raw Mode) / تفعيل الوضع الخام لقراءة المفاتيح فرادى
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');

    let password = '';

    const onData = (char) => {
      switch (char) {
        case '\n':
        case '\r':
        case '\u0004': // EOT (Ctrl+D) / نهاية الإدخال
          stdin.setRawMode(false);
          stdin.pause();
          stdin.removeListener('data', onData);
          stdout.write('\n');
          resolve(password);
          break;

        case '\u0003': // Ctrl+C (Interruption) / إلغاء العملية والخروج
          stdin.setRawMode(false);
          stdin.pause();
          stdout.write('\nOpération annulée par l\'utilisateur / تم إلغاء العملية.\n');
          process.exit(130);
          break;

        case '\u0008': // Backspace Windows / مسح حرف للخلف
        case '\x7f':   // Delete Linux/macOS
          if (password.length > 0) {
            password = password.slice(0, -1);
            stdout.write('\b \b');
          }
          break;

        default:
          // Ajout du caractère et masquage visuel par * / إضافة الحرف وعرض نجمة
          password += char;
          stdout.write('*');
          break;
      }
    };

    stdin.on('data', onData);
  });
}
