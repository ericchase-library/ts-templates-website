import { NODE_PATH } from './NodePlatform.js';
import { Async_NodePlatform_Path_Is_Directory } from './NodePlatform_Path_Is_Directory.js';

export async function* Async_BunPlatform_Glob_Scan_Generator(dir_path: string, pattern: string, options?: { absolute_paths?: boolean; only_files?: boolean }): AsyncGenerator<string> {
  dir_path = NODE_PATH.normalize(dir_path);
  if (await Async_NodePlatform_Path_Is_Directory(dir_path)) {
    for await (const value of new Bun.Glob(pattern).scan({
      absolute: options?.absolute_paths ?? false,
      cwd: dir_path,
      dot: true,
      onlyFiles: options?.only_files ?? true,
    })) {
      yield value;
    }
  }
}
