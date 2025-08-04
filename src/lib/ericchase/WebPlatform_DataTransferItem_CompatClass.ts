export class Class_WebPlatform_DataTransferItem_CompatClass {
  constructor(public item: DataTransferItem) {}
  getAsEntry(): FileSystemEntry | undefined {
    if (this.item.kind === 'file') {
      // @ts-expect-error: `getAsEntry` does not exist.
      return this.item.getAsEntry?.() ?? this.item.webkitGetAsEntry?.() ?? undefined;
    }
  }
  getAsFile(): File | undefined {
    if (this.item.kind === 'file') {
      return this.item.getAsFile?.() ?? undefined;
    }
  }
  /** `callback` might never be called */
  getAsString(callback: (data: string) => void): void {
    if (this.item.kind === 'string') {
      this.item.getAsString?.(callback);
    }
  }
}

export function WebPlatform_DataTransferItem_CompatClass(item: DataTransferItem): Class_WebPlatform_DataTransferItem_CompatClass {
  return new Class_WebPlatform_DataTransferItem_CompatClass(item);
}
