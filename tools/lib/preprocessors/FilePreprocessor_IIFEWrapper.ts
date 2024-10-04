import type { Path, PathGroup } from '../../../src/lib/ericchase/Platform/Node/Path.js';
import { DecodeBytes, EncodeText } from '../../../src/lib/ericchase/Utility/TextCodec.js';
import type { FilePreprocessor } from './FilePreprocessor.js';

export class IIFEWrapperPreprocessor implements FilePreprocessor {
  path_endings: string[];
  constructor(path_endings: string[]) {
    this.path_endings = path_endings;
  }
  pathMatches(path: Path | PathGroup) {
    for (const ending of this.path_endings) {
      if (path.path.endsWith(ending)) {
        return true;
      }
    }
    return false;
  }
  preprocess(bytes: Uint8Array) {
    return { bytes: EncodeText(`(() => {\n${DecodeBytes(bytes)}})();`) };
  }
}
