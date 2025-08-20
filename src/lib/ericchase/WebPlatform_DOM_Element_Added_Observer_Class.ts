interface Config {
  /** @default true */
  include_existing_elements?: boolean;
  options?: {
    /** @default true */
    subtree?: boolean;
  };
  selector: string;
  /** @default document.documentElement */
  source?: Node;
}

class Class_WebPlatform_DOM_Element_Added_Observer_Class {
  constructor(config: Config) {
    config.options ??= {};
    this.mutationObserver = new MutationObserver((mutationRecords: MutationRecord[]) => {
      for (const record of mutationRecords) {
        if (record.target instanceof Element && record.target.matches(config.selector)) {
          this.send(record.target);
        }
        const treeWalker = document.createTreeWalker(record.target, NodeFilter.SHOW_ELEMENT);
        while (treeWalker.nextNode()) {
          if ((treeWalker.currentNode as Element).matches(config.selector)) {
            this.send(treeWalker.currentNode as Element);
          }
        }
      }
    });
    this.mutationObserver.observe(config.source ?? document.documentElement, {
      childList: true,
      subtree: config.options.subtree ?? true,
    });
    if ((config.include_existing_elements ?? true) === true) {
      const treeWalker = document.createTreeWalker(document, NodeFilter.SHOW_ELEMENT);
      while (treeWalker.nextNode()) {
        if ((treeWalker.currentNode as Element).matches(config.selector)) {
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

export function WebPlatform_DOM_Element_Added_Observer_Class(config: Config): Class_WebPlatform_DOM_Element_Added_Observer_Class {
  return new Class_WebPlatform_DOM_Element_Added_Observer_Class(config);
}
