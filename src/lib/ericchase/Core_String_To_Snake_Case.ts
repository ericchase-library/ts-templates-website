export function Core_String_To_Snake_Case(text: string): string {
  return text.toLowerCase().replace(/ /g, '-');
}
