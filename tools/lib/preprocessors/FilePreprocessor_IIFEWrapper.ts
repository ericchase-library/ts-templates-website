import type { FilePreprocessor } from './FilePreprocessor.js';

export class IIFEWrapperPreprocessor implements FilePreprocessor {
  path_endings: string[];
  constructor(path_endings: string[]) {
    this.path_endings = path_endings;
  }
  pathMatches(path: string) {
    for (const ending of this.path_endings) {
      if (path.endsWith(ending)) {
        return true;
      }
    }
    return false;
  }
  preprocess(content: string) {
    return { content: `(function () {\n${content}})();` };
  }
}
