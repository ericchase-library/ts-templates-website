export function WebPlatform_Utility_Shadow_QuerySelector_Chain(source: Document | DocumentFragment | Element | ParentNode | ShadowRoot | null | undefined, ...selectors: string[]): Document | DocumentFragment | Element | undefined {
  if (selectors.length > 0) {
    for (const selector of selectors) {
      if (source instanceof Document || source instanceof DocumentFragment || source instanceof ShadowRoot) {
        // check children
        const match = source.querySelector(selector);
        if (match !== null) {
          source = match;
          continue;
        }
      } else if (source instanceof Element) {
        // check shadow children
        if (source.shadowRoot !== null) {
          const match = source.shadowRoot.querySelector(selector);
          if (match !== null) {
            source = match;
            continue;
          }
        }
        // check children
        const match = source.querySelector(selector);
        if (match !== null) {
          source = match;
          continue;
        }
      }
      return undefined;
    }
    if (source instanceof Document || source instanceof DocumentFragment || source instanceof Element) {
      return source;
    }
  }
  return undefined;
}
