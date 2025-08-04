import { NODE_FS, NODE_PATH, NodePlatform_Result } from './NodePlatform.js';

export async function Async_NodePlatform_File_Read_Bytes(path: string): Promise<NodePlatform_Result<Uint8Array>> {
  path = NODE_PATH.normalize(path);
  try {
    return { value: Uint8Array.from(await NODE_FS.readFile(path)) };
  } catch (error) {
    return { error };
  }
}
