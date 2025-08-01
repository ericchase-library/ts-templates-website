import { BunPlatform_Glob_Match } from './BunPlatform_Glob_Match.js';

export function BunPlatform_Glob_Match_Ex(query: string, include_patterns: string[], exclude_patterns: string[]): boolean {
  for (const pattern of exclude_patterns) {
    if (BunPlatform_Glob_Match(query, pattern) === true) {
      return false;
    }
  }
  for (const pattern of include_patterns) {
    if (BunPlatform_Glob_Match(query, pattern) === true) {
      return true;
    }
  }
  return false;
}
