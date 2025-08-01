export function BunPlatform_Args_Has(arg: string): boolean {
  return Bun.argv.includes(arg);
}
