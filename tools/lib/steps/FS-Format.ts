import { U8StreamReadAll } from 'src/lib/ericchase/Algorithm/Stream.js';
import { U8ToString } from 'src/lib/ericchase/Algorithm/Uint8Array.js';
import { ConsoleErrorNotEmpty, ConsoleLog, ConsoleLogNotEmpty, ConsoleLogWithDate } from 'src/lib/ericchase/Utility/Console.js';
import { BuilderInternal, BuildStep } from 'tools/lib/BuilderInternal.js';

export function Step_Format(logging?: 'quiet'): BuildStep {
  return new CStep_Format(logging ?? 'normal');
}

class CStep_Format implements BuildStep {
  constructor(readonly logging: 'normal' | 'quiet') {}
  async run(builder: BuilderInternal) {
    ConsoleLogWithDate(this.constructor.name);
    const p0 = Bun.spawn(['biome', 'format', '--files-ignore-unknown', 'true', '--verbose', '--write'], { stderr: 'pipe', stdout: 'pipe' });
    const p1 = Bun.spawn(['prettier', '.', '--write'], { stderr: 'pipe', stdout: 'pipe' });
    await Promise.allSettled([p0.exited, p1.exited]);
    if (this.logging === 'normal') {
      ConsoleLog('> BIOME');
      ConsoleLogNotEmpty(U8ToString(await U8StreamReadAll(p0.stdout)));
      ConsoleErrorNotEmpty(U8ToString(await U8StreamReadAll(p0.stderr)));
      ConsoleLog('> PRETTIER');
      ConsoleLogNotEmpty(U8ToString(await U8StreamReadAll(p1.stdout)));
      ConsoleErrorNotEmpty(U8ToString(await U8StreamReadAll(p1.stderr)));
    }
  }
}
