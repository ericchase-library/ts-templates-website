declare class Class_Instance {
  instance: any;
  addFile(entry_name: string, content: Buffer | string): void;
  addLocalFile(filepath: string): void;
  addLocalFolder(folderpath: string): void;
  writeZip(outpath: string): boolean;
}
export declare namespace ZIP_UTIL {
  function Instance(): Class_Instance;
}
export {};
