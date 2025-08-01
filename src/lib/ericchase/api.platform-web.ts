import { Async_Core_Stream_Uint8_Read_Some } from './Core_Stream_Uint8_Read_Some.js';
import { ClassCompatBlob, ClassCompatDataTransfer, ClassCompatDataTransferItem, ClassCompatFile, ClassDomAttributeObserver, ClassDomCharacterDataObserver, ClassDomChildListObserver, ClassDomElementAddedObserver, ClassNodeListReference, ClassNodeReference } from './platform-web.js';

export type WebPlatform_Type_Blob_ClassCompat_Blob = ClassCompatBlob;
export type WebPlatform_Type_DataTransfer_ClassCompat_DataTransfer = ClassCompatDataTransfer;
export type WebPlatform_Type_DataTransferItem_ClassCompat_DataTransferItem = ClassCompatDataTransferItem;
export type WebPlatform_Type_DOM_Class_AttributeObserver = ClassDomAttributeObserver;
export type WebPlatform_Type_DOM_Class_CharacterDataObserver = ClassDomCharacterDataObserver;
export type WebPlatform_Type_DOM_Class_ChildListObserver = ClassDomChildListObserver;
export type WebPlatform_Type_DOM_Class_ElementAddedObserver = ClassDomElementAddedObserver;
export type WebPlatform_Type_File_ClassCompat_File = ClassCompatFile;
export type WebPlatform_Type_Node_Class_NodeListReference = ClassNodeListReference;
export type WebPlatform_Type_Node_Class_NodeReference = ClassNodeReference;

export function WebPlatform_Blob_Async_ReadSome(blob: Blob, count: number): Promise<Uint8Array> {
  const stream = WebPlatform_Blob_ClassCompat_Blob(blob).stream();
  if (stream !== undefined) {
    return Async_Core_Stream_Uint8_Read_Some(stream, count);
  }
  return Promise.resolve(new Uint8Array());
}

export function WebPlatform_Blob_ClassCompat_Blob(blob: Blob): ClassCompatBlob {
  return new ClassCompatBlob(blob);
}

export function WebPlatform_CSS_ToAdjustedEm(em: number, root: HTMLElement | SVGElement = document.documentElement): number {
  const fontSizePx = Number.parseInt(getComputedStyle(root).fontSize);
  return (16 / fontSizePx) * em;
}

export function WebPlatform_CSS_ToRelativeEm(em: number, root: HTMLElement | SVGElement = document.documentElement): number {
  const fontSizePx = Number.parseInt(getComputedStyle(root).fontSize);
  return (fontSizePx / 16) * em;
}

export function WebPlatform_CSS_ToRelativePx(px: number, root: HTMLElement | SVGElement = document.documentElement): number {
  const fontSizePx = Number.parseInt(getComputedStyle(root).fontSize);
  return (fontSizePx / 16) * px;
}

export async function* WebPlatform_DataTransfer_AsyncGen_GetEntries(dataTransfer: DataTransfer): AsyncGenerator<FileSystemEntry> {
  const entries: FileSystemEntry[] = [];
  // get top-level entries
  for (const item of dataTransfer.items) {
    const entry = WebPlatform_DataTransferItem_ClassCompat_DataTransferItem(item).getAsEntry();
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
      entries.push(...(await WebPlatform_FileSystemEntry_Async_ReadDirectoryEntries(entry as FileSystemDirectoryEntry)));
    }
  }
}

export async function* WebPlatform_DataTransfer_AsyncGen_GetFiles(dataTransfer: DataTransfer): AsyncGenerator<File> {
  for await (const entry of WebPlatform_DataTransfer_AsyncGen_GetEntries(dataTransfer)) {
    // `FileSystemFileEntry` does not exist in all browsers
    if (entry.isFile === true) {
      yield await WebPlatform_FileSystemEntry_Async_GetFile(entry as FileSystemFileEntry);
    }
  }
}

export function WebPlatform_DataTransfer_ClassCompat_DataTransfer(dataTransfer: DataTransfer): ClassCompatDataTransfer {
  return new ClassCompatDataTransfer(dataTransfer);
}

export function WebPlatform_DataTransferItem_ClassCompat_DataTransferItem(item: DataTransferItem): ClassCompatDataTransferItem {
  return new ClassCompatDataTransferItem(item);
}

export function WebPlatform_DOM_Class_AttributeObserver({ options = { attributeOldValue: true, subtree: true }, source = document.documentElement }: { options?: { attributeFilter?: string[]; attributeOldValue?: boolean; subtree?: boolean }; source?: Node }): ClassDomAttributeObserver {
  return new ClassDomAttributeObserver({ options, source });
}

export function WebPlatform_DOM_Class_CharacterDataObserver({ options = { characterDataOldValue: true, subtree: true }, source = document.documentElement }: { options?: { characterDataOldValue?: boolean; subtree?: boolean }; source?: Node }): ClassDomCharacterDataObserver {
  return new ClassDomCharacterDataObserver({ options, source });
}

export function WebPlatform_DOM_Class_ChildListObserver({ options = { subtree: true }, source = document.documentElement }: { options?: { subtree?: boolean }; source?: Node }): ClassDomChildListObserver {
  return new ClassDomChildListObserver({ options, source });
}

export function WebPlatform_DOM_Class_ElementAddedObserver({ includeExistingElements = true, options = { subtree: true }, selector, source = document.documentElement }: { includeExistingElements?: boolean; options?: { subtree?: boolean }; selector: string; source?: Node }): ClassDomElementAddedObserver {
  return new ClassDomElementAddedObserver({ includeExistingElements, options, selector, source });
}

export function WebPlatform_DOM_InjectCSS(styles: string): CSSStyleSheet {
  const stylesheet = new CSSStyleSheet();
  stylesheet.replaceSync(styles);
  document.adoptedStyleSheets.push(stylesheet);
  return stylesheet;
}

export function WebPlatform_DOM_InjectScript(code: string): HTMLScriptElement {
  const script = document.createElement('script');
  script.textContent = code;
  document.body.appendChild(script);
  return script;
}

export function WebPlatform_File_ClassCompat_File(file: File): ClassCompatFile {
  return new ClassCompatFile(file);
}

export function WebPlatform_FileSystemEntry_Async_GetFile(entry: FileSystemFileEntry): Promise<File> {
  return new Promise<File>((resolve, reject) => {
    entry.file(
      (file) => {
        resolve(file);
      },
      (error) => {
        reject(error);
      },
    );
  });
}

export async function WebPlatform_FileSystemEntry_Async_ReadDirectoryEntries(entry: FileSystemDirectoryEntry): Promise<FileSystemEntry[]> {
  const reader = entry.createReader();
  const allentries: FileSystemEntry[] = [];
  let done = false;
  while (done === false) {
    const entries = await new Promise<FileSystemEntry[]>((resolve, reject) => {
      reader.readEntries(
        (entries) => {
          resolve(entries);
        },
        (error) => {
          reject(error);
        },
      );
    });
    if (entries.length === 0) {
      break;
    }
    allentries.push(...entries);
  }
  return allentries;
}

export function WebPlatform_HTMLInputElement_WebkitDirectoryIsSupported(): boolean {
  return WebPlatform_Utility_DeviceIsMobile() ? false : true;
}

export function WebPlatform_Node_Class_NodeListReference(nodes?: NodeList | Node[] | null): ClassNodeListReference {
  return new ClassNodeListReference(nodes);
}

export function WebPlatform_Node_Class_NodeReference(node?: Node | null): ClassNodeReference {
  return new ClassNodeReference(node);
}

export function WebPlatform_Node_SelectElement(selector: string): ClassNodeReference {
  // API designed by NOOB (https://github.com/NOOB2868)
  return WebPlatform_Node_Class_NodeReference(document.querySelector(selector));
}

export function WebPlatform_Node_SelectElements(...selectors: string[]): ClassNodeListReference {
  return WebPlatform_Node_Class_NodeListReference(document.querySelectorAll(selectors.join(',')));
}

export function WebPlatform_Utility_DeviceIsMobile(): boolean {
  return /android|iphone|mobile/i.test(window.navigator.userAgent);
}

export function WebPlatform_Utility_Download(data: { blob?: Blob; bytes?: Uint8Array<ArrayBuffer>; json?: string; text?: string; url?: string }, filename: string): void {
  const dataurl = (() => {
    if (data.blob !== undefined) {
      return URL.createObjectURL(data.blob);
    }
    if (data.bytes !== undefined) {
      return URL.createObjectURL(new Blob([data.bytes], { type: 'application/octet-stream;charset=utf-8' }));
    }
    if (data.json !== undefined) {
      return URL.createObjectURL(new Blob([data.json], { type: 'application/json;charset=utf-8' }));
    }
    if (data.text !== undefined) {
      return URL.createObjectURL(new Blob([data.text], { type: 'text/plain;charset=utf-8' }));
    }
    if (data.url !== undefined) {
      return data.url;
    }
  })();
  if (dataurl !== undefined) {
    const anchor = document.createElement('a');
    anchor.setAttribute('download', filename);
    anchor.setAttribute('href', dataurl);
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  }
}

export function WebPlatform_Utility_OpenWindow(url: string, onLoad?: (proxy: Window, event: Event) => void, onUnload?: (proxy: Window, event: Event) => void): void {
  const proxy = window.open(url, '_blank');
  if (proxy) {
    if (onLoad) {
      proxy.addEventListener('load', (event: Event) => {
        onLoad(proxy, event);
      });
    }
    if (onUnload) {
      proxy.addEventListener('unload', (event: Event) => {
        onUnload(proxy, event);
      });
    }
  }
}
