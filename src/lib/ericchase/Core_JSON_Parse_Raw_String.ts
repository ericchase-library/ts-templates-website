export function Core_JSON_Parse_Raw_String(str: string): string {
  return JSON.parse(`"${str}"`);
}
