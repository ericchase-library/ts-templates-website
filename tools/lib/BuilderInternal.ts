import { CPath, Path } from 'src/lib/ericchase/Platform/FilePath.js';
import { FileStats, PlatformProviderId, UnimplementedProvider } from 'src/lib/ericchase/Platform/PlatformProvider.js';
import { KEYS } from 'src/lib/ericchase/Platform/Shell.js';
import { AddStdinListener, StartStdinRawModeReader } from 'src/lib/ericchase/Platform/StdinReader.js';
import { ConsoleLog, ConsoleLogWithDate } from 'src/lib/ericchase/Utility/Console.js';
import { Debounce } from 'src/lib/ericchase/Utility/Debounce.js';
import { Defer } from 'src/lib/ericchase/Utility/Defer.js';
import { Map_GetOrDefault } from 'src/lib/ericchase/Utility/Map.js';
import { Builder } from 'tools/lib/Builder.js';
import { ProcessorModule } from 'tools/lib/Processor.js';
import { ProjectFile } from 'tools/lib/ProjectFile.js';

export interface BuildStep {
  run: (builder: BuilderInternal) => Promise<void>;
}

export class BuilderInternal {
  constructor(public external: Builder) {}

  platform = UnimplementedProvider;
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

  startup_steps: BuildStep[] = [];
  processor_modules: ProcessorModule[] = [];
  cleanup_steps: BuildStep[] = [];

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

        const scan_paths = new Set(await this.platform.Directory.globScan(Path('./'), `${this.dir.src.standard}/**/*`));
        const this_paths = new Set(Array.from(this.$map_path_to_file.keys()).map((str) => Path(str).raw));
        for (const path of scan_paths.difference(this_paths)) {
          this.addPath(Path(path), Path(this.dir.out, Path(path).slice(1)));
        }
        for (const path of this_paths.difference(scan_paths)) {
          this.removePath(Path(path));
        }

        // process files
        await this.processUnprocessedFiles();
      }, 100);
      this.$unwatchSource = this.platform.Directory.watch(this.dir.src, (event, path) => {
        event_paths.add(path.raw);
        const orphan = process_events();
      });
      ConsoleLogWithDate(`Watching "${this.dir.src.raw}"`);
    }
  }

  // Processing

  $set_unprocessed_added_files = new Set<ProjectFile>();
  $set_unprocessed_removed_files = new Set<ProjectFile>();
  $set_unprocessed_updated_files = new Set<ProjectFile>();

  async start() {
    for (const path of await this.platform.Directory.globScan(this.dir.src, '**/*')) {
      this.addPath(Path(this.dir.src, path), Path(this.dir.out, path));
    }

    // Startup Steps
    for (const step of this.startup_steps) {
      ConsoleLogWithDate(step.constructor.name);
      await step.run(this);
    }

    // Processor Modules
    await this.processUnprocessedFiles();

    if (this.watchmode === true) {
      // Setup Source Watcher
      this.setupSourceWatcher();
      // Setup Stdin Reader
      AddStdinListener(async (bytes, text, removeSelf) => {
        if (text === KEYS.SIGINT || text === 'q') {
          removeSelf();
          ConsoleLog('User Command: Quit');
          this.$unwatchSource?.();
          // Cleanup Steps
          for (const step of this.cleanup_steps) {
            ConsoleLogWithDate(step.constructor.name);
            await step.run(this);
          }
          // Force Exit
          process.exit();
        }
      });
      StartStdinRawModeReader();
    } else {
      // Cleanup Steps
      for (const step of this.cleanup_steps) {
        ConsoleLogWithDate(step.constructor.name);
        await step.run(this);
      }
    }
  }

  async processUnprocessedFiles() {
    await this.$processRemovedFiles();
    await this.$processAddedFiles();
    await this.$processUpdatedFiles();
  }

  // always call processUpdatedFiles after this
  async $processAddedFiles() {
    for (const processor of this.processor_modules) {
      await processor.onAdd(this, this.$set_unprocessed_added_files);
    }
    const tasks: Promise<void>[] = [];
    for (const file of this.$set_unprocessed_added_files) {
      tasks.push(firstRunProcessorList(file));
    }
    for (const task of tasks) {
      await task;
    }
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
      tasks.push(runProcessorList(file, waitlist, defer));
    }
    for (const task of tasks) {
      await task;
    }
    this.$set_unprocessed_updated_files.clear();
  }
}

async function firstRunProcessorList(file: ProjectFile) {
  file.resetBytes();
  for (const { processor, method } of file.$processor_list) {
    await method.call(processor, file.builder, file);
  }
}

async function runProcessorList(file: ProjectFile, waitlist: Promise<void>[], defer?: Defer<void>) {
  for (const task of waitlist) {
    await task;
  }
  ConsoleLogWithDate(`Processing - "${file.src_path.raw}"`);
  file.resetBytes();
  for (const { processor, method } of file.$processor_list) {
    await method.call(processor, file.builder, file);
  }
  defer?.resolve();
}
