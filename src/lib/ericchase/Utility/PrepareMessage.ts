import { JSONRawStringParse } from '../Algorithm/JSON.js';
import { GetLeftMarginSize, LineIsOnlyWhiteSpace, RemoveWhiteSpaceOnlyLinesFromTopAndBottom } from './String.js';

export function PrepareMessage(message: string, left_margin_pad_size = 0, number_of_blank_lines_after = 0, number_of_blank_lines_before = 0): string {
  const lines = RemoveWhiteSpaceOnlyLinesFromTopAndBottom(message);
  const out: string[] = lines.length > 0 ? [] : [''];
  for (let i = 0; i < number_of_blank_lines_before; i++) {
    out.push('');
  }
  let min_trim_size = GetLeftMarginSize(lines.at(0) ?? '');
  for (const line of lines.slice(1)) {
    if (LineIsOnlyWhiteSpace(line) === false) {
      min_trim_size = Math.min(min_trim_size, GetLeftMarginSize(line));
    }
  }
  const margin = ' '.repeat(left_margin_pad_size);
  for (const line of lines) {
    out.push(margin + line.slice(min_trim_size));
  }
  for (let i = 0; i < number_of_blank_lines_after; i++) {
    out.push('');
  }
  return out.join(JSONRawStringParse(String.raw`\n`));
}
