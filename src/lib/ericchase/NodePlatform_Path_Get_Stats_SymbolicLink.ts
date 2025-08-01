import { NODE_FS, NODE_FS_SYNC, NODE_PATH, NodePlatform_Result } from './NodePlatform.js';

export async function Async_NodePlatform_Path_Get_Stats_SymbolicLink(path: string): Promise<NodePlatform_Result<NODE_FS_SYNC.Stats>> {
  path = NODE_PATH.normalize(path);
  try {
    return { value: await NODE_FS.lstat(path) };
  } catch (error) {
    return { error };
  }
}
