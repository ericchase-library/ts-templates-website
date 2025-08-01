import { Core_Array_Split } from './Core_Array_Split.js';
import { Core_JSON_Parse_Raw_String } from './Core_JSON_Parse_Raw_String.js';
import { Core_String_Split } from './Core_String_Split.js';
import { Core_String_Split_Multiple_Spaces } from './Core_String_Split_Multiple_Spaces.js';

/**
 * The Core_JSON_Parse_Raw_String(String.raw``)s are to keep bundlers (i.e Bun)
 * from replacing the unicode code points with an alternative representation.
 */
const SHELL__GENERALASCIICODES = Create_Ascii_Code_Map(String.raw`
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

const SHELL__KEYS_ESC = SHELL__GENERALASCIICODES.ESC;

const SHELL__KEYS = {
  ARROWS: {
    DOWN: Core_JSON_Parse_Raw_String(String.raw`\u001B[B`),
    LEFT: Core_JSON_Parse_Raw_String(String.raw`\u001B[D`),
    RIGHT: Core_JSON_Parse_Raw_String(String.raw`\u001B[C`),
    UP: Core_JSON_Parse_Raw_String(String.raw`\u001B[A`),
  },
  GENERAL: {
    BEL: SHELL__GENERALASCIICODES.BEL,
    BS: SHELL__GENERALASCIICODES.BS,
    CR: SHELL__GENERALASCIICODES.CR,
    CSI: `${SHELL__KEYS_ESC}[`,
    DCS: `${SHELL__KEYS_ESC}P`,
    DEL: SHELL__GENERALASCIICODES.DEL,
    ESC: SHELL__KEYS_ESC,
    FF: SHELL__GENERALASCIICODES.FF,
    HT: SHELL__GENERALASCIICODES.HT,
    LF: SHELL__GENERALASCIICODES.LF,
    OSC: `${SHELL__KEYS_ESC}]`,
    VT: SHELL__GENERALASCIICODES.VT,
  },
  SIGINT: Core_JSON_Parse_Raw_String(String.raw`\u0003`), // Kill the currently running task in terminal.
};

function Create_Ascii_Code_Map(table: string): Record<string, string> {
  const map: Record<string, string> = {};
  for (const [name, code] of Core_Array_Split(Core_String_Split(table.trim(), '|', true), 3)) {
    map[name.trim()] = Core_JSON_Parse_Raw_String(Core_String_Split_Multiple_Spaces(code, true)[0]);
  }
  return map;
}

export const NodePlatform_Shell_Keys = SHELL__KEYS;
