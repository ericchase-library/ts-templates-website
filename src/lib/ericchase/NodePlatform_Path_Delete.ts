import { NODE_FS, NODE_PATH, NodePlatform_Result } from './NodePlatform.js';
import { Async_NodePlatform_Path_Exists } from './NodePlatform_Path_Exists.js';

export async function Async_NodePlatform_Path_Delete(path: string): Promise<NodePlatform_Result<boolean>> {
  path = NODE_PATH.normalize(path);
  try {
    await NODE_FS.rm(path, { recursive: true, force: true });
    return { value: (await Async_NodePlatform_Path_Exists(path)).value === false };
  } catch (error) {
    return { error, value: (await Async_NodePlatform_Path_Exists(path)).value === false };
  }
}
