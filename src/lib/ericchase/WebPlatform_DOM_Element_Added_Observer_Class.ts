class Class_WebPlatform_DOM_Element_Added_Observer_Class {
  config: {
    include_existing_elements: boolean;
    options: {
      subtree: boolean;
    };
    selector: string;
    source: Node;
  };

  $match_set = new Set<Element>();
  $mutation_observer: MutationObserver;
  $subscription_set = new Set<(element: Element, unsubscribe: () => void) => void>();

  constructor(config: Config) {
    this.config = {
      include_existing_elements: config.include_existing_elements ?? true,
      options: {
        subtree: config.options?.subtree ?? true,
      },
      selector: config.selector,
      source: config.source ?? document.documentElement,
    };
    this.$mutation_observer = new MutationObserver((mutationRecords: MutationRecord[]) => {
      const sent_set = new Set<Node>();
      for (const record of mutationRecords) {
        for (const node of record.addedNodes) {
          const tree_walker = document.createTreeWalker(node, NodeFilter.SHOW_ELEMENT);
          const processCurrentNode = () => {
            if (sent_set.has(tree_walker.currentNode) === false) {
              if (tree_walker.currentNode instanceof Element && tree_walker.currentNode.matches(this.config.selector) === true) {
                this.$send(tree_walker.currentNode as Element);
                sent_set.add(tree_walker.currentNode);
              }
            }
          };
          processCurrentNode();
          if (this.config.options.subtree === true) {
            while (tree_walker.nextNode()) {
              processCurrentNode();
            }
          }
        }
      }
    });
    this.$mutation_observer.observe(this.config.source, {
      childList: true,
      subtree: this.config.options.subtree,
    });
    if (this.config.include_existing_elements === true) {
      const sent_set = new Set<Node>();
      const tree_walker = document.createTreeWalker(this.config.source, NodeFilter.SHOW_ELEMENT);
      const processCurrentNode = () => {
        if (sent_set.has(tree_walker.currentNode) === false) {
          if (tree_walker.currentNode instanceof Element && tree_walker.currentNode.matches(this.config.selector) === true) {
            this.$send(tree_walker.currentNode as Element);
            sent_set.add(tree_walker.currentNode);
          }
        }
      };
      processCurrentNode();
      if (this.config.options.subtree === true) {
        while (tree_walker.nextNode()) {
          processCurrentNode();
        }
      }
    }
  }
  disconnect() {
    this.$mutation_observer.disconnect();
    for (const callback of this.$subscription_set) {
      this.$subscription_set.delete(callback);
    }
  }
  subscribe(callback: (element: Element, unsubscribe: () => void) => void): () => void {
    this.$subscription_set.add(callback);
    let abort = false;
    for (const element of this.$match_set) {
      callback(element, () => {
        this.$subscription_set.delete(callback);
        abort = true;
      });
      if (abort) {
        return () => {};
      }
    }
    return () => {
      this.$subscription_set.delete(callback);
    };
  }

  $send(element: Element) {
    this.$match_set.add(element);
    for (const callback of this.$subscription_set) {
      callback(element, () => {
        this.$subscription_set.delete(callback);
      });
    }
  }
}

export function WebPlatform_DOM_Element_Added_Observer_Class(config: Config): Class_WebPlatform_DOM_Element_Added_Observer_Class {
  return new Class_WebPlatform_DOM_Element_Added_Observer_Class(config);
}

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
