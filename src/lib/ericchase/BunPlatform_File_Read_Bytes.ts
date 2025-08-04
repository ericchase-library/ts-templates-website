import { NODE_PATH, NodePlatform_Result } from './NodePlatform.js';

export async function Async_BunPlatform_File_Read_Bytes(path: string): Promise<NodePlatform_Result<Uint8Array>> {
  path = NODE_PATH.normalize(path);
  try {
    return { value: Uint8Array.from(await Bun.file(path).bytes()) };
  } catch (error) {
    return { error };
  }
}
