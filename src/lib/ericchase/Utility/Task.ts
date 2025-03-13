import { SyncAsync } from 'src/lib/ericchase/Utility/Types.js';

export class LazyTask<ReturnType> {
  $result?: SyncAsync<ReturnType>;
  constructor(public $task: () => SyncAsync<ReturnType>) {}
  get result() {
    if (!this.$result) {
      this.$result = this.$task();
    }
    return this.$result;
  }
}
