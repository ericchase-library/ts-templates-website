export function Core_String_Line_Is_Only_WhiteSpace(line: string): boolean {
  return /^\s*$/.test(line);
}
