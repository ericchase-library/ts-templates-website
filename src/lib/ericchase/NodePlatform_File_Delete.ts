import { NODE_FS, NODE_PATH, NodePlatform_Result } from './NodePlatform.js';
import { Async_NodePlatform_Path_Exists } from './NodePlatform_Path_Exists.js';
import { Async_NodePlatform_Path_Is_File } from './NodePlatform_Path_Is_File.js';

export async function Async_NodePlatform_File_Delete(path: string): Promise<NodePlatform_Result<boolean>> {
  path = NODE_PATH.normalize(path);
  try {
    if ((await Async_NodePlatform_Path_Is_File(path)) === true) {
      await NODE_FS.unlink(path);
    }
    return { value: (await Async_NodePlatform_Path_Exists(path)).value === false };
  } catch (error) {
    return { error, value: (await Async_NodePlatform_Path_Exists(path)).value === false };
  }
}
