import { CPlatformProvider, getPlatformProvider, PlatformProviderId, UnimplementedProvider } from 'src/lib/ericchase/Platform/PlatformProvider.js';
import { BuilderInternal, BuildStep } from 'tools/lib/BuilderInternal.js';
import { Cache_FileStats_Lock, Cache_FileStats_Unlock } from 'tools/lib/cache/FileStatsCache.js';
import { Cache_TryLockEach, Cache_UnlockAll } from 'tools/lib/cache/LockCache.js';
import { ProcessorModule } from 'tools/lib/Processor.js';

export class Builder {
  $internal = new BuilderInternal(this);

  constructor(mode: 'build' | 'watch' = 'build') {
    if (mode === 'watch') {
      this.$internal.watchmode = true;
    }
  }

  dir = this.$internal.dir;

  set platform(value: CPlatformProvider) {
    this.$internal.platform = value;
  }
  get platform() {
    return this.$internal.platform;
  }

  set runtime(value: PlatformProviderId) {
    this.$internal.runtime = value;
  }
  get runtime() {
    return this.$internal.runtime;
  }

  forceProcessFile() {}

  setStartupSteps(steps: BuildStep[]): void {
    this.$internal.startup_steps = steps;
  }
  setProcessorModules(modules: ProcessorModule[]): void {
    this.$internal.processor_modules = modules;
  }
  setCleanupSteps(steps: BuildStep[]): void {
    this.$internal.cleanup_steps = steps;
  }

  async start(): Promise<void> {
    Cache_FileStats_Lock();
    Cache_TryLockEach(['Build', 'Format']);
    if (this.platform === UnimplementedProvider) {
      this.platform = await getPlatformProvider(this.runtime);
    }
    await this.$internal.start();
    Cache_UnlockAll();
    Cache_FileStats_Unlock();
  }
}
