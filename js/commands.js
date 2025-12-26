const commands = {
  help: {
    f: (term, args) => runHelp(term, args),
    description: 'Print this help message',
  },
  ls: {
    f: (term, args) => runLs(term, args),
    description: 'List the contents of the current directory'
  },
  cat: {
    f: (term, args) => runCat(term, args),
    description: 'Print the contents of a file in a terminal'
  },
  clear: {
    f: (term, args) => runClear(term, args),
    description: 'Clear the terminal screen'
  },
  matrix: {
    f: (term, args) => runMatrix(term, args),
    description: 'Run The Matrix simulation'
  },
  welcome: {
    f: (term, args) => runWelcome(term, args),
    description: 'Print the welcome message'
  }
};

function runWelcome(term, args) {
  printContent(term, files['welcome'].content);

  code = 0;
  prompt(term);
}

function runHelp(term, args) {
  const padding = 10;
  const lines = []
  for (const command of Object.keys(commands).toSorted()) {
    const text = '  ' + command + ' '.repeat(padding - command.length) + commands[command].description;
    lines.push([text, { type: 'command', pattern: command, url: '' }]);
  }

  const preText = {
    'content': [
      ['Here is a list of commands you can use in this terminal:'],
      ['']
    ]
  }

  const postText = {
    'content': [
      [''],
      ['You can interact with most \x1b[36;1mcyan text\x1b[0m like this link and this image to open a', { type: 'link', pattern: 'link', url: 'https://github.com/greymistcube' }, { type: 'image', pattern: 'image', url: '/images/logo.png' }],
      ['link or view an image. You can also click on some \x1b[32;1mgreen text\x1b[0m like this \'help\'', { type: 'command', pattern: 'help', url: ''}],
      ['to run a command.']
  ]}

  printContent(term, preText.content);
  printContent(term, lines);
  printContent(term, postText.content);

  code = 0;
  prompt(term);
  return;
}

function runLs(term, args) {
  const keys = Object.keys(files).toSorted();
  const filenames = [];
  const line = [];
  for (const key of keys) {
    switch (files[key].permission) {
      case 'r':
        filenames.push(`\x1b[33;1m${key}\x1b[0m`);
        break;
      case 'x':
        filenames.push(key);
        line.push({ type: 'command', pattern: key, url: '' })
        break;
      default:
        break;
    }
  }

  line.unshift(filenames.join('  '));
  printLine(term, line);

  code = 0;
  prompt(term);
  return;
}

function printLine(term, line) {
  let text = line[0];
  const hLine = `\x1b[37;1m${'─'.repeat(80)}\x1b[0m`;

  // Inject formatting to links / commands
  if (line.length > 1) {
    for (const link of line.slice(1)) {
      switch (link.type) {
        case 'link':
        case 'image':
          text = text.replace(link.pattern, `\x1b[36m${link.pattern}\x1b[0m`);
          break;
        case 'command':
          text = text.replace(link.pattern, `\x1b[32;1m${link.pattern}\x1b[0m`);
          break;
        default:
          break;
      }
    }
  } else {
  // Crude pseudo markdown formatting
    if (text.length > 1) {
      switch (text[0]) {
        case '#':
          text = (text.startsWith('## ') ? `${hLine}\r\n\r\n` : '') + `\x1b[34;1m${text}\x1b[0m`;
          break;
        case '>':
          text = `\x1b[37;1m│\x1b[0m\x1b[37;2m${text.slice(1)}\x1b[0m`;
          break;
        default:
          break;
      }
    }
  }

  term.write(text);

  // Register interaction after the text is printed
  if (line.length > 1) {
    for (const link of line.slice(1)) {
      term.write('', () => {
        links.push({
          marker: term.registerMarker(),
          type: link.type,
          pattern: link.pattern,
          url: link.url,
        });
      });
    }
  }

  term.writeln('');
}

function printContent(term, content) {
  for (const line of content) {
    printLine(term, line);
  }

  return;
}

function runCat(term, args) {
  if (args.length === 1) {
    const filename = args[0];
    if (filename in files) {
      const file = files[filename];
      if (file.permission === 'r') {
        printContent(term, file.content);
        code = 0;
        prompt(term);
      } else {
        term.writeln('cat: permission denied');
        code = 1;
        prompt(term);
      }
    } else {
      if (filename === '-h' || filename ==='--help') {
        term.writeln(commands['cat'].description)
        term.writeln('');
        term.writeln('Usage:');
        term.writeln('  \x1b[32;1mcat\x1b[0m <\x1b[33;1mfile\x1b[0m>');
        term.writeln('');
        term.writeln('Example:');
        term.writeln('  cat about.md');
        code = 0;
        prompt(term);
      } else {
        term.writeln('cat: no such file');
        code = 1;
        prompt(term);
      }
    }
  } else {
    term.writeln('cat: bad usage');
    printLine(
      term,
      ['Try \'cat --help\' for more information', { type: 'command', pattern: 'cat --help', url: '' }]);

    code = 1;
    prompt(term);
  }

  return;
}

function runClear(term, args) {
  code = 0;
  prompt(term);
  term.write('', () => { term.clear() });
  return;
}
