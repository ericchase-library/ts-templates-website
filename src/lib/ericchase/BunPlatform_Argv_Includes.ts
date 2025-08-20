export function BunPlatform_Argv_Includes(arg: string): boolean {
  return Bun.argv.includes(arg);
}
