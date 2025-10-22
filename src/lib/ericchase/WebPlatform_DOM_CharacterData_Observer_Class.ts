export class Class_WebPlatform_DOM_CharacterData_Observer_Class {
  $mutation_observer: MutationObserver;
  $subscription_set = new Set<(record: MutationRecord, unsubscribe: () => void) => void>();

  constructor(config: Config) {
    config.options ??= {};
    this.$mutation_observer = new MutationObserver((mutationRecords: MutationRecord[]) => {
      for (const record of mutationRecords) {
        this.$send(record);
      }
    });
    this.$mutation_observer.observe(config.source ?? document.documentElement, {
      characterData: true,
      characterDataOldValue: config.options.characterDataOldValue ?? true,
      subtree: config.options.subtree ?? true,
    });
  }
  disconnect() {
    this.$mutation_observer.disconnect();
    for (const callback of this.$subscription_set) {
      this.$subscription_set.delete(callback);
    }
  }
  subscribe(callback: (record: MutationRecord, unsubscribe: () => void) => void): () => void {
    this.$subscription_set.add(callback);
    return () => {
      this.$subscription_set.delete(callback);
    };
  }

  $send(record: MutationRecord) {
    for (const callback of this.$subscription_set) {
      callback(record, () => {
        this.$subscription_set.delete(callback);
      });
    }
  }
}

export function WebPlatform_DOM_CharacterData_Observer_Class(config: Config): Class_WebPlatform_DOM_CharacterData_Observer_Class {
  return new Class_WebPlatform_DOM_CharacterData_Observer_Class(config);
}

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
