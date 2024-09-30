import type { NodeHTMLParser } from '../../../src/lib/ericchase/Platform/Node/HTML Processor/ParseHTML.js';
import type { PathGroup } from '../../../src/lib/ericchase/Platform/Node/Path.js';
import type { SyncAsync } from '../../../src/lib/ericchase/Utility/Types.js';

export interface HTMLPreprocessor {
  preprocess(root: NodeHTMLParser.HTMLElement, html: string, path_group: PathGroup): SyncAsync<void>;
}
