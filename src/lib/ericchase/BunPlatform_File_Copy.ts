import { Async_BunPlatform_File_Compare } from './BunPlatform_File_Compare.js';
import { NODE_PATH, NodePlatform_Result } from './NodePlatform.js';

export async function Async_BunPlatform_File_Copy(from_path: string, to_path: string, overwrite: boolean): Promise<NodePlatform_Result<boolean>> {
  from_path = NODE_PATH.normalize(from_path);
  to_path = NODE_PATH.normalize(to_path);
  if (from_path === to_path) {
    return { value: false };
  }
  if (overwrite !== true) {
    if ((await Bun.file(to_path).exists()) === true) {
      return { value: false };
    }
  }
  try {
    await Bun.write(Bun.file(to_path), Bun.file(from_path));
    return { value: (await Async_BunPlatform_File_Compare(from_path, to_path)).value };
  } catch (error) {
    return { error, value: false };
  }
}
