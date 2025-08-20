interface Config {
  options?: {
    /** @default true */
    characterDataOldValue?: boolean;
    /** @default true */
    subtree?: boolean;
  };
  /** @default document.documentElement */
  source?: Node;
}

export class Class_WebPlatform_DOM_CharacterData_Observer_Class {
  constructor(config: Config) {
    config.options ??= {};
    this.mutationObserver = new MutationObserver((mutationRecords: MutationRecord[]) => {
      for (const record of mutationRecords) {
        this.send(record);
      }
    });
    this.mutationObserver.observe(config.source ?? document.documentElement, {
      characterData: true,
      characterDataOldValue: config.options.characterDataOldValue ?? true,
      subtree: config.options.subtree ?? true,
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

export function WebPlatform_DOM_CharacterData_Observer_Class(config: Config): Class_WebPlatform_DOM_CharacterData_Observer_Class {
  return new Class_WebPlatform_DOM_CharacterData_Observer_Class(config);
}
