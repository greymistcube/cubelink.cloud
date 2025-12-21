async function runMatrix(term, args) {
  // Clear the screen and hide the cursor
  term.writeln('', () => { term.clear(); });
  term.write('\x1b[?25l');

  process = true;
  code = 0;
  let listener = term.onData(e => { process = false; });

  let rows = term.rows;
  let cols = term.cols;
  const drops = rows;
  const tail = 8;
  const sleep = 64;
  let rain = [];

  function createDrop() {
    drop = [];
    while (drop.length < tail) {
      drop.unshift(Math.floor(Math.random() * 16).toString(16));
    }
    return drop;
  }

  function fillRain(fromTop) {
    while (rain.length < drops) {
      rain.push({
        y: fromTop ? 1 : Math.floor(Math.random() * rows + 1),
        x: Math.floor(Math.random() * cols + 1),
        drop: createDrop()
      });
    }
  }

  fillRain(false);
  while (true) {
    for (let elem of rain) {
      for (let i = 0; i < tail; i++) {
        let y = elem.y - i;
        if (1 <= y && y <= rows) {
          term.write(`\x1b[${y};${elem.x}H`);
          if (i === 0) {
            color = '\x1b[37;1m';
          } else if (i < tail / 2) {
            color = '\x1b[32;1m';
          } else {
            color = '\x1b[32;2m';
          }

          if (i === 0) {
            term.write(`${color}${elem.drop[i]}\x1b[0m`);
          } else if (i === tail - 1) {
            term.write('\x1b[0m ');
          } else {
            term.write(`${color}${elem.drop[i]}\x1b[0m`);
          }
        }
      }

      elem.y += 1;
      elem.drop.pop();
      elem.drop.unshift(Math.floor(Math.random() * 16).toString(16));
    }

    rain = rain.filter(elem => elem.y < rows + tail);
    fillRain(true);

    await new Promise(resolve => setTimeout(resolve, sleep));
    if (process === false) {
      // Dispose the listener and turn back on the cursor
      listener.dispose();
      term.write('\x1b[?25h');
      break;
    }
  }

  // Move the cursor to the bottom first before clearing
  term.writeln(`\x1b[${rows};1H`);
  prompt(term);
  term.write('', () => { term.clear() });
}
