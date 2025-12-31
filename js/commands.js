import { Shell } from "./global.js";
import { FILES } from "./files.js";
import { printLine, printLines } from "./printer.js";
import { runMatrix } from "./matrix.js";
import { runFluid } from "./fluid.js";

export const COMMANDS = {
  help: {
    run: (term, args) => runHelp(term, args),
    description: 'Print this help message',
  },
  ls: {
    run: (term, args) => runLs(term, args),
    description: 'List the contents of the current directory'
  },
  cat: {
    run: (term, args) => runCat(term, args),
    description: 'Print the contents of a file in a terminal'
  },
  clear: {
    run: (term, args) => runClear(term, args),
    description: 'Clear the terminal screen'
  },
  matrix: {
    run: (term, args) => runMatrix(term, args),
    description: 'Run The Matrix simulation'
  },
  fluid: {
    run: (term, args) => runFluid(term, args),
    description: 'Run the fluid simulation'
  },
  welcome: {
    run: (term, args) => runWelcome(term, args),
    description: 'Print the welcome message'
  }
};

function runWelcome(term, _) {
  printLines(term, FILES['welcome'].content);

  Shell.code = 0;
  Shell.prompt(term);
}

export function runCommand(term, text) {
  term.writeln(''); // Changes to the next line from the prompt

  const words = text.split(' ').filter(word => word.length > 0);
  if (words.length > 0) {
    term.writeln(''); // Padding before output
    const command = words[0];
    const args = words.slice(1);

    if (command in COMMANDS) {
      COMMANDS[command].run(term, args);
      return;
    } else {
      term.writeln(`${command}: command not found`);
      printLine(
        term,
        ['Try \'help\' to see a list of commands', { type: 'command', pattern: 'help', url: '' }]);

      Shell.code = 1;
      Shell.prompt(term);
      return;
    }
  } else {
    // Empty prompt does not change the exit status
    Shell.prompt(term);
    return;
  }
}

function runHelp(term, _) {
  const padding = 10;
  const lines = [];
  for (const command of Object.keys(COMMANDS).toSorted()) {
    const text = '  ' + command + ' '.repeat(padding - command.length) + COMMANDS[command].description;
    lines.push([text, { type: 'command', pattern: command, url: '' }]);
  }

  const preText = {
    'content': [
      ['Here is a list of commands you can use in this terminal:'],
      ['']
    ]
  };

  const postText = {
    'content': [
      [''],
      ['You can interact with most \x1b[36;1mcyan text\x1b[0m like this link and this image to open a', { type: 'link', pattern: 'link', url: 'https://github.com/greymistcube' }, { type: 'image', pattern: 'image', url: '/images/logo.png' }],
      ['link or view an image. You can also click on some \x1b[32;1mgreen text\x1b[0m like this \'help\'', { type: 'command', pattern: 'help', url: ''}],
      ['to run a command.']
  ]};

  printLines(term, preText.content);
  printLines(term, lines);
  printLines(term, postText.content);

  Shell.code = 0;
  Shell.prompt(term);
  return;
}

function runLs(term, _) {
  const keys = Object.keys(FILES).toSorted();
  const filenames = [];
  const line = [];
  for (const key of keys) {
    switch (FILES[key].permission) {
      case 'r':
        filenames.push(key);
        line.push({ type: 'alias', pattern: key, url: `cat ${key}`});
        break;
      case 'x':
        filenames.push(key);
        line.push({ type: 'command', pattern: key, url: '' });
        break;
      default:
        break;
    }
  }

  line.unshift(filenames.join('  '));
  printLine(term, line);

  Shell.code = 0;
  Shell.prompt(term);
  return;
}

function runCat(term, args) {
  if (args.length === 1) {
    const filename = args[0];
    if (filename in FILES) {
      const file = FILES[filename];
      if (file.permission === 'r') {
        printLines(term, file.content);
        Shell.code = 0;
        Shell.prompt(term);
      } else {
        term.writeln('cat: permission denied');
        Shell.code = 1;
        Shell.prompt(term);
      }
    } else {
      if (filename === '-h' || filename ==='--help') {
        term.writeln(COMMANDS['cat'].description);
        term.writeln('');
        term.writeln('Usage:');
        term.writeln('  \x1b[32;1mcat\x1b[0m <\x1b[33;1mfile\x1b[0m>');
        term.writeln('');
        term.writeln('Example:');
        term.writeln('  cat about.md');
        Shell.code = 0;
        Shell.prompt(term);
      } else {
        term.writeln('cat: no such file');
        Shell.code = 1;
        Shell.prompt(term);
      }
    }
  } else {
    term.writeln('cat: bad usage');
    printLine(
      term,
      ['Try \'cat --help\' for more information', { type: 'command', pattern: 'cat --help', url: '' }]);

    Shell.code = 1;
    Shell.prompt(term);
  }

  return;
}

function runClear(term, _) {
  Shell.code = 0;
  Shell.prompt(term);
  term.write('', () => { term.clear(); });
  return;
}
