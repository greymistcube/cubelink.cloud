const commands = {
  help: {
    f: (term, args) => runHelp(term, args),
    description: 'Prints this help message',
  },
  ls: {
    f: (term, args) => runLs(term, args),
    description: 'Prints a fake directory structure'
  },
  loadtest: {
    f: (term, args) => runLoadTest(term, args),
    description: 'Simulate a lot of data coming from a process'
  },
  chars: {
    f: (term, args) => runChars(term, args),
    description: 'Prints a wide range of characters and styles that xterm.js can handle'
  },
  cat: {
    f: (term, args) => runCat(term, args),
    description: 'Prints the contents of a file in a terminal'
  },
  clear: {
    f: (term, args) => runClear(term, args),
    description: 'Clears the terminal screen'
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
      `  \x1b[36;1m${name.padEnd(padding)}\x1b[0m ${d[0]}` +
      d.slice(1).map(e => `\r\n  ${' '.repeat(padding)} ${e}`)
    );
    return message;
  }
  term.writeln('');
  term.writeln([
    'Welcome to xterm.js! Try some of the commands below.',
    '',
    ...Object.keys(commands).map(e => formatMessage(e, commands[e].description))
  ].join('\r\n'));

  code = 0;
  prompt(term);
  return;
}

function runLs(term, args) {
  term.writeln('');
  term.writeln(Object.keys(files).join('\r\n'));

  code = 0;
  prompt(term);
  return;
}

function runLoadTest(term, args) {
  let testData = [];
  let byteCount = 0;
  for (let i = 0; i < 256; i++) {
    let count = 1 + Math.ceil(Math.random() * 79);
    byteCount += count;
    let data = new Uint8Array(count);
    for (let j = 0; j < count; j++) {
      data[j] = 0x61 + Math.floor(Math.random() * (0x7A - 0x61));
    }
    testData.push(data);
  }
  let start = performance.now();

  term.writeln('');
  for (let i = 0; i < 256; i++) {
    for (const d of testData) {
      term.writeln(d);
    }
  }

  // Wait for all data to be parsed before evaluating time
  let time = Math.round(performance.now() - start);
  let mbs = ((byteCount / 1024) * (1 / (time / 1000))).toFixed(2);
  term.writeln('');
  term.writeln(`Wrote ${byteCount}kB in ${time}ms (${mbs}MB/s) using the ${isWebglEnabled ? 'webgl' : 'canvas'} renderer`);

  code = 0;
  prompt(term);
  return;
}

function runChars(term, args) {
  const _1to8 = [];
  for (let i = 1; i <= 8; i++) {
    _1to8.push(i);
  }
  const _1to16 = [];
  for (let i = 1; i <= 16; i++) {
    _1to16.push(i);
  }
  const _1to24 = [];
  for (let i = 1; i <= 24; i++) {
    _1to24.push(i);
  }
  const _1to32 = [];
  for (let i = 1; i <= 32; i++) {
    _1to32.push(i);
  }
  const _0to35 = [];
  for (let i = 0; i <= 35; i++) {
    _0to35.push(i);
  }
  const _1to64 = [];
  for (let i = 1; i <= 64; i++) {
    _1to64.push(i);
  }
  const _0to255 = [];
  for (let i = 17; i <= 255; i++) {
    _0to255.push(i);
  }
  const lines = [
    ['Ascii ─', 'abc123'],
    ['CJK ─', '汉语, 漢語, 日本語, 한국어'],
    ['Powerline ─', '\ue0b2\ue0b0\ue0b3\ue0b1\ue0b6\ue0b4\ue0b7\ue0b5\ue0ba\ue0b8\ue0bd\ue0b9\ue0be\ue0bc'],
    ['Box drawing ┬', '┌─┬─┐ ┏━┳━┓ ╔═╦═╗ ┌─┲━┓ ╲   ╱'],
    ['            │', '│ │ │ ┃ ┃ ┃ ║ ║ ║ │ ┃ ┃  ╲ ╱'],
    ['            │', '├─┼─┤ ┣━╋━┫ ╠═╬═╣ ├─╄━┩   ╳'],
    ['            │', '│ │ │ ┃ ┃ ┃ ║ ║ ║ │ │ │  ╱ ╲'],
    ['            └', '└─┴─┘ ┗━┻━┛ ╚═╩═╝ └─┴─┘ ╱   ╲'],
    ['Block elem ─', '░▒▓█ ▁▂▃▄▅▆▇█ ▏▎▍▌▋▊▉'],
    ['Emoji ─', '😉 👋'],
    ['16 color ─', [..._1to8.map(e => `\x1b[3${e - 1}m●`), ..._1to8.map(e => `\x1b[1;3${e - 1}m●`)].join('')],
    ['256 color ┬', [..._0to35.map(e => `\x1b[38;5;${16 + 36 * 0 + e}m●`)].join('')],
    ['          │', [..._0to35.map(e => `\x1b[38;5;${16 + 36 * 1 + e}m●`)].join('')],
    ['          │', [..._0to35.map(e => `\x1b[38;5;${16 + 36 * 2 + e}m●`)].join('')],
    ['          │', [..._0to35.map(e => `\x1b[38;5;${16 + 36 * 3 + e}m●`)].join('')],
    ['          │', [..._0to35.map(e => `\x1b[38;5;${16 + 36 * 4 + e}m●`)].join('')],
    ['          │', [..._0to35.map(e => `\x1b[38;5;${16 + 36 * 5 + e}m●`)].join('')],
    ['          └', [..._1to24.map(e => `\x1b[38;5;${232 + e - 1}m●`)].join('')],
    ['True color ┬', [..._1to64.map(e => `\x1b[38;2;${64 * 0 + e - 1};0;0m●`)].join('')],
    ['           │', [..._1to64.map(e => `\x1b[38;2;${64 * 1 + e - 1};0;0m●`)].join('')],
    ['           │', [..._1to64.map(e => `\x1b[38;2;${64 * 2 + e - 1};0;0m●`)].join('')],
    ['           └', [..._1to64.map(e => `\x1b[38;2;${64 * 3 + e - 1};0;0m●`)].join('')],
    ['Styles ─', ['\x1b[1mBold', '\x1b[2mFaint', '\x1b[3mItalics', '\x1b[7mInverse', '\x1b[9mStrikethrough', '\x1b[8mInvisible'].join('\x1b[0m, ')],
    ['Underlines ─', ['\x1b[4:1mStraight', '\x1b[4:2mDouble', '\x1b[4:3mCurly', '\x1b[4:4mDotted', '\x1b[4:5mDashed'].join('\x1b[0m, ')],
  ];
  const maxLength = lines.reduce((p, c) => Math.max(p, c[0].length), 0);
  term.writeln('');
  term.writeln(lines.map(e => `${e[0].padStart(maxLength)}  ${e[1]}\x1b[0m`).join('\r\n'));

  code = 0;
  prompt(term);
  return;
}

function runCat(term, args) {
  if (args.length > 0) {
    const filename = args[0];
    if (filename in files) {
      const file = files[filename];

      term.writeln('')
      for (const line of file) {
        term.writeln(line);
      }

      code = 0;
      prompt(term);
    } else {
      term.writeln('');
      term.writeln('cat: invalid argument');

      code = 1;
      prompt(term);
    }
  } else {
    term.writeln('');
    term.writeln('cat: invalid argument');

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
