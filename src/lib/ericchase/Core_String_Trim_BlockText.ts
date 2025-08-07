import { Core_JSON_Parse_Raw_String } from './Core_JSON_Parse_Raw_String.js';
import { Core_String_Get_Left_Margin_Size } from './Core_String_Get_Left_Margin_Size.js';
import { Core_String_Line_Is_Only_WhiteSpace } from './Core_String_Line_Is_Only_WhiteSpace.js';
import { Core_String_Remove_WhiteSpace_Only_Lines_From_Top_And_Bottom } from './Core_String_Remove_WhiteSpace_Only_Lines_From_Top_And_Bottom.js';

/**
 * @defaults
 * @param options.empty_lines_after_count `0`
 * @param options.empty_lines_before_count `0`
 * @param options.left_margin_size `0` Number of spaces to pad the left margin of text.
 */
export function Core_String_Trim_BlockText(
  text: string,
  options?: {
    empty_lines_after_count?: number;
    empty_lines_before_count?: number;
    left_margin_size?: number;
  },
): string {
  options ??= {};
  options.empty_lines_after_count ??= 0;
  options.empty_lines_before_count ??= 0;
  options.left_margin_size ??= 0;

  const nonwhitespace_lines = Core_String_Remove_WhiteSpace_Only_Lines_From_Top_And_Bottom(text);
  if (nonwhitespace_lines.length === 0) {
    return '';
  }

  const out: string[] = [];

  // add empty lines before
  for (let i = 0; i < options.empty_lines_before_count; i++) {
    out.push('');
  }

  // calculate left trim size
  let left_trim_size = Core_String_Get_Left_Margin_Size(nonwhitespace_lines[0]);
  for (const line of nonwhitespace_lines.slice(1)) {
    if (Core_String_Line_Is_Only_WhiteSpace(line) === false) {
      left_trim_size = Math.min(left_trim_size, Core_String_Get_Left_Margin_Size(line));
    }
  }

  // trim lines by left trim size and add left margin
  const left_margin_text = ' '.repeat(options.left_margin_size);
  for (const line of nonwhitespace_lines) {
    out.push(left_margin_text + line.slice(left_trim_size));
  }

  // add empty lines after
  for (let i = 0; i < options.empty_lines_after_count; i++) {
    out.push('');
  }

  return out.join(Core_JSON_Parse_Raw_String(String.raw`\n`));
}
