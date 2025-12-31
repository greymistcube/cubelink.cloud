import { LINKS, Shell } from "./global.js";
import { loadWebgl, removeLinkPopup, showLinkPopup } from "./utils.js";
import { COMMANDS, runCommand } from "./commands.js";

const SCREENPADDING = 80;
const MINROWS = 24;

// Custom theme to match style of xterm.js logo
const THEME = {
  foreground: '#F8F8F8',
  background: '#262626',
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

/** Helper class for creating a Terminal and manipulating Terminal options */
class TermHandler {
  static cols = 80;
  static rows = 24;
  static fontSize = 16;

  /** Update the fontSize and rows for the current screen to satisfy the following:
   *  - Fit at least 80 chars horizontally
   *  - Fit at least 24 chars vertically
   */
  static #updateDimensions() {
    let width = window.innerWidth - SCREENPADDING;
    let height = window.innerHeight - SCREENPADDING;
    let widthBasedSize = (width / 40) * 0.84;
    let heightBasedSize = (height / 24) * 0.84;

    TermHandler.fontSize = (widthBasedSize < heightBasedSize) ? Math.trunc(widthBasedSize) : Math.trunc(heightBasedSize);
    TermHandler.rows = Math.max(MINROWS, Math.trunc(height / TermHandler.fontSize * 0.84));
  }

  static createTerminal() {
    TermHandler.#updateDimensions();
    return new window.Terminal({
      fontSize: TermHandler.fontSize,
      cols: TermHandler.cols,
      rows: TermHandler.rows,
      fontFamily: '"Cascadia Code", Menlo, monospace',
      theme: THEME,
      cursorBlink: true,
      allowProposedApi: true
    });
  }

  static updateTerminal(term) {
    TermHandler.#updateDimensions();
    term.options.fontSize = TermHandler.fontSize;
    term.resize(TermHandler.cols, TermHandler.rows);
  }
}

document.addEventListener('DOMContentLoaded', function() {
  // Make terminal visible only when document is ready
  document.querySelector('.demo').style.display = 'flex';

  let term = TermHandler.createTerminal();
  term.open(document.querySelector('.demo .inner'));

  // Try loading webgl
  loadWebgl(term);

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      TermHandler.updateTerminal(term);
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
    COMMANDS.welcome.run(term, []);

    term.focus();

    term.onData(e => handleInput(term, e));
    term.registerLinkProvider({
      provideLinks(bufferLineNumber, callback) {
        while (LINKS.length > 0 && LINKS[0].marker.isDisposed) {
          LINKS.shift();
        }

        let callbacks = [];
        for (let link of LINKS) {
          // Need to consider discrepancy between indices and coordinates
          // The former starts with 0 and the latter starts with 1
          if (bufferLineNumber === link.marker.line + 1) {
            let text = term.buffer.active.getLine(link.marker.line).translateToString();
            let x = text.indexOf(link.pattern);

            let activate = () => { };
            let hover = (_, __) => { };
            let leave = (_, __) => { };
            switch(link.type) {
              case 'link': // Open the link in new window
                activate = () => { window.open(link.url, '_blank '); };
                hover = (event, _) => showLinkPopup(term, event, link);
                leave = (_, __) => removeLinkPopup();
                break;
              case 'image': // Same as link, but no activate action
                hover = (event, _) => showLinkPopup(term, event, link);
                leave = (_, __) => removeLinkPopup();
                break;
              case 'command': // Simulate entering the command
                activate = () => { simulateTyping(term, link.pattern + '\r'); };
                break;
              case 'alias':
                activate = () => { simulateTyping(term, link.url + '\r'); };
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

async function simulateTyping(term, input) {
  const sleep = 32;
  for (const char of input) {
    await new Promise(resolve => setTimeout(resolve, sleep));
    handleInput(term, char);
  }
}
