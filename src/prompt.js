/**
 * ============================================================================
 * MODULE D'INTERACTION TERMINAL
 * ============================================================================
 * Auteurs : Salhi Issam & Chouik Imane (L3 ISIL - Module PAWEB)
 * Fonctionnalite cle : Saisie masquee du mot de passe (Raw Mode)
 * ============================================================================
 */

import readline from 'node:readline';

/**
 * Pose une question textuelle standard dans la console.
 * 
 * @param {string} query - Question
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
 * Invite l'utilisateur a saisir son mot de passe maitre de facon securisee en masquant les frappes.
 * Active le Raw Mode sur process.stdin pour intercepter chaque caractere sans echo direct,
 * remplacant les caracteres saisis par des asterisques (*) pour parer au Shoulder Surfing.
 * 
 * @param {string} promptMessage - Message d'invite
 * @returns {Promise<string>} Mot de passe saisi
 */
export function askPassword(promptMessage = 'Entrez le mot de passe maitre : ') {
  return new Promise((resolve) => {
    const stdin = process.stdin;
    const stdout = process.stdout;

    stdout.write(promptMessage);

    // Si le terminal n'est pas un TTY (ex: script ou pipe automatise)
    if (!stdin.isTTY) {
      const rl = readline.createInterface({ input: stdin, output: stdout });
      rl.question('', (answer) => {
        rl.close();
        resolve(answer.trim());
      });
      return;
    }

    // Activation du mode brut (Raw Mode)
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

        case '\u0003': // Ctrl+C (Interruption)
          stdin.setRawMode(false);
          stdin.pause();
          stdout.write('\n[INFO] Operation annulee par l\'utilisateur.\n');
          process.exit(130);
          break;

        case '\u0008': // Backspace Windows
        case '\x7f':   // Delete Linux/macOS
          if (password.length > 0) {
            password = password.slice(0, -1);
            stdout.write('\b \b');
          }
          break;

        default:
          // Ajout du caractere et masquage visuel par *
          password += char;
          stdout.write('*');
          break;
      }
    };

    stdin.on('data', onData);
  });
}
