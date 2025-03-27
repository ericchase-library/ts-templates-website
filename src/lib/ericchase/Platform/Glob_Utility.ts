import { CPath } from './FilePath.js';
import { CPlatformProvider } from './PlatformProvider.js';

export function globMatch(platform: CPlatformProvider, query: string, include_patterns: string[], exclude_patterns: string[]): boolean {
  let matched = false;
  for (const pattern of include_patterns) {
    if (platform.Utility.globMatch(query, pattern) === true) {
      matched = true;
      break;
    }
  }
  for (const pattern of exclude_patterns) {
    if (platform.Utility.globMatch(query, pattern) === true) {
      matched = false;
      break;
    }
  }
  return matched;
}

export async function globScan(platform: CPlatformProvider, path: CPath, include_patterns: string[], exclude_patterns: string[], absolutepaths = false, onlyfiles = true): Promise<Set<string>> {
  const included: string[] = [];
  for (const pattern of include_patterns) {
    included.push(...(await Array.fromAsync(platform.Directory.globScan(path, pattern, absolutepaths, onlyfiles))));
  }
  const excluded: string[] = [];
  for (const pattern of exclude_patterns) {
    excluded.push(...(await Array.fromAsync(platform.Directory.globScan(path, pattern, absolutepaths, onlyfiles))));
  }
  return new Set(included).difference(new Set(excluded));
}
