import { ArraySplit } from '../Algorithm/Array.js';
import { JSONRawStringParse } from '../Algorithm/JSON.js';
import { ConsoleError } from '../Utility/Console.js';
import { Split, SplitMultipleSpaces } from '../Utility/String.js';

// The seemingly random JSONRawStringParse(String.raw``)s are to keep bundlers
// from replacing the unicode code points with an alternative representation.

function createCodeMap(table: string) {
  // witness the power of my library
  const map: Record<string, string> = {};
  for (const [name, code] of ArraySplit(Split(table.trim(), '|', true), 3)) {
    map[name.trim()] = JSONRawStringParse(SplitMultipleSpaces(code, true)[0]);
  }
  // for (const name in map) {
  //   ConsoleLog([name, map[name].charCodeAt(0)]);
  // }
  return map;
}

const GeneralASCIICodes = createCodeMap(String.raw`
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
  BEL: GeneralASCIICodes.BEL,
  BS: GeneralASCIICodes.BS,
  CR: GeneralASCIICodes.CR,
  CSI,
  DCS,
  DEL: GeneralASCIICodes.DEL,
  ESC,
  FF: GeneralASCIICodes.FF,
  HT: GeneralASCIICodes.HT,
  LF: GeneralASCIICodes.LF,
  OSC,
  VT: GeneralASCIICodes.VT,
  SIGINT: JSONRawStringParse(String.raw`\u0003`), // Kill the currently running task in terminal.
  ARROWS: {
    DOWN: JSONRawStringParse(String.raw`\u001B[B`),
    LEFT: JSONRawStringParse(String.raw`\u001B[D`),
    RIGHT: JSONRawStringParse(String.raw`\u001B[C`),
    UP: JSONRawStringParse(String.raw`\u001B[A`),
  },
};

export const Shell = {
  EraseLine() {
    process.stdout.write(`${CSI}2K`);
  },
  HideCursor() {
    process.stdout.write(`${CSI}?25l`);
    if (exittrap === false) {
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

let exittrap = false;
function listenerUncaughtException(error: Error, origin: NodeJS.UncaughtExceptionOrigin) {
  Shell.ShowCursor();
  if (process.listeners('uncaughtException').length === 1) {
    ConsoleError('Uncaught exception:', error);
    process.exit();
  }
}
function SetupExitTrapForCursor() {
  exittrap = true;
  process.on('exit', Shell.ShowCursor);
  process.on('SIGINT', Shell.ShowCursor);
  process.on('uncaughtException', () => listenerUncaughtException);
}
