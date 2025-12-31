// Tracks links
export const LINKS = [];

// Tracks shell state
export class Shell {
  static command = '';
  static code = 0;
  static process = false;
  static promptLength = 24;

  static prompt(term) {
    term.writeln('');
    term.write('\x1b[32;1muser \x1b[33m@ \x1b[32mcubelink \x1b[33m: \x1b[34m~ ');
    if (Shell.code === 0) {
      term.write('\x1b[32m0 ');
    } else {
      term.write('\x1b[31m1 ');
    }
    term.write('\x1b[0m$ ');
    return;
  }
}
