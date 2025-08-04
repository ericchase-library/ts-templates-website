import { Async_WebPlatform_DataTransfer_Get_Entries_Generator } from './WebPlatform_DataTransfer_Get_Entries_Generator.js';
import { Async_WebPlatform_FileSystemEntry_Get_File } from './WebPlatform_FileSystemEntry_Get_File.js';

export async function* Async_WebPlatform_DataTransfer_Get_Files_Generator(dataTransfer: DataTransfer): AsyncGenerator<File> {
  for await (const entry of Async_WebPlatform_DataTransfer_Get_Entries_Generator(dataTransfer)) {
    // `FileSystemFileEntry` does not exist in all browsers
    if (entry.isFile === true) {
      yield await Async_WebPlatform_FileSystemEntry_Get_File(entry as FileSystemFileEntry);
    }
  }
}
