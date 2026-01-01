import { LINKS, Shell } from "./global.js";

class Rain {
  /** Density of the rain */
  static density = 2;

  /** Base length of a drop */
  static tail = 8;

  /** Probability of a character glitching */
  static glitch = 0.1;

  constructor(cols, rows) {
    this.cols = cols;
    this.rows = rows;
    this.count = rows * Rain.density;
    this.drops = [];
    this.fill(false);
  }

  /** Fill up the rain environment with drops */
  fill(fromTop) {
    while (this.drops.length < this.count) {
      this.drops.push(new Drop(
        Math.floor(Math.random() * this.cols + 1),
        fromTop ? 1 : Math.floor(Math.random() * this.rows + 1)
      ));
    }
  }

  /** Render the scene */
  render(term) {
    this.rows = term.rows;
    this.drops.forEach(drop => drop.render(term));
  }

  /** Make all drops fall by 1 then cycle all drops that are off screen. */
  fall() {
    this.drops.forEach(drop => drop.fall());
    this.drops = this.drops.filter(drop => drop.y < this.rows + drop.chars.length);
    this.fill(true);
  }
}

class Drop {
  /** Create a drop of random length made of random hex characters */
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.chars = [];
    const length = Rain.tail + Math.trunc(Math.random() * Rain.tail);
    while (this.chars.length < length) {
      this.chars.unshift(Drop.randChar());
    }
  }

  /** Draw this drop on the terminal */
  render(term) {
    let rows = term.rows;
    for (let i = 0; i < this.chars.length; i++) {
      if (Math.random() < Rain.glitch) {
        this.chars[i] = Drop.randChar();
      }

      let y = this.y - i;
      if (1 <= y && y <= rows) {
        term.write(`\x1b[${y};${this.x}H`);
        let color = this.getColor(i);

        if (i === 0) {
          term.write(`${color}${this.chars[i]}\x1b[0m`);
        } else if (i === this.chars.length - 1) {
          // Delete the character at the very end of the tail
          term.write('\x1b[0m ');
        } else {
          term.write(`${color}${this.chars[i]}\x1b[0m`);
        }
      }
    }
  }

  /** Make this drop fall by 1 */
  fall() {
    this.y += 1;
    this.chars.pop();
    this.chars.unshift(Drop.randChar());
  }

  /** Get the color for rendering for the character at i */
  getColor(i) {
    if (i === 0) {
      return '\x1b[37;1m'; // Bright white
    } else if (i < this.chars.length / 3) {
      return '\x1b[32;1m'; // Bright green
    } else if (i < this.chars.length * 2 / 3) {
      return '\x1b[32m'; // Green
    } else {
      return '\x1b[32;2m'; // Dimmed green
    }
  }

  /** Return a random hex character */
  static randChar() {
    return Math.floor(Math.random() * 16).toString(16);
  }
}

// This may not behave well on window resize event.
export async function runMatrix(term, _) {
  // Switch to alternate buffer and hide the cursor
  term.write('\x1b[?1049h');
  term.write('\x1b[?25l');

  // Backup and clear tracked links to remove artifacts
  let linksBackup = [...LINKS];
  LINKS.length = 0;

  // Turn process to true and add a listener to cancel process from any keypress
  Shell.process = true;
  Shell.code = 0;
  let listener = term.onData(_ => { Shell.process = false; });

  const sleep = 64;
  let rain = new Rain(term.cols, term.rows);

  while (Shell.process) {
    rain.render(term);
    rain.fall();

    await new Promise(resolve => setTimeout(resolve, sleep));
  }

  // Dispose the listener and turn back on the cursor
  listener.dispose();

  // Turn back on the cursor and switch back to normal buffer
  term.write('\x1b[?25h');
  term.write('\x1b[?1049l');

  // Restore links
  LINKS.push(...linksBackup);

  // Disable additional padding since there is no output to normal buffer
  Shell.prompt(term, false);
}
