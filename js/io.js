const screenPadding = 80;
const minRows = 24;

class Screen {
  static cols = 80;
  static rows = 24;
  static fontSize = 16;

  /** Update the fontSize and rows for the current screen to satisfy the following:
   *  - Fit at least 80 chars horizontally
   *  - Fit at least 24 chars vertically
   */
  static update() {
    let width = window.innerWidth - screenPadding;
    let height = window.innerHeight - screenPadding;
    let widthBasedSize = (width / 40) * 0.84;
    let heightBasedSize = (height / 24) * 0.84;

    Screen.fontSize = (widthBasedSize < heightBasedSize) ? Math.trunc(widthBasedSize) : Math.trunc(heightBasedSize);
    Screen.rows = Math.max(minRows, Math.trunc(height / Screen.fontSize * 0.84));
  }
}

class Shell {
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

/** Format and print the given line */
function printLine(term, line) {
  let text = line[0];
  const hLine = `\x1b[37;1m${'─'.repeat(term.cols)}\x1b[0m`;

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
        case 'alias':
          text = text.replace(link.pattern, `\x1b[33;1m${link.pattern}\x1b[0m`);
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

  // Register interactive elements after the text is printed
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

/** Print the given list of lines */
function printContent(term, content) {
  for (const line of content) {
    printLine(term, line);
  }

  return;
}

/** Handle the given keyboard input event */
function handleInput(term, event) {
  switch (event) {
    case '\u0003': // Ctrl+C
      Shell.code = 1; // Proper exit code should be 130, but not important
      if (!Shell.process) {
        term.writeln('^C');
        Shell.command = '';
        Shell.prompt(term);
      }
      break;
    case '\r': // Enter
      if (!Shell.process) {
        runCommand(term, Shell.command);
        Shell.command = '';
      }
      break;
    case '\u007F': // Backspace (DEL)
      if (!Shell.process) {
        // Do not delete the prompt
        if (term._core.buffer.x > Shell.promptLength) {
          term.write('\b \b');
          if (Shell.command.length > 0) {
            Shell.command = Shell.command.slice(0, Shell.command.length - 1);
          }
        }
      }
      break;
    default: // Print all other characters for demo
      if (!Shell.process) {
        if (event >= String.fromCharCode(0x20) && event <= String.fromCharCode(0x7E) || event >= '\u00a0') {
          Shell.command += event;
          term.write(event);
        }
      }
      break;
  }

  return;
}
