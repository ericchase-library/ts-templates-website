import type { Path, PathGroup } from '../../../src/lib/ericchase/Platform/Node/Path.js';
import type { SyncAsync } from '../../../src/lib/ericchase/Utility/Types.js';

export interface FilePreprocessor {
  pathMatches(path: Path | PathGroup): boolean;
  preprocess(content: string): SyncAsync<{ content: string }>;
}
