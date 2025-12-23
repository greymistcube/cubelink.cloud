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
  }
};

function runHelp(term, args) {
  const padding = 10;
  function formatMessage(name, description) {
    const maxLength = term.cols - padding - 3;
    let remaining = description;
    const d = [];
    while (remaining.length > 0) {
      // Trim any spaces left over from the previous line
      remaining = remaining.trimStart();
      // Check if the remaining text fits
      if (remaining.length < maxLength) {
        d.push(remaining);
        remaining = '';
      } else {
        let splitIndex = -1;
        // Check if the remaining line wraps already
        if (remaining[maxLength] === ' ') {
          splitIndex = maxLength;
        } else {
          // Find the last space to use as the split index
          for (let i = maxLength - 1; i >= 0; i--) {
            if (remaining[i] === ' ') {
              splitIndex = i;
              break;
            }
          }
        }
        d.push(remaining.substring(0, splitIndex));
        remaining = remaining.substring(splitIndex);
      }
    }
    const message = (
      `  \x1b[32;1m${name.padEnd(padding)}\x1b[0m ${d[0]}` +
      d.slice(1).map(e => `\r\n  ${' '.repeat(padding)} ${e}`)
    );
    return message;
  }

  const preText = {
    'content': [
      ['Here is a list of commands you can use in this terminal:'],
      ['']
    ]
  }

  printContent(term, preText.content);
  term.writeln(Object.keys(commands).toSorted().map(e => formatMessage(e, commands[e].description)).join('\r\n'));

  code = 0;
  prompt(term);
  return;
}

function runLs(term, args) {
  term.writeln(Object.keys(files).toSorted().join('  '));

  code = 0;
  prompt(term);
  return;
}

function printContent(term, content) {
  for (const line of content) {
    let text = line[0];

    // Inject formatting to links
    if (line.length > 1) {
      for (const link of line.slice(1)) {
        text = text.replace(link.pattern, `\x1b[36m${link.pattern}\x1b[0m`);
      }
    }

    term.write(text);

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

  return;
}

function runCat(term, args) {
  if (args.length === 1) {
    const filename = args[0];
    if (filename in files) {
      const file = files[filename];
      printContent(term, file.content);
      code = 0;
      prompt(term);
    } else {
      if (filename === '-h' || filename ==='--help') {
        term.writeln(commands['cat'].description)
        term.writeln('');
        term.writeln('Usage:');
        term.writeln('  \x1b[32;1mcat\x1b[0m <\x1b[33;1mfile\x1b[0m>');
        term.writeln('');
        term.writeln('Example:');
        term.writeln('  \x1b[32;1mcat\x1b[0m \x1b[33;1mwelcome\x1b[0m');
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
    term.writeln('Try \'\x1b[32;1mcat --help\x1b[0m\' for more information');

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
