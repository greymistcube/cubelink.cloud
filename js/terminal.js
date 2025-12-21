$(function () {
  // Custom theme to match style of xterm.js logo
  var baseTheme = {
    foreground: '#F8F8F8',
    background: '#2D2E2C',
    selection: '#5DA5D533',
    black: '#1E1E1D',
    brightBlack: '#262625',
    red: '#CE5C5C',
    brightRed: '#FF7272',
    green: '#5BCC5B',
    brightGreen: '#72FF72',
    yellow: '#CCCC5B',
    brightYellow: '#FFFF72',
    blue: '#5D5DD3',
    brightBlue: '#7279FF',
    magenta: '#BC5ED1',
    brightMagenta: '#E572FF',
    cyan: '#5DA5D5',
    brightCyan: '#72F0FF',
    white: '#F8F8F8',
    brightWhite: '#FFFFFF'
  };

  var term = new window.Terminal({
    fontSize: fontSize,
    rows: rows,
    fontFamily: '"Cascadia Code", Menlo, monospace',
    theme: baseTheme,
    cursorBlink: true,
    allowProposedApi: true
  });
  term.open(document.querySelector('.demo .inner'));

  // Try loading webgl
  loadWebgl(term);

  // Cancel wheel events from scrolling the page if the terminal has scrollback
  document.querySelector('.xterm').addEventListener('wheel', e => {
    if (term.buffer.active.baseY > 0) {
      e.preventDefault();
    }
  });

  function runFakeTerminal() {
    if (term._initialized) {
      return;
    }

    term._initialized = true;

    // Print welcome text
    printFile(term, files['welcome']);

    term.writeln('');
    term.writeln('Below is a simple emulated backend, try running `help`.');

    // Initial prompt
    var command = '';
    code = 0;
    prompt(term);
    term.focus();

    term.onData(e => {
      switch (e) {
        case '\u0003': // Ctrl+C
          code = 1; // Proper exit code should be 130, but not important
          if (!process) {
            term.writeln('^C');
            command = '';
            prompt(term);
          }
          break;
        case '\r': // Enter
          if (!process) {
            runCommand(term, command);
            command = '';
          }
          break;
        case '\u007F': // Backspace (DEL)
          if (!process) {
            // Do not delete the prompt
            if (term._core.buffer.x > 24) {
              term.write('\b \b');
              if (command.length > 0) {
                command = command.slice(0, command.length - 1);
              }
            }
          }
          break;
        default: // Print all other characters for demo
          if (!process) {
            if (e >= String.fromCharCode(0x20) && e <= String.fromCharCode(0x7E) || e >= '\u00a0') {
              command += e;
              term.write(e);
            }
          }
          break;
      }
    });

    term.registerLinkProvider({
      provideLinks(bufferLineNumber, callback) {
        while (links.length > 0 && links[0].marker.isDisposed) {
          links.shift();
        }

        let callbacks = [];
        for (let link of links) {
          // Need to consider discrepancy between indices and coordinates
          // The former starts with 0 and the latter starts with 1
          if (bufferLineNumber === link.marker.line + 1) {
            let text = term.buffer.active.getLine(link.marker.line).translateToString();
            let x = text.indexOf(link.pattern);
            callbacks.push({
                text: link.pattern,
                range: {
                  // Assumes there is no wrapping
                  start: { x: x + 1, y: bufferLineNumber },
                  end: { x: x + link.pattern.length, y: bufferLineNumber }
                },
                activate: () => {
                  window.open(link.url, '_blank');
                },
                hover: (event, text) => showLinkPopup(event, link),
                leave: removeLinkPopup
              });
          }
        }

        callback(callbacks);
        return;
      }
    });
  }

  runFakeTerminal();
});
