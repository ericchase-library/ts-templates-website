import { Async_BunPlatform_Glob_Scan_Generator } from './BunPlatform_Glob_Scan_Generator.js';
import { NODE_PATH } from './NodePlatform.js';

export async function Async_BunPlatform_Glob_Scan_Ex(dir_path: string, include_patterns: string[], exclude_patterns: string[], options?: { absolute_paths?: boolean; only_files?: boolean }): Promise<Set<string>> {
  dir_path = NODE_PATH.normalize(dir_path);
  const included: string[] = [];
  for (const pattern of include_patterns) {
    included.push(...(await Array.fromAsync(Async_BunPlatform_Glob_Scan_Generator(dir_path, pattern, options))));
  }
  const excluded: string[] = [];
  for (const pattern of exclude_patterns) {
    excluded.push(...(await Array.fromAsync(Async_BunPlatform_Glob_Scan_Generator(dir_path, pattern, options))));
  }
  return new Set(included).difference(new Set(excluded));
}
