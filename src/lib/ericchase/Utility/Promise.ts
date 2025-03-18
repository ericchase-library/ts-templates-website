import { SyncAsync } from 'src/lib/ericchase/Utility/Types.js';

// Annotate a function call as purposely un-awaited.
export function Orphan(promise: SyncAsync<any>) {}
