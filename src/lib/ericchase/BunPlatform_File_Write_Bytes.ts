import { NODE_PATH, NodePlatform_Result } from './NodePlatform.js';

export async function Async_BunPlatform_File_Write_Bytes(path: string, bytes: Uint8Array): Promise<NodePlatform_Result<boolean>> {
  path = NODE_PATH.normalize(path);
  try {
    await Bun.write(path, bytes);
    return { value: true };
  } catch (error) {
    return { error, value: false };
  }
}
