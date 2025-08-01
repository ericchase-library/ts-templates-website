import { NODE_FS, NODE_PATH, NodePlatform_Result } from './NodePlatform.js';

export async function Async_NodePlatform_File_Read_Text(path: string): Promise<NodePlatform_Result<string>> {
  path = NODE_PATH.normalize(path);
  try {
    return { value: await NODE_FS.readFile(path, { encoding: 'utf8' }) };
  } catch (error) {
    return { error };
  }
}
