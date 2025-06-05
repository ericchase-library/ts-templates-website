import { WebPlatform_DataTransferItem_ClassCompat_DataTransferItem } from './api.platform-web.js';

class ClassCompatBlob {
  constructor(public blob: Blob) {}
  get size(): number | undefined {
    return this.blob.size ?? undefined;
  }
  get type(): string | undefined {
    return this.blob.type ?? undefined;
  }
  async arrayBuffer(): Promise<ArrayBuffer | undefined> {
    return (await this.blob.arrayBuffer?.()) ?? undefined;
  }
  /** `bytes` is not available in most browsers */
  async bytes(): Promise<Uint8Array | undefined> {
    return (await this.blob.bytes?.()) ?? (await this.blob.arrayBuffer?.().then((buffer) => (buffer ? new Uint8Array(buffer) : undefined))) ?? undefined;
  }
  slice(): Blob | undefined {
    return this.blob.slice?.() ?? undefined;
  }
  stream(): ReadableStream<any> | undefined {
    return this.blob.stream?.() ?? undefined;
  }
  async text(): Promise<string | undefined> {
    return (await this.blob.text?.()) ?? undefined;
  }
}

class ClassCompatDataTransfer {
  constructor(public dataTransfer: DataTransfer) {}
  items(): ClassCompatDataTransferItem[] {
    const list: ClassCompatDataTransferItem[] = [];
    for (const item of this.dataTransfer.items) {
      list.push(WebPlatform_DataTransferItem_ClassCompat_DataTransferItem(item));
    }
    return list;
  }
}

class ClassCompatDataTransferItem {
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

class ClassCompatFile {
  constructor(public file: File) {}
  get relativePath(): string | undefined {
    // @ts-expect-error: `relativePath` does not exist.
    return this.file.relativePath ?? this.file.webkitRelativePath ?? undefined;
  }
}

class ClassDomAttributeObserver {
  constructor({
    source = document.documentElement,
    options = { attributeOldValue: true, subtree: true },
  }: {
    source?: Node;
    options?: {
      attributeFilter?: string[];
      attributeOldValue?: boolean;
      subtree?: boolean;
    };
  }) {
    this.mutationObserver = new MutationObserver((mutationRecords: MutationRecord[]) => {
      for (const record of mutationRecords) {
        this.send(record);
      }
    });
    this.mutationObserver.observe(source, {
      attributes: true,
      attributeFilter: options.attributeFilter,
      attributeOldValue: options.attributeOldValue ?? true,
      subtree: options.subtree ?? true,
    });
  }
  public subscribe(callback: (record: MutationRecord, unsubscribe: () => void) => void): () => void {
    this.subscriptionSet.add(callback);
    return () => {
      this.subscriptionSet.delete(callback);
    };
  }
  protected mutationObserver: MutationObserver;
  protected subscriptionSet = new Set<(record: MutationRecord, unsubscribe: () => void) => void>();
  private send(record: MutationRecord) {
    for (const callback of this.subscriptionSet) {
      callback(record, () => {
        this.subscriptionSet.delete(callback);
      });
    }
  }
}

class ClassDomCharacterDataObserver {
  constructor({ source = document.documentElement, options = { characterDataOldValue: true, subtree: true } }: { source?: Node; options?: { characterDataOldValue?: boolean; subtree?: boolean } }) {
    this.mutationObserver = new MutationObserver((mutationRecords: MutationRecord[]) => {
      for (const record of mutationRecords) {
        this.send(record);
      }
    });
    this.mutationObserver.observe(source, {
      characterData: true,
      characterDataOldValue: options.characterDataOldValue ?? true,
      subtree: options.subtree ?? true,
    });
  }
  public subscribe(callback: (record: MutationRecord, unsubscribe: () => void) => void): () => void {
    this.subscriptionSet.add(callback);
    return () => {
      this.subscriptionSet.delete(callback);
    };
  }
  protected mutationObserver: MutationObserver;
  protected subscriptionSet = new Set<(record: MutationRecord, unsubscribe: () => void) => void>();
  private send(record: MutationRecord) {
    for (const callback of this.subscriptionSet) {
      callback(record, () => {
        this.subscriptionSet.delete(callback);
      });
    }
  }
}

class ClassDomChildListObserver {
  constructor({ source = document.documentElement, options = { subtree: true } }: { source?: Node; options?: { subtree?: boolean } }) {
    this.mutationObserver = new MutationObserver((mutationRecords: MutationRecord[]) => {
      for (const record of mutationRecords) {
        this.send(record);
      }
    });
    this.mutationObserver.observe(source, {
      childList: true,
      subtree: options.subtree ?? true,
    });
  }
  public subscribe(callback: (record: MutationRecord, unsubscribe: () => void) => void): () => void {
    this.subscriptionSet.add(callback);
    return () => {
      this.subscriptionSet.delete(callback);
    };
  }
  protected mutationObserver: MutationObserver;
  protected subscriptionSet = new Set<(record: MutationRecord, unsubscribe: () => void) => void>();
  private send(record: MutationRecord) {
    for (const callback of this.subscriptionSet) {
      callback(record, () => {
        this.subscriptionSet.delete(callback);
      });
    }
  }
}

class ClassDomElementAddedObserver {
  constructor({ source = document.documentElement, options = { subtree: true }, selector, includeExistingElements = true }: { source?: Node; options?: { subtree?: boolean }; selector: string; includeExistingElements?: boolean }) {
    this.mutationObserver = new MutationObserver((mutationRecords: MutationRecord[]) => {
      for (const record of mutationRecords) {
        if (record.target instanceof Element && record.target.matches(selector)) {
          this.send(record.target);
        }
        const treeWalker = document.createTreeWalker(record.target, NodeFilter.SHOW_ELEMENT);
        while (treeWalker.nextNode()) {
          if ((treeWalker.currentNode as Element).matches(selector)) {
            this.send(treeWalker.currentNode as Element);
          }
        }
      }
    });
    this.mutationObserver.observe(source, {
      childList: true,
      subtree: options.subtree ?? true,
    });
    if (includeExistingElements === true) {
      const treeWalker = document.createTreeWalker(document, NodeFilter.SHOW_ELEMENT);
      while (treeWalker.nextNode()) {
        if ((treeWalker.currentNode as Element).matches(selector)) {
          this.send(treeWalker.currentNode as Element);
        }
      }
    }
  }
  public disconnect() {
    this.mutationObserver.disconnect();
    for (const callback of this.subscriptionSet) {
      this.subscriptionSet.delete(callback);
    }
  }
  public subscribe(callback: (element: Element, unsubscribe: () => void) => void): () => void {
    this.subscriptionSet.add(callback);
    let abort = false;
    for (const element of this.matchSet) {
      callback(element, () => {
        this.subscriptionSet.delete(callback);
        abort = true;
      });
      if (abort) return () => {};
    }
    return () => {
      this.subscriptionSet.delete(callback);
    };
  }
  protected mutationObserver: MutationObserver;
  protected matchSet = new Set<Element>();
  protected subscriptionSet = new Set<(element: Element, unsubscribe: () => void) => void>();
  private send(element: Element) {
    if (!this.matchSet.has(element)) {
      this.matchSet.add(element);
      for (const callback of this.subscriptionSet) {
        callback(element, () => {
          this.subscriptionSet.delete(callback);
        });
      }
    }
  }
}

class ClassNodeReference {
  node: Node;
  constructor(node?: Node | null) {
    if (node === null) {
      throw new ReferenceError('Reference is null.');
    }
    if (node === undefined) {
      throw new ReferenceError('Reference is undefined.');
    }
    this.node = node;
  }
  as<T extends abstract new (...args: any) => any>(constructor_ref: T): InstanceType<T> {
    if (this.node instanceof constructor_ref) return this.node as InstanceType<T>;
    throw new TypeError(`Reference node is not ${constructor_ref}`);
  }
  is<T extends abstract new (...args: any) => any>(constructor_ref: T): boolean {
    return this.node instanceof constructor_ref;
  }
  passAs<T extends abstract new (...args: any) => any>(constructor_ref: T, fn: (reference: InstanceType<T>) => void): void {
    if (this.node instanceof constructor_ref) {
      fn(this.node as InstanceType<T>);
    }
  }
  tryAs<T extends abstract new (...args: any) => any>(constructor_ref: T): InstanceType<T> | undefined {
    if (this.node instanceof constructor_ref) {
      return this.node as InstanceType<T>;
    }
  }
  get classList() {
    return this.as(HTMLElement).classList;
  }
  get className() {
    return this.as(HTMLElement).className;
  }
  get style() {
    return this.as(HTMLElement).style;
  }
  getAttribute(qualifiedName: string): string | null {
    return this.as(HTMLElement).getAttribute(qualifiedName);
  }
  setAttribute(qualifiedName: string, value: string): void {
    this.as(HTMLElement).setAttribute(qualifiedName, value);
  }
  getStyleProperty(property: string): string {
    return this.as(HTMLElement).style.getPropertyValue(property);
  }
  setStyleProperty(property: string, value: string | null, priority?: string): void {
    this.as(HTMLElement).style.setProperty(property, value, priority);
  }
}

class ClassNodeListReference extends Array<ClassNodeReference> {
  constructor(nodes?: NodeList | Node[] | null) {
    if (nodes === null) {
      throw new ReferenceError('Reference list is null.');
    }
    if (nodes === undefined) {
      throw new ReferenceError('Reference list is undefined.');
    }
    super();
    for (const node of Array.from(nodes)) {
      try {
        this.push(new ClassNodeReference(node));
      } catch (_) {}
    }
  }
  as<T extends abstract new (...args: any) => any>(constructor_ref: T): Array<InstanceType<T>> {
    return this.filter((ref) => ref.is(constructor_ref)).map((ref) => ref.as(constructor_ref));
  }
  passEachAs<T extends abstract new (...args: any) => any>(constructor_ref: T, fn: (reference: InstanceType<T>) => void): void {
    for (const ref of this) {
      ref.passAs(constructor_ref, fn);
    }
  }
}

export {
  //
  ClassCompatBlob,
  ClassCompatDataTransfer,
  ClassCompatDataTransferItem,
  ClassCompatFile,
  ClassDomAttributeObserver,
  ClassDomCharacterDataObserver,
  ClassDomChildListObserver,
  ClassDomElementAddedObserver,
  ClassNodeListReference,
  ClassNodeReference,
};
