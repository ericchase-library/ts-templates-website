import { ArraySplit } from '../../Algorithm/Array.js';
import { ConsoleError } from '../../Utility/Console.js';
import { Split, SplitMultipleSpaces } from '../../Utility/String.js';

function createCodeMap(table: string) {
  // witness the power of my library
  const map: Record<string, string> = {};
  for (const [name, code] of ArraySplit(Split(table.trim(), '|', true), 3)) {
    map[name.trim()] = SplitMultipleSpaces(code, true)[0];
  }
  // for (const name in map) {
  //   ConsoleLog([name, map[name].charCodeAt(0)]);
  // }
  return map;
}

const GeneralASCIICodes = createCodeMap(`
| BEL | \u0007 | Terminal bell
| BS  | \u0008 | Backspace
| HT  | \u0009 | Horizontal TAB
| LF  | \u000A | Linefeed (newline)
| VT  | \u000B | Vertical TAB
| FF  | \u000C | Formfeed (also: New page NP)
| CR  | \u000D | Carriage return
| ESC | \u001B | Escape character
| DEL | \u007F | Delete character
`);

// Sequences
const ESC = GeneralASCIICodes.ESC;
const CSI = `${ESC}[`;
const DCS = `${ESC}P`;
const OSC = `${ESC}]`;

export const KEYS = {
  // Special
  SIGINT: '\u0003', // Kill the currently running task in terminal.
  ESC,
  CSI,
  DCS,
  OSC,
  ARROWS: {
    DOWN: '\u001B[B',
    LEFT: '\u001B[D',
    RIGHT: '\u001B[C',
    UP: '\u001B[A',
  },
};
export const Shell = {
  EraseLine() {
    process.stdout.write(`${CSI}2K`);
  },
  HideCursor() {
    process.stdout.write(`${CSI}?25l`);
    if (exit_trapped === false) {
      SetupExitTrapForCursor();
    }
  },
  MoveCursorDown(count = 0, to_start = false) {
    if (to_start === true) {
      process.stdout.write(`${CSI}${count}E`);
    } else {
      process.stdout.write(`${CSI}${count}B`);
    }
  },
  MoveCursorLeft(count = 0) {
    process.stdout.write(`${CSI}${count}D`);
  },
  MoveCursorRight(count = 0) {
    process.stdout.write(`${CSI}${count}C`);
  },
  MoveCursorStart() {
    process.stdout.write('\r');
  },
  MoveCursorToColumn(count = 0) {
    process.stdout.write(`${CSI}${count}G`);
  },
  MoveCursorUp(count = 0, to_start = false) {
    if (to_start === true) {
      process.stdout.write(`${CSI}${count}F`);
    } else {
      process.stdout.write(`${CSI}${count}A`);
    }
  },
  ShowCursor() {
    process.stdout.write(`${CSI}?25h`);
  },
};

let exit_trapped = false;
function listenerUncaughtException(error: Error, origin: NodeJS.UncaughtExceptionOrigin) {
  Shell.ShowCursor();
  if (process.listeners('uncaughtException').length === 1) {
    ConsoleError(error);
    process.exit();
  }
}
function SetupExitTrapForCursor() {
  exit_trapped = true;
  process.on('exit', Shell.ShowCursor);
  process.on('SIGINT', Shell.ShowCursor);
  process.on('uncaughtException', () => listenerUncaughtException);
}
