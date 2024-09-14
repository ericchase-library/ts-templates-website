import { PathGroup } from '../../src/lib/ericchase/Platform/Bun/Path.js';
import type { NodeHTMLParser } from '../../src/lib/ericchase/Platform/Web/HTML/ParseHTML.js';
import type { HTMLPreprocessor } from './build.js';

export class ImportConverterPreprocessor implements HTMLPreprocessor {
  extensionPairs: [string, string][];
  constructor(...extensionPairs: [string, string][]) {
    this.extensionPairs = extensionPairs;
  }
  get preprocess() {
    return async (root: NodeHTMLParser.HTMLElement) => {
      for (const [from, to] of this.extensionPairs) {
        const scriptTags = root.querySelectorAll('script');
        for (const element of scriptTags) {
          const src = element.getAttribute('src');
          if (src) {
            try {
              const url = new URL(src);
              const pathGroup = PathGroup.new({ path: url.pathname });
              if (pathGroup.ext === pathGroup.replaceExt(from).ext) {
                element.setAttribute('src', src.slice(0, src.lastIndexOf(from)) + to);
              }
            } catch (_) {
              const pathGroup = PathGroup.new({ path: src });
              if (pathGroup.ext === pathGroup.replaceExt(from).ext) {
                element.setAttribute('src', src.slice(0, src.lastIndexOf(from)) + to);
              }
            }
          }
        }
      }
    };
  }
}
