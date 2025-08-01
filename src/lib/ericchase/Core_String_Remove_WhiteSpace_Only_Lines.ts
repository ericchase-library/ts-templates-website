import { Core_String_Line_Is_Only_WhiteSpace } from './Core_String_Line_Is_Only_WhiteSpace.js';
import { Core_String_Split_Lines } from './Core_String_Split_Lines.js';

export function Core_String_Remove_WhiteSpace_Only_Lines(text: string): string[] {
  const lines = Core_String_Split_Lines(text);
  return lines.filter((line) => !Core_String_Line_Is_Only_WhiteSpace(line));
}
