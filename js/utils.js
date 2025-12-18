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
function getNumRows(fontSize) {
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
  term.write('\x1b[32;1muser \x1b[33m@ \x1b[32mcubelink \x1b[0m$ ');
  return;
}

function runCommand(term, text) {
  term.writeln('');

  const command = text.trim().split(' ')[0];
  if (command.length > 0) {
    if (command in commands) {
      commands[command].f(term);
    } else {
      term.writeln('');
      term.writeln(`${command}: command not found`);
    }
  }

  return;
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
