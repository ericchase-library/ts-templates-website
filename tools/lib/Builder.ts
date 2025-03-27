import { RefCounter } from '../../src/lib/ericchase/DesignPattern/Observer/RefCounter.js';
import { CPath, Path } from '../../src/lib/ericchase/Platform/FilePath.js';
import { CPlatformProvider, FileStats, getPlatformProvider, PlatformProviderId, UnimplementedProvider } from '../../src/lib/ericchase/Platform/PlatformProvider.js';
import { KEYS } from '../../src/lib/ericchase/Platform/Shell.js';
import { AddStdInListener, GetStdInReaderLock, StartStdInRawModeReader } from '../../src/lib/ericchase/Platform/StdinReader.js';
import { ConsoleError } from '../../src/lib/ericchase/Utility/Console.js';
import { Debounce } from '../../src/lib/ericchase/Utility/Debounce.js';
import { Defer } from '../../src/lib/ericchase/Utility/Defer.js';
import { AddLoggerOutputDirectory, Logger } from '../../src/lib/ericchase/Utility/Logger.js';
import { Map_GetOrDefault } from '../../src/lib/ericchase/Utility/Map.js';
import { Orphan } from '../../src/lib/ericchase/Utility/Promise.js';
import { Cache_FileStats_Lock, Cache_FileStats_Unlock } from './cache/FileStatsCache.js';
import { Cache_TryLockEach, Cache_UnlockAll } from './cache/LockCache.js';

const default_platform = await getPlatformProvider('bun');
AddLoggerOutputDirectory(Path('./cache'), default_platform);
const logger = Logger('Builder');

export type ProcessorMethod = (builder: BuilderInternal, file: ProjectFile) => Promise<void>;

export interface ProcessorModule {
  onAdd: (builder: BuilderInternal, files: Set<ProjectFile>) => Promise<void>;
  onRemove: (builder: BuilderInternal, files: Set<ProjectFile>) => Promise<void>;
}

export interface Step {
  end: (builder: BuilderInternal) => Promise<void>;
  run: (builder: BuilderInternal) => Promise<void>;
}

export class Builder {
  $internal = new BuilderInternal(this);

  constructor(mode: 'build' | 'watch' = 'build') {
    if (mode === 'watch') {
      this.$internal.watchmode = true;
    }
  }

  dir = this.$internal.dir;
  watchmode = this.$internal.watchmode;

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

  setStartupSteps(...steps: Step[]): void {
    this.$internal.startup_steps = steps;
  }
  setBeforeProcessingSteps(...steps: Step[]): void {
    this.$internal.before_steps = steps;
  }
  setProcessorModules(...modules: ProcessorModule[]): void {
    this.$internal.processor_modules = modules;
  }
  setAfterProcessingSteps(...steps: Step[]): void {
    this.$internal.after_steps = steps;
  }
  setCleanupSteps(...steps: Step[]): void {
    this.$internal.cleanup_steps = steps;
  }

  async start(): Promise<void> {
    if (this.platform === UnimplementedProvider) {
      this.platform = await getPlatformProvider(this.runtime);
    }
    await this.$internal.start();
  }
}

export class BuilderInternal {
  channel = logger.newChannel();

  constructor(public external: Builder) {}

  platform = default_platform;
  runtime: PlatformProviderId = 'bun';
  watchmode = false;

  // Directories

  dir = {
    lib: Path('src/lib'),
    out: Path('out'),
    src: Path('src'),
    tools: Path('tools'),
  };

  // Build Steps & Processor Modules

  startup_steps: Step[] = [];
  before_steps: Step[] = [];
  processor_modules: ProcessorModule[] = [];
  after_steps: Step[] = [];
  cleanup_steps: Step[] = [];

  // Dependencies

  $map_downstream_to_upstream = new Map<ProjectFile, Set<ProjectFile>>();
  $map_upstream_to_downstream = new Map<ProjectFile, Set<ProjectFile>>();

  addDependency(upstream: ProjectFile, downstream: ProjectFile) {
    if (this.$map_downstream_to_upstream.get(upstream)?.has(downstream)) {
      throw new Error(`dependency cycle between upstream "${upstream.src_path.raw}" and downstream "${downstream.src_path.raw}"`);
    }
    Map_GetOrDefault(this.$map_downstream_to_upstream, downstream, () => new Set<ProjectFile>()).add(upstream);
    Map_GetOrDefault(this.$map_upstream_to_downstream, upstream, () => new Set<ProjectFile>()).add(downstream);
  }
  removeDependency(upstream: ProjectFile, downstream: ProjectFile) {
    Map_GetOrDefault(this.$map_downstream_to_upstream, downstream, () => new Set<ProjectFile>()).delete(upstream);
    Map_GetOrDefault(this.$map_upstream_to_downstream, upstream, () => new Set<ProjectFile>()).delete(downstream);
  }
  getDownstream(file: ProjectFile): Set<ProjectFile> {
    return this.$map_upstream_to_downstream.get(file) ?? new Set();
  }
  getUpstream(file: ProjectFile): Set<ProjectFile> {
    return this.$map_downstream_to_upstream.get(file) ?? new Set();
  }

  // Files & Paths

  $set_files = new Set<ProjectFile>();
  // raw src paths
  $set_paths = new Set<string>();
  // raw src paths to project files
  $map_path_to_file = new Map<string, ProjectFile>();

  get files(): Set<ProjectFile> {
    return new Set(this.$set_files);
  }
  get paths(): Set<string> {
    return new Set(this.$set_paths);
  }
  hasFile(project_file: ProjectFile): boolean {
    // @debug-start
    const stored_file = this.$map_path_to_file.get(project_file.src_path.raw);
    if (stored_file !== undefined && stored_file !== project_file) {
      throw new Error(`file "${project_file.src_path.raw}" different from stored file "${stored_file.src_path.raw}"`);
    }
    // @debug-end
    return this.$map_path_to_file.has(project_file.src_path.raw);
  }
  hasPath(src_path: CPath): boolean {
    return this.$map_path_to_file.has(src_path.raw);
  }
  getFile(src_path: CPath): ProjectFile {
    const project_file = this.$map_path_to_file.get(src_path.raw);
    if (project_file === undefined) {
      throw new Error(`file "${src_path.raw}" does not exist`);
    }
    return project_file;
  }

  addPath(src_path: CPath, out_path: CPath) {
    // @debug-start
    if (this.$map_path_to_file.has(src_path.raw)) {
      throw new Error(`file "${src_path.raw}" already added`);
    }
    // @debug-end
    const file = new ProjectFile(this, src_path, out_path);
    this.$map_path_to_file.set(src_path.raw, file);
    this.$set_files.add(file);
    this.$set_paths.add(src_path.raw);
    this.$set_unprocessed_added_files.add(file);
    return file;
  }
  removePath(src_path: CPath) {
    // @debug-start
    if (this.$map_path_to_file.has(src_path.raw) === false) {
      throw new Error(`file "${src_path.raw}" already removed`);
    }
    // @debug-end
    const file = this.getFile(src_path);
    this.$map_path_to_file.delete(src_path.raw);
    this.$set_files.delete(file);
    this.$set_paths.delete(src_path.raw);
    this.$set_unprocessed_removed_files.add(file);
    for (const upstream of this.$map_downstream_to_upstream.get(file) ?? []) {
      this.removeDependency(upstream, file);
    }
    for (const downstream of this.$map_upstream_to_downstream.get(file) ?? []) {
      this.removeDependency(file, downstream);
    }
    this.$map_downstream_to_upstream.delete(file);
    this.$map_upstream_to_downstream.delete(file);
    return file;
  }
  updatePath(src_path: CPath) {
    const file = this.getFile(src_path);
    this.$set_unprocessed_updated_files.add(file);
    return file;
  }

  reprocessFile(file: ProjectFile) {
    this.$set_unprocessed_added_files.add(file); // trigger a first run
    this.$set_unprocessed_updated_files.add(file);
  }

  // Source Watcher

  $unwatchSource?: () => void;
  async getStats(path: CPath | string): Promise<FileStats | undefined> {
    try {
      return await this.platform.Path.getStats(Path(path));
    } catch (error) {
      return undefined;
    }
  }
  setupSourceWatcher() {
    if (this.$unwatchSource === undefined) {
      const event_paths = new Set<string>();
      const process_events = Debounce(async () => {
        const unlock = this.$idle.lock();

        // copy the set and clear it
        const event_paths_copy = new Set(event_paths);
        event_paths.clear();

        for (const path of event_paths_copy) {
          const src_path = Path(this.dir.src, path);
          const stats = await this.getStats(src_path);
          if (stats?.isFile() === true) {
            if (this.hasPath(src_path)) {
              this.updatePath(src_path);
            } else {
              this.addPath(src_path, Path(this.dir.out, path));
            }
          }
        }

        const scan_paths = new Set(await Array.fromAsync(this.platform.Directory.globScan(Path('./'), `${this.dir.src.standard}/**/*`)));
        const this_paths = new Set(Array.from(this.$map_path_to_file.keys()).map((str) => Path(str).raw));
        for (const path of scan_paths.difference(this_paths)) {
          this.addPath(Path(path), Path(this.dir.out, Path(path).slice(1)));
        }
        for (const path of this_paths.difference(scan_paths)) {
          this.removePath(Path(path));
        }

        // process files
        await this.processUnprocessedFiles();

        unlock();
      }, 100);
      this.$unwatchSource = this.platform.Directory.watch(this.dir.src, (event, path) => {
        event_paths.add(path.raw);
        Orphan(process_events());
      });
      this.channel.log(`Watching "${this.dir.src.raw}"`);
    }
  }

  // Processing

  $idle = new RefCounter();

  $set_unprocessed_added_files = new Set<ProjectFile>();
  $set_unprocessed_removed_files = new Set<ProjectFile>();
  $set_unprocessed_updated_files = new Set<ProjectFile>();

  async start() {
    // Grab Locks
    Cache_FileStats_Lock();
    Cache_TryLockEach(['Build', 'Format']);

    try {
      const unlock = this.$idle.lock();

      for await (const path of this.platform.Directory.globScan(this.dir.src, '**/*')) {
        this.addPath(Path(this.dir.src, path), Path(this.dir.out, path));
      }

      if (this.watchmode === true) {
        // Setup Source Watcher
        this.setupSourceWatcher();
        // Setup Stdin Reader
        const releaseStdIn = GetStdInReaderLock();
        AddStdInListener(async (bytes, text, removeSelf) => {
          if (text === 'q') {
            removeSelf();
            this.channel.log('User Command: Quit');
            await this.$idle.onZeroLocks();
            this.$unwatchSource?.();
            await this.shutdown();
            // Release Locks
            Cache_UnlockAll();
            Cache_FileStats_Unlock();
            releaseStdIn();
          }
        });
        AddStdInListener(async (bytes, text, removeSelf) => {
          if (text === KEYS.SIGINT) {
            try {
              removeSelf();
              this.channel.log('User Command: Force Quit');
              this.$unwatchSource?.();
              releaseStdIn();
            } catch (error) {
              ConsoleError(error);
            }
            process.exit();
          }
        });
        StartStdInRawModeReader();
      }

      // Startup Steps
      for (const step of this.startup_steps) {
        await step.run(this);
      }

      // Processor Modules
      await this.processUnprocessedFiles();

      if (this.watchmode !== true) {
        await this.shutdown();
        // Release Locks
        Cache_UnlockAll();
        Cache_FileStats_Unlock();
      }

      unlock();
    } catch (error) {
      this.channel.error(error);
      // Release Locks
      Cache_UnlockAll();
      Cache_FileStats_Unlock();
    }
  }

  async shutdown() {
    for (const step of this.startup_steps) {
      await step.end(this);
    }
    for (const step of this.before_steps) {
      await step.end(this);
    }
    for (const step of this.after_steps) {
      await step.end(this);
    }
    // Cleanup Steps
    for (const step of this.cleanup_steps) {
      await step.run(this);
      await step.end(this);
    }
  }

  async processUnprocessedFiles() {
    if (this.processor_modules.length > 0) {
      if (this.$set_unprocessed_removed_files.size > 0) {
        await this.$processRemovedFiles();
      }
      if (this.$set_unprocessed_added_files.size > 0) {
        await this.$processAddedFiles();
      }
    }
    for (const step of this.before_steps) {
      await step.run(this);
    }
    if (this.processor_modules.length > 0) {
      if (this.$set_unprocessed_updated_files.size > 0) {
        await this.$processUpdatedFiles();
      }
    }
    for (const step of this.after_steps) {
      await step.run(this);
    }
  }

  // always call processUpdatedFiles after this
  async $processAddedFiles() {
    this.channel.log('Processing Added Files');
    for (const processor of this.processor_modules) {
      await processor.onAdd(this, this.$set_unprocessed_added_files);
    }
    const tasks: Promise<void>[] = [];
    for (const file of this.$set_unprocessed_added_files) {
      tasks.push(this.firstRunProcessorList(file));
    }
    await Promise.all(tasks);
    this.$set_unprocessed_added_files.clear();
  }

  // always call processUpdatedFiles after this
  async $processRemovedFiles() {
    for (const processor of this.processor_modules) {
      await processor.onRemove(this, this.$set_unprocessed_removed_files);
    }
    this.$set_unprocessed_removed_files.clear();
  }

  async $processUpdatedFiles() {
    this.channel.log('Processing Updated Files');
    const defers = new Map<ProjectFile, Defer<void>>();
    // add defers for updated file and all downstream files
    for (const file of this.$set_unprocessed_updated_files) {
      if (defers.has(file) === false) {
        defers.set(file, Defer());
      }
      for (const downstream of this.getDownstream(file)) {
        if (defers.has(downstream) === false) {
          defers.set(downstream, Defer());
        }
      }
    }
    // wait on all upstream defers
    const tasks: Promise<void>[] = [];
    for (const [file, defer] of defers) {
      const waitlist: Promise<void>[] = [];
      for (const upstream of this.getUpstream(file)) {
        const upstream_defer = defers.get(upstream);
        if (upstream_defer) {
          waitlist.push(upstream_defer.promise);
        }
      }
      tasks.push(this.runProcessorList(file, waitlist, defer));
    }
    await Promise.all(tasks);
    this.$set_unprocessed_updated_files.clear();
  }

  async firstRunProcessorList(file: ProjectFile) {
    this.channel.log(`"${file.src_path.raw}"`);
    file.resetBytes();
    for (const { processor, method } of file.$processor_list) {
      await method.call(processor, file.builder, file);
    }
  }

  async runProcessorList(file: ProjectFile, waitlist: Promise<void>[], defer?: Defer<void>) {
    await Promise.all(waitlist);
    this.channel.log(`"${file.src_path.raw}"`);
    file.resetBytes();
    for (const { processor, method } of file.$processor_list) {
      await method.call(processor, file.builder, file);
    }
    defer?.resolve();
  }
}

export class ProjectFile {
  constructor(
    public builder: BuilderInternal,
    public src_path: CPath,
    public out_path: CPath,
  ) {}

  $processor_list: { processor: ProcessorModule; method: ProcessorMethod }[] = [];
  addProcessor(processor: ProcessorModule, method: ProcessorMethod): void {
    this.$processor_list.push({ processor, method });
  }

  /** When true, file contents have been modified during the current processing phase. */
  ismodified = false;
  /** When false, $bytes/$text are no longer from the original file. */
  isoriginal = true;

  $bytes?: Uint8Array;
  $text?: string;

  // Get cached contents or contents from file on disk as Uint8Array.
  async getBytes(): Promise<Uint8Array> {
    if (this.$bytes === undefined) {
      if (this.$text === undefined) {
        this.$bytes = await this.builder.platform.File.readBytes(this.src_path);
      } else {
        this.$bytes = new TextEncoder().encode(this.$text);
        this.$text = undefined;
      }
    }
    return this.$bytes;
  }
  // Get cached contents or contents from file on disk as string.
  async getText(): Promise<string> {
    if (this.$text === undefined) {
      if (this.$bytes === undefined) {
        this.$text = await this.builder.platform.File.readText(this.src_path);
      } else {
        this.$text = new TextDecoder().decode(this.$bytes);
        this.$bytes = undefined;
      }
    }
    return this.$text;
  }

  // Set cached contents to Uint8Array.
  setBytes(bytes: Uint8Array) {
    this.isoriginal = false;
    this.ismodified = true;
    this.$bytes = bytes;
    this.$text = undefined;
  }
  // Set cached contents to string.
  setText(text: string) {
    this.isoriginal = false;
    this.ismodified = true;
    this.$bytes = undefined;
    this.$text = text;
  }

  // Clears the cached contents and resets attributes.
  resetBytes() {
    this.isoriginal = true;
    this.ismodified = false;
    this.$bytes = undefined;
    this.$text = undefined;
  }

  // Attempts to write cached contents to file on disk.
  // Returns number of bytes written.
  async write(): Promise<number> {
    let byteswritten = 0;
    if (this.$text !== undefined) {
      byteswritten = await this.builder.platform.File.writeText(this.out_path, this.$text);
    } else {
      byteswritten = await this.builder.platform.File.writeBytes(this.out_path, await this.getBytes());
    }
    return byteswritten;
  }

  // Useful for some console log coercion.
  toString(): string {
    return this.src_path.toString();
  }
}
