import { Core_Promise_Orphan } from './Core_Promise_Orphan.js';

export function Core_Promise_Call_And_Orphan(asyncfn: () => Promise<any> | any): void {
  /** Annotate a function call as purposely un-awaited. */
  Core_Promise_Orphan(asyncfn());
}
