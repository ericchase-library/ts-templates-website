import { Class_WebPlatform_DataTransferItem_CompatClass, WebPlatform_DataTransferItem_CompatClass } from './WebPlatform_DataTransferItem_CompatClass.js';

export class Class_WebPlatform_DataTransfer_CompatClass {
  constructor(public dataTransfer: DataTransfer) {}
  items(): Class_WebPlatform_DataTransferItem_CompatClass[] {
    const list: Class_WebPlatform_DataTransferItem_CompatClass[] = [];
    for (const item of this.dataTransfer.items) {
      list.push(WebPlatform_DataTransferItem_CompatClass(item));
    }
    return list;
  }
}

export function WebPlatform_DataTransfer_CompatClass(dataTransfer: DataTransfer): Class_WebPlatform_DataTransfer_CompatClass {
  return new Class_WebPlatform_DataTransfer_CompatClass(dataTransfer);
}
