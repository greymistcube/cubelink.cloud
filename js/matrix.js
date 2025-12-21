async function runMatrix(term, args) {
  // Clear the screen and hide the cursor
  term.writeln('', () => { term.clear(); });
  term.write('\x1b[?25l');

  const drops = 16;
  const tail = 8;
  const sleep = 32;
  let cols = term.cols;
  let rows = term.rows;
  let rain = [];

  function fillRain(fromTop) {
    while (rain.length < drops) {
      rain.push({
        y: fromTop ? 1 : Math.floor(Math.random() * rows + 1),
        x: Math.floor(Math.random() * cols + 1),
      });
    }
  }

  fillRain(false);
  while (true) {
    for (let elem of rain) {
      term.write(`\x1b[${elem.y};${elem.x}H${Math.floor(Math.random() * 16).toString(16)}`);
      if (elem.y - tail >= 1) {
        term.write(`\x1b[${elem.y - tail};${elem.x}H `);
      }
      elem.y += 1;
    }

    rain = rain.filter(elem => elem.y <= rows + tail);
    fillRain(true);

    await new Promise(resolve => setTimeout(resolve, sleep));
  }
}
