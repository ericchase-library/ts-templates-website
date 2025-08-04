export class Class_WebPlatform_File_CompatClass {
  constructor(public file: File) {}
  get relativePath(): string | undefined {
    // @ts-expect-error: `relativePath` does not exist.
    return this.file.relativePath ?? this.file.webkitRelativePath ?? undefined;
  }
}

export function WebPlatform_File_CompatClass(file: File): Class_WebPlatform_File_CompatClass {
  return new Class_WebPlatform_File_CompatClass(file);
}
