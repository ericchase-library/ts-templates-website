import { NODE_FS, NODE_PATH, NodePlatform_Result } from './NodePlatform.js';
import { Async_NodePlatform_Path_Exists } from './NodePlatform_Path_Exists.js';
import { Async_NodePlatform_Path_Is_Directory } from './NodePlatform_Path_Is_Directory.js';

export async function Async_NodePlatform_Directory_Delete(path: string, recursive: boolean): Promise<NodePlatform_Result<boolean>> {
  path = NODE_PATH.normalize(path);
  try {
    if ((await Async_NodePlatform_Path_Is_Directory(path)) === true) {
      if (recursive === false) {
        await NODE_FS.rmdir(path);
      } else {
        await NODE_FS.rm(path, { recursive: true, force: true });
      }
    }
    return { value: (await Async_NodePlatform_Path_Exists(path)).value === false };
  } catch (error) {
    return { error, value: (await Async_NodePlatform_Path_Exists(path)).value === false };
  }
}
