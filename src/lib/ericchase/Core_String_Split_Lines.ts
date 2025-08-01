import { Core_String_Split } from './Core_String_Split.js';

export function Core_String_Split_Lines(text: string, remove_empty_items = false): string[] {
  return Core_String_Split(text, /\r?\n/, remove_empty_items);
}
