import type { SyncAsync } from '../../../src/lib/ericchase/Utility/Types.js';

export interface FilePreprocessor {
  pathMatches(path: string): boolean;
  preprocess(content: string): SyncAsync<{ content: string }>;
}
