import { WebPlatform_DataTransferItem_CompatClass } from './WebPlatform_DataTransferItem_CompatClass.js';
import { Async_WebPlatform_FileSystemEntry_Read_Directory_Entries } from './WebPlatform_FileSystemEntry_Read_Directory_Entries.js';

export async function* Async_WebPlatform_DataTransfer_Get_Entries_Generator(dataTransfer: DataTransfer): AsyncGenerator<FileSystemEntry> {
  const entries: FileSystemEntry[] = [];
  // get top-level entries
  for (const item of dataTransfer.items) {
    const entry = WebPlatform_DataTransferItem_CompatClass(item).getAsEntry();
    if (entry !== undefined) {
      entries.push(entry);
    }
  }
  // recurse through each sub-level
  for (let index = 0; index < entries.length; index++) {
    const entry = entries[index];
    yield entry;
    // `FileSystemDirectoryEntry` does not exist in all browsers
    if (entry.isDirectory === true) {
      entries.push(...(await Async_WebPlatform_FileSystemEntry_Read_Directory_Entries(entry as FileSystemDirectoryEntry)));
    }
  }
}
