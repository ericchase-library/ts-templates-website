type ReleaseType = 'major' | 'premajor' | 'minor' | 'preminor' | 'patch' | 'prepatch' | 'prerelease' | 'release';
interface Options {
  loose?: boolean | undefined;
}
/** Base number to be used for the prerelease identifier */
type IdentifierBase = '0' | '1';
export declare namespace SEMVER_UTIL {
  function increment(version: string, release: ReleaseType, options?: Options, identifier?: string, identifierBase?: IdentifierBase | false): string | undefined;
}
export {};
