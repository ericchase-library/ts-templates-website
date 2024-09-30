export function GetLeftMarginSize(text: string) {
  let i = 0;
  for (; i < text.length; i++) {
    if (text[i] !== ' ') {
      break;
    }
  }
  return i;
}

export function LineIsOnlyWhiteSpace(line: string) {
  return /^\s*$/.test(line);
}

export function RemoveWhiteSpaceOnlyLinesFromTopAndBottom(text: string) {
  const lines = SplitLines(text);
  return lines.slice(
    lines.findIndex((line) => LineIsOnlyWhiteSpace(line) === false),
    1 + lines.findLastIndex((line) => LineIsOnlyWhiteSpace(line) === false),
  );
}

export function Split(text: string, delimiter: string | RegExp, remove_empty_items = false): string[] {
  const items = text.split(delimiter);
  return remove_empty_items === false ? items : items.filter((item) => item.length > 0);
}
export function SplitLines(text: string, remove_empty_items = false): string[] {
  return Split(text, /\r?\n/, remove_empty_items);
}
export function SplitMultipleSpaces(text: string, remove_empty_items = false): string[] {
  return Split(text, / +/, remove_empty_items);
}
export function SplitMultipleWhiteSpace(text: string, remove_empty_items = false): string[] {
  return Split(text, /\s+/, remove_empty_items);
}

export function ToSnakeCase(text: string): string {
  return text.toLowerCase().replace(/ /g, '-');
}

export function TrimLines(lines: string[]) {
  return lines.map((line) => line.trim());
}
