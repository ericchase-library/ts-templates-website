import { U8StreamReadAll } from 'src/lib/ericchase/Algorithm/Stream.js';
import { U8ToString } from 'src/lib/ericchase/Algorithm/Uint8Array.js';
import { ConsoleErrorNotEmpty, ConsoleLog, ConsoleLogNotEmpty } from 'src/lib/ericchase/Utility/Console.js';
import { BuilderInternal, BuildStep } from 'tools/lib/BuilderInternal.js';

class CBuildStep_FSFormat implements BuildStep {
  constructor(readonly mode: 'normal' | 'quiet') {}
  async run(builder: BuilderInternal) {
    const p0 = Bun.spawn(['biome', 'format', '--files-ignore-unknown', 'true', '--verbose', '--write'], { stderr: 'pipe', stdout: 'pipe' });
    const p1 = Bun.spawn(['prettier', '**/*.{html,md,yaml}', '--write'], { stderr: 'pipe', stdout: 'pipe' });
    await Promise.allSettled([p0.exited, p1.exited]);
    if (this.mode === 'normal') {
      ConsoleLog('> BIOME');
      ConsoleLogNotEmpty(U8ToString(await U8StreamReadAll(p0.stdout)));
      ConsoleErrorNotEmpty(U8ToString(await U8StreamReadAll(p0.stderr)));
      ConsoleLog('> PRETTIER');
      ConsoleLogNotEmpty(U8ToString(await U8StreamReadAll(p1.stdout)));
      ConsoleErrorNotEmpty(U8ToString(await U8StreamReadAll(p1.stderr)));
    }
  }
}

export function BuildStep_FSFormat(mode?: 'quiet'): BuildStep {
  return new CBuildStep_FSFormat(mode ?? 'normal');
}
