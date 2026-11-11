/**
 * ============================================================================
 * MODULE D'INTERACTION CONSOLE & SAISIE SÉCURISÉE (CLI PROMPT MODULE)
 * Auteurs : Salhi Issam & Chouikha Imane (L3 ISIL - Module PAWEB)
 * ============================================================================
 */

import readline from 'node:readline';

/**
 * Pose une question textuelle standard à l'utilisateur dans le terminal.
 * @param {string} query - Question ou libellé du champ.
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
 * Invite l'utilisateur à saisir un mot de passe de manière sécurisée en masquant les caractères.
 * 
 * ملاحظة بالعربية (Note en Arabe) :
 * قراءة كلمة المرور في الطرفية (Terminal) مع إخفاء الأحرف أو استبدالها بنجوم (*)
 * لحماية كلمة المرور من المتلصصين (Shoulder Surfing) وعدم إظهارها في سجل الأوامر.
 * 
 * @param {string} promptMessage - Message d'invite.
 * @returns {Promise<string>} Mot de passe saisi.
 */
export function askPassword(promptMessage = 'Entrez le mot de passe maître : ') {
  return new Promise((resolve) => {
    const stdin = process.stdin;
    const stdout = process.stdout;

    stdout.write(promptMessage);

    // Si stdin n'est pas un TTY (ex: script ou pipe), on lit la ligne normalement
    if (!stdin.isTTY) {
      const rl = readline.createInterface({ input: stdin, output: stdout });
      rl.question('', (answer) => {
        rl.close();
        resolve(answer.trim());
      });
      return;
    }

    // Mode raw pour capturer chaque caractère individuellement
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');

    let password = '';

    const onData = (char) => {
      switch (char) {
        case '\n':
        case '\r':
        case '\u0004': // EOT (Ctrl+D)
          stdin.setRawMode(false);
          stdin.pause();
          stdin.removeListener('data', onData);
          stdout.write('\n');
          resolve(password);
          break;

        case '\u0003': // Ctrl+C (Interruption utilisateur)
          stdin.setRawMode(false);
          stdin.pause();
          stdout.write('\nOpération annulée par l\'utilisateur.\n');
          process.exit(130);
          break;

        case '\u0008': // Backspace (Windows / Linux)
        case '\x7f':   // Delete
          if (password.length > 0) {
            password = password.slice(0, -1);
            stdout.write('\b \b');
          }
          break;

        default:
          // Ajout du caractère et affichage d'un astérisque de masquage
          password += char;
          stdout.write('*');
          break;
      }
    };

    stdin.on('data', onData);
  });
}

