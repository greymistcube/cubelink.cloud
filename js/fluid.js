/**
 *  @file Javascript reimplementation of Yusuke Endoh's ASCII fluid dynamics
 *  code, [a submission to IOCCC 2012](https://www.ioccc.org/2012/endoh1/).
 *  Mostly based on Daniele Venier's [deobfuscated code and explanation](https://asymptoticbits.com/posts/ascii-liquid/).
 */

import { Shell } from "./global.js";

/** Custom vector class */
class Vector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    return;
  }

  add(v) { return new Vector(this.x + v.x, this.y + v.y); }
  sub(v) { return new Vector(this.x - v.x, this.y - v.y); }
  mult(s) { return new Vector(this.x * s, this.y * s); }
  length() { return Math.sqrt(this.x ** 2 + this.y ** 2); }
  dist(v) { return Math.sqrt((this.x - v.x) ** 2 + (this.y - v.y) ** 2); }
}

let ZERO_VECTOR = new Vector(0, 0);
const ENV = {
  // Fixed rows and columns to conserve computation
  ROWS: 24,
  COLS: 80,

  /** Radius of interaction */
  P_RADIUS: 2,

  /** Mass of a particle */
  P_MASS: 1,

  /** Wall density */
  W_RHO: 9,

  /** Gravity vector */
  G: new Vector(0, 1),

  /** Pressure constant */
  P: 4,

  /** Viscosity constant */
  Mu: 4,

  /** Rest density */
  P0: 1.6,

  /** Timestep */
  DT: 0.08,

  /** Convection count */
  CN: 2,
};

const COLORS = {
  GREY: '37;2',
  FG_BLACK: '38;5;235', // Color closest to the background
  FG_BLUE_0: '38;5;21',
  FG_BLUE_1: '38;5;27',
  FG_BLUE_2: '38;5;33',
  BG_BLACK: '48;5;235', // Color closest to the background
  BG_BLUE_0: '48;5;21',
  BG_BLUE_1: '48;5;27',
  BG_BLUE_2: '48;5;33',
};

const INPUT = [
  '',
  '',
  '',
  '',
  '    ### .......................                                          ###    ',
  '    ###.........................                                         ###    ',
  '    ###.........................                                         ###    ',
  '    ###.........................                                         ###    ',
  '    ###.........................                                         ###    ',
  '    ###.........................                                         ###    ',
  '    ###.........................                                         ###    ',
  '    ###.........................                                         ###    ',
  '    ###.........................                                         ###    ',
  '    ###.........................                                         ###    ',
  '    ###.........................                                         ###    ',
  '    ###.........................                                         ###    ',
  '    ###.........................                                         ###    ',
  '    ### .......................                                          ###    ',
  '    ########################################################################    ',
  '     ######################################################################     ',
  '',
  '',
  '',
  '',
];

class Particle {
  constructor(pos, char) {
    switch (char) {
      case ' ':
        throw new Error('Value of char must not be \' \'');
      case '#':
        this.wall = true;
        break;
      default:
        this.wall = false;
        break;
    }

    this.pos = pos;
    this.rho = this.wall ? ENV.W_RHO : 0;
    this.f = new Vector(0, 0);
    this.v = new Vector(0, 0);
    return;
  }
}

/** Spiky kernel */
function W_spiky(p1, p2) {
  let d = p1.pos.dist(p2.pos);
  return (d < ENV.P_RADIUS) ? ((d / ENV.P_RADIUS) - 1) ** 2 : 0;
}

/** Interaction for between two particles */
function interaction_force(p1, p2) {
  let d = p1.pos.dist(p2.pos);
  if (d < ENV.P_RADIUS) {
    let pressure = (p1.pos.sub(p2.pos)).mult((p1.rho + p2.rho - 2 * ENV.P0) * ENV.P);
    let viscosity = (p1.v.sub(p2.v)).mult(ENV.Mu);
    return (pressure.sub(viscosity)).mult((1 - d / ENV.P_RADIUS) / p1.rho);
  } else {
    return ZERO_VECTOR;
  }
}

class Simulator {
  constructor(lines) {
    this.particles = [];
    for (let y = 0; y < lines.length; y++) {
      for (let x = 0; x < lines[y].length; x++) {
        if (lines[y][x] !== ' ') {
          this.particles.push(new Particle(new Vector(x + 0.5, 2 * y + 0.5), lines[y][x]));
          this.particles.push(new Particle(new Vector(x + 0.5, 2 * y + 1.5), lines[y][x]));
        }
      }
    }

    this.grid = this.build_grid();
    return;
  }

  /** Build a grid from the tracked particles */
  build_grid() {
    let grid = [];
    for (let y = 0; y < ENV.ROWS * 2; y++) {
      let grid_row = [];
      for (let x = 0; x < ENV.COLS; x++) {
        grid_row.push([]);
      }
      grid.push(grid_row);
    }

    for (const p of this.particles) {
      grid[Math.trunc(p.pos.y)][Math.trunc(p.pos.x)].push(p);
    }

    return grid;
  }

  /** Get a list of all particles in range of the given particle */
  particles_in_range(p) {
    let particles = [];
    for (let i = Math.max(0, Math.trunc(p.pos.x - ENV.P_RADIUS)); i < Math.min(ENV.COLS, Math.trunc(p.pos.x + ENV.P_RADIUS + 1)); i++) {
      for (let j = Math.max(0, Math.trunc(p.pos.y - ENV.P_RADIUS)); j < Math.min(ENV.ROWS * 2, Math.trunc(p.pos.y + ENV.P_RADIUS + 1)); j++) {
        particles.push(...this.grid[j][i]);
      }
    }

    return particles;
  }

  update_density() {
    for (const p1 of this.particles) {
      p1.rho = (p1.wall) ? ENV.W_RHO : 0;
      for (const p2 of this.particles_in_range(p1)) {
        p1.rho = p1.rho + ENV.P_MASS * W_spiky(p1, p2);
      }
    }

    return;
  }

  update_force() {
    for (const p1 of this.particles) {
      if (p1.wall) {
        continue;
      }

      p1.f = ENV.G;
      for (const p2 of this.particles_in_range(p1)) {
        p1.f = p1.f.add(interaction_force(p1, p2));
      }
    }
  }

  update_particles_and_grid() {
    for (const p of this.particles) {
      if (p.wall) {
        continue;
      }

      p.v = p.v.add(p.f.mult(ENV.DT));
      p.pos = p.pos.add(p.v.mult(10 * ENV.DT));
    }

    this.particles = this.particles.filter(p => 0 <= p.pos.x && p.pos.x < ENV.COLS && 0 <= p.pos.y && p.pos.y < ENV.ROWS * 2);
    this.grid = this.build_grid();
  }
}

class Renderer {
  /** Generates a heatmap from the given list of particles
   *  - 0: no particles, i.e. air
   *  - negative: wall
   *  - positive: number of water particles in a cell
   */
  static generate_heatmap(particles) {
    let heatmap = [];
    for (let y = 0; y < ENV.ROWS * 2; y++) {
      let heatmap_row = [];
      for (let x = 0; x < ENV.COLS; x++) {
        heatmap_row.push(0);
      }

      heatmap.push(heatmap_row);
    }

    for (const p of particles) {
      let x = Math.trunc(p.pos.x);
      let y = Math.trunc(p.pos.y);
      heatmap[y][x] = (p.wall) ? -1 : heatmap[y][x] + 1;
    }

    for (let i = 0; i < ENV.CN; i++) {
      heatmap = Renderer.convect_heatmap(heatmap);
    }

    return heatmap;
  }

  static convect_heatmap(heatmap) {
    let xys = [];
    const es = [[0, -1], [-1, 0], [1, 0], [0, 1]];
    for (let y = 0; y < ENV.ROWS * 2; y++) {
      for (let x = 0; x < ENV.COLS; x++) {
        if (heatmap[y][x] > 0) {
          xys.push([x, y]);
        }
      }
    }

    for (const xy of xys) {
      for (const e of es) {
        let temp = xy.map((elem, index) => elem + e[index]);
        if (0 <= temp[0] && temp[0] < ENV.COLS && 0 <= temp[1] && temp[1] < ENV.ROWS * 2) {
          heatmap[temp[1]][temp[0]] = (heatmap[temp[1]][temp[0]] < 0) ? -1 : heatmap[temp[1]][temp[0]] + 1;
        }
      }
    }

    return heatmap;
  }

  static render(term, simulator) {
    let lines = [];
    for (let y = 0; y < ENV.ROWS; y++) {
      let line = [];
      for (let x = 0; x < ENV.COLS; x++) {
        line.push(' ');
      }
      lines.push(line);
    }

    let heatmap = Renderer.generate_heatmap(simulator.particles);
    for (let x = 0; x < ENV.COLS; x++) {
      for (let y = 0; y < ENV.ROWS; y++) {
        if (heatmap[y * 2][x] < 0) {
          lines[y][x] = `\x1b[${COLORS.GREY}m█\x1b[0m`;
        } else if (heatmap[y * 2][x] + heatmap[y * 2 + 1][x] > 0) {
            let top = Math.ceil(heatmap[y * 2][x] / 2);
            let top_color = COLORS.FG_BLACK;
            if (top > 2) {
                top_color = COLORS.FG_BLUE_2;
            } else if (top > 1) {
                top_color = COLORS.FG_BLUE_1;
            } else if (top > 0) {
                top_color = COLORS.FG_BLUE_0;
            }

            let bottom = Math.ceil(heatmap[y * 2 + 1][x] / 2);
            let bottom_color = COLORS.BG_BLACK;
            if (bottom > 2) {
                bottom_color = COLORS.BG_BLUE_2;
            } else if (bottom > 1) {
                bottom_color = COLORS.BG_BLUE_1;
            } else if (bottom > 0) {
                bottom_color = COLORS.BG_BLUE_0;
            }

            let color = `\x1b[${top_color};${bottom_color}m`;
            lines[y][x] = `${color}▀\x1b[0m`;
        }
      }
    }

    lines = lines.map(line => line.join(''));
    term.write('\x1b[1;1H');
    term.write('\x1b[0J');
    const padding = Math.trunc((term.rows - ENV.ROWS) / 2);
    for (let y = 0; y < ENV.ROWS; y++) {
      term.write(`\x1b[${y + 1 + padding};1H`);
      term.write(lines[y]);
    }
  }
}

// This may not behave well on window resize event.
export async function runFluid(term, _) {
  // Clear the screen and hide the cursor
  term.writeln('', () => { term.clear(); });
  term.write('\x1b[?25l');

  // Turn process to true and add a listener to cancel process from any keypress
  Shell.process = true;
  Shell.code = 0;
  let listener = term.onData(_ => { Shell.process = false; });

  const FPS = 48;
  const frametime = Math.trunc(1000 / FPS);
  let start = 0, end = 0;
  let simulator = new Simulator(INPUT);

  while (Shell.process) {
    start = performance.now();
    Renderer.render(term, simulator);
    simulator.update_density();
    simulator.update_force();
    simulator.update_particles_and_grid();
    end = performance.now();

    await new Promise(resolve => setTimeout(resolve, Math.max(0, frametime - (end - start))));
  }

  // Dispose the listener and turn back on the cursor
  listener.dispose();
  term.write('\x1b[?25h');

  // Move the cursor to the bottom first before clearing
  term.writeln(`\x1b[${term.rows};1H`);
  Shell.prompt(term);
  term.write('', () => { term.clear(); });
}
