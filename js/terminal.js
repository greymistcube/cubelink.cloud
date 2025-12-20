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
  // vscode-snazzy https://github.com/Tyriar/vscode-snazzy
  var otherTheme = {
    foreground: '#eff0eb',
    background: '#282a36',
    selection: '#97979b33',
    black: '#282a36',
    brightBlack: '#686868',
    red: '#ff5c57',
    brightRed: '#ff5c57',
    green: '#5af78e',
    brightGreen: '#5af78e',
    yellow: '#f3f99d',
    brightYellow: '#f3f99d',
    blue: '#57c7ff',
    brightBlue: '#57c7ff',
    magenta: '#ff6ac1',
    brightMagenta: '#ff6ac1',
    cyan: '#9aedfe',
    brightCyan: '#9aedfe',
    white: '#f1f1f0',
    brightWhite: '#eff0eb'
  };
  var isBaseTheme = true;

  var fontSize = getFontSize();
  var rows = getNumRows(fontSize);
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

    term.onData(e => {
      switch (e) {
        case '\u0003': // Ctrl+C
          term.writeln('^C');
          command = '';
          code = 1; // Proper exit code should be 130, but not important
          prompt(term);
          break;
        case '\r': // Enter
          runCommand(term, command);
          command = '';
          break;
        case '\u007F': // Backspace (DEL)
          // Do not delete the prompt
          if (term._core.buffer.x > 24) {
            term.write('\b \b');
            if (command.length > 0) {
              command = command.slice(0, command.length - 1);
            }
          }
          break;
        default: // Print all other characters for demo
          if (e >= String.fromCharCode(0x20) && e <= String.fromCharCode(0x7E) || e >= '\u00a0') {
            command += e;
            term.write(e);
          }
      }
    });

    // Create a very simple link provider which hardcodes links for certain lines
    term.registerLinkProvider({
      provideLinks(bufferLineNumber, callback) {
        while (links.length > 0 && links[0]['marker'].isDisposed) {
          links.shift();
        }

        let callbacks = [];
        for (link of links) {
          // Need to consider discrepancy between indices and coordinates
          // The former starts with 0 and the latter starts with 1
          if (bufferLineNumber === link['marker'].line + 1) {
            let text = term.buffer.active.getLine(link['marker'].line).translateToString();
            let x = text.indexOf(link['text']);
            callbacks.push({
                text: link['text'],
                range: {
                  // Assumes there is no wrapping
                  start: { x: x + 1, y: bufferLineNumber },
                  end: { x: x + link['text'].length, y: bufferLineNumber }
                },
                activate() {
                  window.open(link['url'], '_blank');
                }
              });
          }
        }

        callback(callbacks);
        return;
      }
    })

    term.registerLinkProvider({
      provideLinks(bufferLineNumber, callback) {
        switch (bufferLineNumber) {
          case 14:
            callback([
              {
                text: 'Links',
                range: { start: { x: 45, y: 14 }, end: { x: 49, y: 14 } },
                activate() {
                  window.alert('You can handle links any way you want');
                }
              },
              {
                text: 'themes',
                range: { start: { x: 52, y: 14 }, end: { x: 57, y: 14 } },
                activate() {
                  isBaseTheme = !isBaseTheme;
                  term.options.theme = isBaseTheme ? baseTheme : otherTheme;
                  document.querySelector('.demo .inner').classList.toggle('other-theme', !isBaseTheme);
                  term.write(`\r\nActivated ${isBaseTheme ? 'xterm.js' : 'snazzy'} theme`);
                  code = 0;
                  prompt(term);
                }
              },
              {
                text: 'addons',
                range: { start: { x: 60, y: 14 }, end: { x: 65, y: 14 } },
                activate() {
                  window.open('/docs/guides/using-addons/', '_blank');
                }
              }
            ]);
            return;
          case 15: callback([
            {
              text: 'typed API',
              range: { start: { x: 45, y: 15 }, end: { x: 53, y: 15 } },
              activate() {
                window.open('https://github.com/xtermjs/xterm.js/blob/master/typings/xterm.d.ts', '_blank');
              }
            },
            {
              text: 'decorations',
              range: { start: { x: 56, y: 15 }, end: { x: 66, y: 15 } },
              activate() {
                window.open('https://github.com/xtermjs/xterm.js/blob/a351f5758a5126308b90d60b604b528462f6f051/typings/xterm.d.ts#L372', '_blank');
              }
            },
          ]);
            return;
        }
        callback(undefined);
      }
    });
  }

  runFakeTerminal();
});
