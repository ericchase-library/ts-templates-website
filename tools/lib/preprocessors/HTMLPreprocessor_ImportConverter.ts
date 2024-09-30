import type { NodeHTMLParser } from '../../../src/lib/ericchase/Platform/Node/HTML Processor/ParseHTML.js';
import { Path } from '../../../src/lib/ericchase/Platform/Node/Path.js';
import type { HTMLPreprocessor } from './HTMLPreprocessor.js';

export class ImportConverterPreprocessor implements HTMLPreprocessor {
  extension_pairs: (readonly [string, string])[];
  constructor(...extension_pairs: (readonly [string, string])[]) {
    this.extension_pairs = extension_pairs;
  }
  preprocess(root: NodeHTMLParser.HTMLElement) {
    for (const [from, to] of this.extension_pairs) {
      const scriptTags = root.querySelectorAll('script');
      for (const element of scriptTags) {
        const src = element.getAttribute('src');
        if (src) {
          try {
            const url = new URL(src);
            const path = new Path(url.pathname);
            if (path.base.endsWith(from)) {
              element.setAttribute('src', src.slice(0, src.lastIndexOf(from)) + to);
            }
          } catch (_) {
            const path = new Path(src);
            if (path.base.endsWith(from)) {
              element.setAttribute('src', src.slice(0, src.lastIndexOf(from)) + to);
            }
          }
        }
      }
    }
  }
}
