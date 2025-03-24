import { SyncAsync } from './Types.js';

// Annotate a function call as purposely un-awaited.
export function Orphan(promise: SyncAsync<any>) {}
