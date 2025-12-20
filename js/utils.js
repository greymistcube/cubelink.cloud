const fontSize = getFontSize();
const rows = getNumRows();

// Tracks the prompt globally
let code = 0;
let promptLength = 24;

// Tracks links
let links = [];

// Calculate the appropriate font size to satisfy the following:
// - Fit exactly 80 chars horizontally
// - Fit at least 24 chars vertically
function getFontSize() {
  const paddingSize = 80;
  let width = window.innerWidth - paddingSize;
  let height = window.innerHeight - paddingSize;
  let widthBasedSize = (width / 40) * 0.84;
  let heightBasedSize = (height / 24) * 0.84;
  if (widthBasedSize < heightBasedSize) {
    return Math.trunc(widthBasedSize);
  } else {
    return Math.trunc(heightBasedSize);
  }
}

// Calculate the number of rows for the terminal to fit vertically.
function getNumRows() {
  const paddingSize = 80;
  let height = window.innerHeight - paddingSize;
  let numRows = height / fontSize * 0.84;
  if (numRows < 24) {
    return 24;
  } else {
    return Math.trunc(numRows);
  }
}

function prompt(term) {
  term.writeln('');
  term.write('\x1b[32;1muser \x1b[33m@ \x1b[32mcubelink \x1b[33m: \x1b[34m~ ');
  if (code === 0) {
    term.write('\x1b[32m0 ');
  } else {
    term.write('\x1b[31m1 ');
  }
  term.write('\x1b[0m$ ');
  return;
}

function runCommand(term, text) {
  term.writeln(''); // Changes to the next line from the prompt

  const words = text.split(' ').filter(word => word.length > 0);
  if (words.length > 0) {
    term.writeln(''); // Padding before output
    const command = words[0];
    const args = words.slice(1);

    if (command in commands) {
      commands[command].f(term, args);
      return;
    } else {
      term.writeln('');
      term.writeln(`${command}: command not found`);

      code = 1;
      prompt(term);
      return;
    }
  } else {
    // Empty prompt does not change the exit status
    prompt(term);
    return;
  }
}

let isWebglEnabled = false;
function loadWebgl(term) {
  try {
    const webgl = new window.WebglAddon.WebglAddon();
    term.loadAddon(webgl);
    isWebglEnabled = true;
  } catch (e) {
    console.warn('WebGL addon threw an exception during load', e);
  }

  return;
}

let _linkPopup;
function removeLinkPopup(_, __) {
  if (_linkPopup) {
     _linkPopup.remove();
     _linkPopup = undefined;
  }
}

function showLinkPopup(event, text) {
  removeLinkPopup(event, text);
  const parent = event.target.parentNode;
  const parentRect = parent.getBoundingClientRect();
  const rootRect = document.documentElement.getBoundingClientRect();
  let popup = document.createElement('div');
  popup.classList.add('xterm-link-popup');
  popup.style.position = 'absolute';

  popup.style.top = (event.clientY - parentRect.top + Math.trunc(fontSize * 0.8)) + 'px';
  if (event.clientX < rootRect.width / 2) {
    popup.style.left = (event.clientX - parentRect.left) + 'px';
  } else {
    popup.style.right = (parentRect.right - event.clientX) + 'px';
  }

  popup.style.fontSize = Math.trunc(fontSize * 0.8) + 'px';
  popup.innerText = text;

  parent.appendChild(popup);
  _linkPopup = popup;
};
