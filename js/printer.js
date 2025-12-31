import { LINKS } from "./global.js";

/** Format and print the given line */
export function printLine(term, line) {
  let text = line[0];
  const hLine = `\x1b[37;1m${'─'.repeat(term.cols)}\x1b[0m`;

  // Inject formatting to links / commands
  if (line.length > 1) {
    for (const link of line.slice(1)) {
      switch (link.type) {
        case 'link':
        case 'image':
          text = text.replace(link.pattern, `\x1b[36m${link.pattern}\x1b[0m`);
          break;
        case 'command':
          text = text.replace(link.pattern, `\x1b[32;1m${link.pattern}\x1b[0m`);
          break;
        case 'alias':
          text = text.replace(link.pattern, `\x1b[33;1m${link.pattern}\x1b[0m`);
          break;
        default:
          break;
      }
    }
  } else {
  // Crude pseudo markdown formatting
    if (text.length > 1) {
      switch (text[0]) {
        case '#':
          text = (text.startsWith('## ') ? `${hLine}\r\n\r\n` : '') + `\x1b[34;1m${text}\x1b[0m`;
          break;
        case '>':
          text = `\x1b[37;1m│\x1b[0m\x1b[37;2m${text.slice(1)}\x1b[0m`;
          break;
        default:
          break;
      }
    }
  }

  term.write(text);

  // Register interactive elements after the text is printed
  if (line.length > 1) {
    for (const link of line.slice(1)) {
      term.write('', () => {
        LINKS.push({
          marker: term.registerMarker(),
          type: link.type,
          pattern: link.pattern,
          url: link.url,
        });
      });
    }
  }

  term.writeln('');
}

/** Print the given list of lines */
export function printLines(term, content) {
  for (const line of content) {
    printLine(term, line);
  }

  return;
}
