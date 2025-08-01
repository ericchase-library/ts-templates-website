import { NODE_FS, NODE_PATH } from './NodePlatform.js';

export async function Async_NodePlatform_Path_Is_File(path: string): Promise<boolean> {
  path = NODE_PATH.normalize(path);
  try {
    return (await NODE_FS.lstat(path)).isFile();
  } catch (error) {}
  return false;
}
