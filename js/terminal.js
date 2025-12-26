document.addEventListener('DOMContentLoaded', function() {
  // Make terminal visible only when document is ready
  document.querySelector('.demo').style.display = 'flex';

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

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      fontSize = getFontSize();
      rows = getNumRows();
      term.options.fontSize = fontSize;
      term.resize(cols, rows);
    }, 256);
  });

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
    runWelcome(term, []);

    term.focus();

    term.onData(e => handleInput(term, e));

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

            let activate = () => { };
            let hover = (event, text) => { };
            let leave = (event, text) => { };
            switch(link.type) {
              case 'link': // Open the link in new window
                activate = () => { window.open(link.url, '_blank ')};
                hover = (event, text) => showLinkPopup(event, link);
                leave = (event, text) => removeLinkPopup(event, link);
                break;
              case 'image': // Same as link, but no activate action
                hover = (event, text) => showLinkPopup(event, link);
                leave = (event, text) => removeLinkPopup(event, link);
                break;
              case 'command': // Simulate entering the command
                activate = () => {
                  for (const char of link.pattern + '\r') {
                    handleInput(term, char);
                  }
                };
                break;
              default:
                break;
            }

            callbacks.push({
                text: link.pattern,
                range: {
                  // Assumes there is no wrapping
                  start: { x: x + 1, y: bufferLineNumber },
                  end: { x: x + link.pattern.length, y: bufferLineNumber }
                },
                activate: activate,
                hover: hover,
                leave: leave
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
