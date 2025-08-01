export function BunPlatform_Glob_Match(query: string, pattern: string): boolean {
  return new Bun.Glob(pattern).match(query);
}
