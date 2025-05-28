import { Core_Map_GetOrDefault, Core_Promise_Orphan, Core_Utility_Debounce } from '../../src/lib/ericchase/api.core.js';
import { BunPlatform_File_Async_ReadBytes, BunPlatform_File_Async_ReadText, BunPlatform_File_Async_WriteBytes, BunPlatform_File_Async_WriteText, BunPlatform_Glob_AsyncGen_Scan } from '../../src/lib/ericchase/api.platform-bun.js';
import { NodePlatform_Directory_Watch, NodePlatform_Path_Async_GetStats, NodePlatform_Path_Join, NodePlatform_Path_JoinStandard, NodePlatform_Path_Slice, NodePlatform_Shell_Keys, NodePlatform_Shell_StdIn_AddListener, NodePlatform_Shell_StdIn_LockReader, NodePlatform_Shell_StdIn_StartReaderInRawMode } from '../../src/lib/ericchase/api.platform-node.js';
import { CACHELOCK, FILESTATS } from './Cacher.js';
import { AddLoggerOutputDirectory, Logger, WaitForLogger } from './Logger.js';

await AddLoggerOutputDirectory('cache');

export namespace Builder {
  export enum MODE {
    BUILD,
    DEV,
  }
  export enum VERBOSITY {
    _0_ERROR,
    _1_LOG,
    _2_DEBUG,
  }

  export class File {
    constructor(
      public src_path: ClassRawPath,
      public out_path: ClassRawPath,
    ) {}
    $data: { bytes?: Uint8Array; text?: string } = { bytes: undefined, text: undefined };
    $processor_list: { processor: Builder.Processor; method: Builder.ProcessorMethod }[] = [];
    /** When true, file contents have been modified during the current processing phase. */
    ismodified = false;
    /** When false, $bytes/$text are no longer from the original file. */
    isoriginal = true;
    iswritable = true;
    addProcessor(processor: Builder.Processor, method: Builder.ProcessorMethod): void {
      this.$processor_list.push({ processor, method });
    }
    addUpstreamFile(upstream: File) {
      if (this.src_path.value !== upstream.src_path.value) {
        DependencyGraph.Add(upstream, this);
      }
    }
    addUpstreamPath(upstream: string) {
      const upstream_rawpath = RawPath(upstream);
      if (this.src_path.value !== upstream_rawpath.value) {
        DependencyGraph.Add(SrcSet.FileSet.Get(upstream_rawpath), this);
      }
    }
    // Get cached contents or contents from file on disk as Uint8Array.
    async getBytes(): Promise<Uint8Array> {
      if (this.$data.bytes === undefined) {
        if (this.$data.text === undefined) {
          this.$data.bytes = await BunPlatform_File_Async_ReadBytes(this.src_path.value);
        } else {
          this.$data.bytes = new TextEncoder().encode(this.$data.text);
          this.$data.text = undefined;
        }
      }
      return this.$data.bytes;
    }
    // Get cached contents or contents from file on disk as string.
    async getText(): Promise<string> {
      if (this.$data.text === undefined) {
        if (this.$data.bytes === undefined) {
          this.$data.text = await BunPlatform_File_Async_ReadText(this.src_path.value);
        } else {
          this.$data.text = new TextDecoder().decode(this.$data.bytes);
          this.$data.bytes = undefined;
        }
      }
      return this.$data.text;
    }
    refresh(): void {
      SrcSet.FileSet.Refresh(this);
    }
    // Clears the cached contents and resets attributes.
    resetBytes() {
      this.isoriginal = true;
      this.ismodified = false;
      this.$data.bytes = undefined;
      this.$data.text = undefined;
    }
    // Set cached contents to Uint8Array.
    setBytes(bytes: Uint8Array) {
      this.isoriginal = false;
      this.ismodified = true;
      this.$data.bytes = bytes;
      this.$data.text = undefined;
      SrcSet.FileSet.Update(this);
    }
    // Set cached contents to string.
    setText(text: string) {
      this.isoriginal = false;
      this.ismodified = true;
      this.$data.bytes = undefined;
      this.$data.text = text;
      SrcSet.FileSet.Update(this);
    }
    // Attempts to write cached contents to file on disk.
    // Returns number of bytes written.
    async write(): Promise<number> {
      let byteswritten = 0;
      if (this.$data.text !== undefined) {
        byteswritten = await BunPlatform_File_Async_WriteText(this.out_path.value, this.$data.text);
      } else {
        byteswritten = await BunPlatform_File_Async_WriteBytes(this.out_path.value, await this.getBytes());
      }
      this.ismodified = false;
      return byteswritten;
    }
  }

  export interface Processor {
    ProcessorName: string;
    onStartUp?: () => Promise<void>;
    onAdd?: (files: Set<Builder.File>) => Promise<void>;
    onRemove?: (files: Set<Builder.File>) => Promise<void>;
    onCleanUp?: () => Promise<void>;
  }
  export type ProcessorMethod = (file: Builder.File) => Promise<void>;
  export interface Step {
    StepName: string;
    onStartUp?: () => Promise<void>;
    onRun?: () => Promise<void>;
    onCleanUp?: () => Promise<void>;
  }

  export let Dir = {
    Lib: 'src/lib',
    Out: 'out',
    Src: 'src',
    Tools: 'tools',
  };

  export function GetMode(): Builder.MODE {
    return _mode;
  }
  export function SetMode(mode: Builder.MODE): void {
    _mode = mode;
  }

  export function GetVerbosity(): Builder.VERBOSITY {
    return _verbosity;
  }
  export function SetVerbosity(verbosity: Builder.VERBOSITY): void {
    _verbosity = verbosity;
  }

  export function SetStartUpSteps(...steps: Builder.Step[]): void {
    BuildPhase.SetStartUpSteps(...steps);
  }
  export function SetBeforeProcessingSteps(...steps: Builder.Step[]): void {
    BuildPhase.SetBeforeProcessingSteps(...steps);
  }
  export function SetProcessorModules(...modules: Builder.Processor[]): void {
    BuildPhase.SetProcessorModules(...modules);
  }
  export function SetAfterProcessingSteps(...steps: Builder.Step[]): void {
    BuildPhase.SetAfterProcessingSteps(...steps);
  }
  export function SetCleanUpSteps(...steps: Builder.Step[]): void {
    BuildPhase.SetCleanUpSteps(...steps);
  }

  export async function Start(): Promise<void> {
    if (_started === false) {
      _started = true;
      switch (_mode) {
        case MODE.BUILD:
          StartBuild();
          break;
        case MODE.DEV:
          StartDev();
          break;
      }
    }
  }
}

namespace _logs {
  export const _file_added_ = (p0: string) => `[add] "${p0}"`;
  export const _file_refreshed_ = (p0: string) => `[refresh] "${p0}"`;
  export const _file_removed_ = (p0: string) => `[remov] "${p0}"`;
  export const _file_updated_ = (p0: string) => `[update] "${p0}"`;
  export const _phase_begin_ = (p0: string) => `[begin] ${p0}`;
  export const _phase_end_ = (p0: string) => `[end] ${p0}`;
  export const _processor_onadd_ = (p0: string) => `[onAdd] ${p0}`;
  export const _processor_oncleanup_ = (p0: string) => `[onCleanUp] ${p0}`;
  export const _processor_onprocess_ = (p0: string, p1: string) => `[onProcess] ${p0} [for] "${p1}"`;
  export const _processor_onremove_ = (p0: string) => `[onRemove] ${p0}`;
  export const _processor_onstartup_ = (p0: string) => `[onStartUp] ${p0}`;
  export const _step_oncleanup_ = (p0: string) => `[onCleanUp] ${p0}`;
  export const _step_onrun_ = (p0: string) => `[onRun] ${p0}`;
  export const _step_onstartup_ = (p0: string) => `[onStartUp] ${p0}`;
  export const _user_command_ = (p0: string) => `[command] "${p0}"`;
  export const _watching_dir_ = (p0: string) => `[watch] "${p0}"`;
}

class ClassRawPath {
  value: string;
  constructor(...paths: string[]) {
    this.value = NodePlatform_Path_Join(...paths);
  }
  toStandard() {
    return NodePlatform_Path_JoinStandard(this.value);
  }
}
function RawPath(...paths: string[]): ClassRawPath {
  return new ClassRawPath(...paths);
}

class ClassLockCounter {
  protected callback = new Set<() => void>();
  protected set = new Set<object>();
  lock() {
    const ref = {};
    this.set.add(ref);
    return () => {
      if (this.set.delete(ref) && this.set.size === 0) {
        for (const callback of this.callback) {
          this.callback.delete(callback);
          callback();
        }
      }
    };
  }
  onZeroLocks(): Promise<void> {
    return new Promise<void>((resolve) => {
      if (this.set.size > 0) {
        this.callback.add(() => resolve());
      } else {
        resolve();
      }
    });
  }
}
function LockCounter(): ClassLockCounter {
  return new ClassLockCounter();
}

let _channel = Logger('Builder').newChannel();
let _mode = Builder.MODE.BUILD;
let _started = false;
let _verbosity = Builder.VERBOSITY._1_LOG;

namespace BuildPhase {
  let array__startup_steps: Builder.Step[] = [];
  let array__before_steps: Builder.Step[] = [];
  let array__processor_modules: Builder.Processor[] = [];
  let array__after_steps: Builder.Step[] = [];
  let array__cleanup_steps: Builder.Step[] = [];
  let set__unprocessed_added_files = new Set<Builder.File>();
  let set__unprocessed_removed_files = new Set<Builder.File>();
  let set__unprocessed_updated_files = new Set<Builder.File>();

  export function SetStartUpSteps(...steps: Builder.Step[]): void {
    array__startup_steps = steps;
  }
  export function SetBeforeProcessingSteps(...steps: Builder.Step[]): void {
    array__before_steps = steps;
  }
  export function SetProcessorModules(...modules: Builder.Processor[]): void {
    array__processor_modules = modules;
  }
  export function SetAfterProcessingSteps(...steps: Builder.Step[]): void {
    array__after_steps = steps;
  }
  export function SetCleanUpSteps(...steps: Builder.Step[]): void {
    array__cleanup_steps = steps;
  }

  export function AddUnprocessedAddedFile(file: Builder.File) {
    set__unprocessed_added_files.add(file);
  }
  export function AddUnprocessedRemovedFile(file: Builder.File) {
    set__unprocessed_removed_files.add(file);
  }
  export function AddUnprocessedUpdatedFile(file: Builder.File) {
    set__unprocessed_updated_files.add(file);
  }

  export async function StartUp() {
    if (_verbosity >= Builder.VERBOSITY._1_LOG) {
      _channel.log('...');
      _channel.log(_logs._phase_begin_('StartUp'));
    }
    // All Steps onStartUp
    for (const step of array__startup_steps) {
      await safe_step_onStartUp(step);
    }
    for (const step of array__before_steps) {
      await safe_step_onStartUp(step);
    }
    for (const step of array__after_steps) {
      await safe_step_onStartUp(step);
    }
    for (const step of array__cleanup_steps) {
      await safe_step_onStartUp(step);
    }
    // StartUp Steps onRun
    for (const step of array__startup_steps) {
      await safe_step_onRun(step);
    }
    // All Processors onStartUp
    for (const processor of array__processor_modules) {
      await safe_processor_onStartUp(processor);
    }
    if (_verbosity >= Builder.VERBOSITY._1_LOG) {
      _channel.log(_logs._phase_end_('StartUp'));
      _channel.log('...');
    }
  }
  export async function CleanUp() {
    if (_verbosity >= Builder.VERBOSITY._1_LOG) {
      _channel.log(_logs._phase_begin_('CleanUp'));
    }
    // All Processors onCleanUp
    for (const processor of array__processor_modules) {
      await safe_processor_onCleanUp(processor);
    }
    // CleanUp Steps onRun
    for (const step of array__cleanup_steps) {
      await safe_step_onRun(step);
    }
    // All Steps onCleanUp
    for (const step of array__startup_steps) {
      await safe_step_onCleanUp(step);
    }
    for (const step of array__before_steps) {
      await safe_step_onCleanUp(step);
    }
    for (const step of array__after_steps) {
      await safe_step_onCleanUp(step);
    }
    for (const step of array__cleanup_steps) {
      await safe_step_onCleanUp(step);
    }
    if (_verbosity >= Builder.VERBOSITY._1_LOG) {
      _channel.log(_logs._phase_end_('CleanUp'));
      _channel.log('...');
    }
  }
  export async function Process() {
    if (array__processor_modules.length > 0) {
      if (set__unprocessed_removed_files.size > 0) {
        await ProcessRemovedFiles();
      }
      if (set__unprocessed_added_files.size > 0) {
        await ProcessAddedFiles();
      }
    }
    // Write Files Regardless of Modification
    for (const file of SrcSet.FileSet.Clone()) {
      if (file.iswritable === true) {
        await file.write();
      }
    }
    // Before Steps onRun
    for (const step of array__before_steps) {
      await safe_step_onRun(step);
    }
    if (array__processor_modules.length > 0) {
      if (set__unprocessed_updated_files.size > 0) {
        await ProcessUpdatedFiles();
      }
    }
    // Write Files if Modified
    for (const file of SrcSet.FileSet.Clone()) {
      if (file.iswritable === true && file.ismodified === true) {
        await file.write();
      }
    }
    // After Steps onRun
    for (const step of array__after_steps) {
      await safe_step_onRun(step);
    }
    _channel.newLine();
  }

  async function ProcessAddedFiles() {
    // always call processUpdatedFiles after this
    if (_verbosity >= Builder.VERBOSITY._1_LOG) {
      _channel.log(_logs._phase_begin_('Process Added Files'));
    }
    const unprocessed_set = new Set(set__unprocessed_added_files);
    set__unprocessed_added_files.clear();
    for (const processor of array__processor_modules) {
      await safe_processor_onAdd(processor, unprocessed_set);
    }
    const tasks: Promise<void>[] = [];
    for (const file of unprocessed_set) {
      file.resetBytes();
      for (const { processor, method } of file.$processor_list) {
        await safe_processor_onProcess(processor, method, file);
      }
    }
    await Promise.allSettled(tasks);
    if (_verbosity >= Builder.VERBOSITY._1_LOG) {
      _channel.log(_logs._phase_end_('Process Added Files'));
      _channel.log('...');
    }
  }
  async function ProcessRemovedFiles() {
    // always call processUpdatedFiles after this
    if (_verbosity >= Builder.VERBOSITY._1_LOG) {
      _channel.log(_logs._phase_begin_('Process Removed Files'));
    }
    const unprocessed_set = new Set(set__unprocessed_removed_files);
    set__unprocessed_removed_files.clear();
    for (const processor of array__processor_modules) {
      await safe_processor_onRemove(processor, unprocessed_set);
    }
    if (_verbosity >= Builder.VERBOSITY._1_LOG) {
      _channel.log(_logs._phase_end_('Process Removed Files'));
      _channel.log('...');
    }
  }
  async function ProcessUpdatedFiles() {
    if (_verbosity >= Builder.VERBOSITY._1_LOG) {
      _channel.log(_logs._phase_begin_('Process Updated Files'));
    }
    const unprocessed_file_set: Set<Builder.File> = (() => {
      const set = new Set<Builder.File>();
      for (const file of set__unprocessed_updated_files) {
        set.add(file);
        for (const downstream_file of DependencyGraph.GetDownstream(file)) {
          set.add(downstream_file);
        }
      }
      set__unprocessed_updated_files.clear();
      return set;
    })();
    const checkcount_map = new Map<Builder.File, number>();
    while (unprocessed_file_set.size > 0) {
      outer: for (const file of unprocessed_file_set) {
        checkcount_map.set(file, Core_Map_GetOrDefault(checkcount_map, file, () => 0) + 1);
        for (const upstream of DependencyGraph.GetUpstream(file)) {
          if (unprocessed_file_set.has(upstream)) {
            continue outer;
          }
        }
        file.resetBytes();
        for (const { processor, method } of file.$processor_list) {
          await safe_processor_onProcess(processor, method, file);
        }
        unprocessed_file_set.delete(file);
      }
    }
    if (_verbosity >= Builder.VERBOSITY._2_DEBUG) {
      _channel.log('  Dependency Tree Check Counter');
      for (const [file, count] of checkcount_map) {
        _channel.log(`  - ${count.toString().padStart(2, '0')} "${file.src_path.value}"`);
      }
    }
    if (_verbosity >= Builder.VERBOSITY._1_LOG) {
      _channel.log(_logs._phase_end_('Process Updated Files'));
      _channel.log('...');
    }
  }

  async function safe_processor_onStartUp(processor: Builder.Processor) {
    try {
      if (_verbosity >= Builder.VERBOSITY._2_DEBUG) {
        _channel.log(_logs._processor_onstartup_(processor.ProcessorName));
      }
      await processor.onStartUp?.();
    } catch (error) {
      _channel.error(error, `Unhandled exception in ${processor.ProcessorName} onStartUp:`);
      throw new Error();
    }
  }
  async function safe_processor_onAdd(processor: Builder.Processor, unprocessed_set: Set<Builder.File>) {
    try {
      if (_verbosity >= Builder.VERBOSITY._2_DEBUG) {
        _channel.log(_logs._processor_onadd_(processor.ProcessorName));
      }
      await processor.onAdd?.(unprocessed_set);
    } catch (error) {
      _channel.error(error, `Unhandled exception in ${processor.ProcessorName} onAdd:`);
      throw new Error();
    }
  }
  async function safe_processor_onProcess(processor: Builder.Processor, method: Builder.ProcessorMethod, file: Builder.File) {
    try {
      if (_verbosity >= Builder.VERBOSITY._2_DEBUG) {
        _channel.log(_logs._processor_onprocess_(processor.ProcessorName, file.src_path.value));
      }
      await method.call(processor, file);
    } catch (error) {
      _channel.error(error, `Unhandled exception in ${processor.ProcessorName} for "${file.src_path.value}":`);
      throw new Error();
    }
  }
  async function safe_processor_onRemove(processor: Builder.Processor, unprocessed_set: Set<Builder.File>) {
    try {
      if (_verbosity >= Builder.VERBOSITY._2_DEBUG) {
        _channel.log(_logs._processor_onremove_(processor.ProcessorName));
      }
      await processor.onRemove?.(unprocessed_set);
    } catch (error) {
      _channel.error(error, `Unhandled exception in ${processor.ProcessorName} onRemove:`);
      throw new Error();
    }
  }
  async function safe_processor_onCleanUp(processor: Builder.Processor) {
    try {
      if (_verbosity >= Builder.VERBOSITY._2_DEBUG) {
        _channel.log(_logs._processor_oncleanup_(processor.ProcessorName));
      }
      await processor.onCleanUp?.();
    } catch (error) {
      _channel.error(error, `Unhandled exception in ${processor.ProcessorName} onCleanUp:`);
      throw new Error();
    }
  }
  async function safe_step_onStartUp(step: Builder.Step) {
    try {
      if (_verbosity >= Builder.VERBOSITY._2_DEBUG) {
        _channel.log(_logs._step_onstartup_(step.StepName));
      }
      await step.onStartUp?.();
    } catch (error) {
      _channel.error(error, `Unhandled exception in ${step.StepName} onStartUp:`);
      throw new Error();
    }
  }
  async function safe_step_onRun(step: Builder.Step) {
    try {
      if (_verbosity >= Builder.VERBOSITY._2_DEBUG) {
        _channel.log(_logs._step_onrun_(step.StepName));
      }
      await step.onRun?.();
    } catch (error) {
      _channel.error(error, `Unhandled exception in ${step.StepName} onRun:`);
      throw new Error();
    }
  }
  async function safe_step_onCleanUp(step: Builder.Step) {
    try {
      if (_verbosity >= Builder.VERBOSITY._2_DEBUG) {
        _channel.log(_logs._step_oncleanup_(step.StepName));
      }
      await step.onCleanUp?.();
    } catch (error) {
      _channel.error(error, `Unhandled exception in ${step.StepName} onCleanUp:`);
      throw new Error();
    }
  }
}

namespace DependencyGraph {
  let map_downstream_to_upstream = new Map<Builder.File, Set<Builder.File>>();
  let map_upstream_to_downstream = new Map<Builder.File, Set<Builder.File>>();

  export function Add(upstream: Builder.File, downstream: Builder.File) {
    if (upstream === downstream) {
      _channel.error(`dependency cycle "${upstream.src_path.value}": a file cannot depend on itself`);
      throw new Error();
    }
    if (map_downstream_to_upstream.get(upstream)?.has(downstream)) {
      _channel.error(`dependency cycle between upstream "${upstream.src_path.value}" and downstream "${downstream.src_path.value}"`);
      throw new Error();
    }
    Core_Map_GetOrDefault(map_downstream_to_upstream, downstream, () => new Set<Builder.File>()).add(upstream);
    Core_Map_GetOrDefault(map_upstream_to_downstream, upstream, () => new Set<Builder.File>()).add(downstream);
  }
  export function Delete(file: Builder.File) {
    map_downstream_to_upstream.delete(file);
    map_upstream_to_downstream.delete(file);
  }
  export function GetDownstream(file: Builder.File): Set<Builder.File> {
    return map_upstream_to_downstream.get(file) ?? new Set();
  }
  export function GetUpstream(file: Builder.File): Set<Builder.File> {
    return map_downstream_to_upstream.get(file) ?? new Set();
  }
  export function Remove(upstream: Builder.File, downstream: Builder.File) {
    Core_Map_GetOrDefault(map_downstream_to_upstream, downstream, () => new Set<Builder.File>()).delete(upstream);
    Core_Map_GetOrDefault(map_upstream_to_downstream, upstream, () => new Set<Builder.File>()).delete(downstream);
  }
}

namespace SrcSet {
  let map__path_to_file = new Map<string, Builder.File>();
  let set__file = new Set<Builder.File>();
  let set__path = new Set<string>();

  export namespace FileSet {
    export function Clone(): Set<Builder.File> {
      return new Set(set__file);
    }
    export function Get(path: ClassRawPath): Builder.File {
      const project_file = map__path_to_file.get(path.value);
      if (project_file === undefined) {
        _channel.error(`file "${path.value}" does not exist`);
        throw new Error();
      }
      return project_file;
    }
    function Has(file: Builder.File): boolean {
      // @debug-start
      const stored_file = map__path_to_file.get(file.src_path.value);
      if (stored_file !== undefined && stored_file !== file) {
        _channel.error(`file "${file.src_path.value}" different from stored file "${stored_file.src_path.value}"`);
        throw new Error();
      }
      // @debug-end
      return map__path_to_file.has(file.src_path.value);
    }
    export function Refresh(file: Builder.File): void {
      BuildPhase.AddUnprocessedAddedFile(file); // trigger a first run
      BuildPhase.AddUnprocessedUpdatedFile(file);
      // channel.log(logs._file_refreshed_(file.src_path.value));
    }
    export function Update(file: Builder.File): void {
      BuildPhase.AddUnprocessedUpdatedFile(file);
      // channel.log(logs._file_updated_file_(file.src_path.value));
    }
  }

  export namespace PathSet {
    export function Add(path: ClassRawPath, out_path: ClassRawPath) {
      // @debug-start
      if (map__path_to_file.has(path.value)) {
        _channel.error(`file "${path.value}" already added`);
        throw new Error();
      }
      // @debug-end
      const file = new Builder.File(path, out_path);
      map__path_to_file.set(path.value, file);
      set__file.add(file);
      set__path.add(path.value);
      BuildPhase.AddUnprocessedAddedFile(file);
      if (_verbosity >= Builder.VERBOSITY._1_LOG) {
        _channel.log(_logs._file_added_(path.value));
      }
      return file;
    }
    export function Clone(): Set<string> {
      return new Set(set__path);
    }
    export function Has(path: ClassRawPath): boolean {
      return map__path_to_file.has(path.value);
    }
    export function Remove(path: ClassRawPath) {
      // @debug-start
      if (map__path_to_file.has(path.value) === false) {
        _channel.error(`file "${path.value}" already removed`);
        throw new Error();
      }
      // @debug-end
      const file = FileSet.Get(path);
      map__path_to_file.delete(path.value);
      set__file.delete(file);
      set__path.delete(path.value);
      BuildPhase.AddUnprocessedRemovedFile(file);
      for (const upstream of DependencyGraph.GetUpstream(file)) {
        DependencyGraph.Remove(upstream, file);
      }
      for (const downstream of DependencyGraph.GetDownstream(file)) {
        DependencyGraph.Remove(file, downstream);
      }
      DependencyGraph.Delete(file);
      if (_verbosity >= Builder.VERBOSITY._1_LOG) {
        _channel.log(_logs._file_removed_(path.value));
      }
      return file;
    }
    export function Update(path: ClassRawPath) {
      const file = FileSet.Get(path);
      BuildPhase.AddUnprocessedUpdatedFile(file);
      _channel.log(_logs._file_updated_(path.value));
      return file;
    }
  }
}

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

function SecureLocks() {
  FILESTATS.LockTable();
  CACHELOCK.TryLockEach(['Build', 'Format']);
}
function ReleaseLocks() {
  CACHELOCK.UnlockEach(['Build', 'Format']);
  FILESTATS.UnlockTable();
}
async function ScanSourceFolder() {
  for await (const path of BunPlatform_Glob_AsyncGen_Scan(Builder.Dir.Src, '**/*')) {
    SrcSet.PathSet.Add(RawPath(Builder.Dir.Src, path), RawPath(Builder.Dir.Out, path));
  }
}

async function StartBuild() {
  try {
    SecureLocks();
    ScanSourceFolder();
    await BuildPhase.StartUp();
    await BuildPhase.Process();
    await BuildPhase.CleanUp();
  } catch (error) {
    await WaitForLogger();
    throw 'Errors during build. Check logs.';
  } finally {
    ReleaseLocks();
  }
}

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

async function StartDev() {
  try {
    SecureLocks();
    ScanSourceFolder();
    const mutex = LockCounter();
    const unlock = mutex.lock();
    {
      // Setup Source Watcher
      const event_paths = new Set<string>();
      const processEvents = Core_Utility_Debounce(async () => {
        const unlock = mutex.lock();
        // copy the set and clear it
        const event_paths_copy = new Set(event_paths);
        event_paths.clear();
        for (const path of event_paths_copy) {
          const src_path = RawPath(Builder.Dir.Src, path);
          const stats = await NodePlatform_Path_Async_GetStats(src_path.value);
          if (stats?.isFile() === true) {
            if (SrcSet.PathSet.Has(src_path) === true) {
              SrcSet.PathSet.Update(src_path);
            } else {
              SrcSet.PathSet.Add(src_path, RawPath(Builder.Dir.Out, path));
            }
          }
        }
        const scan_paths = new Set<string>();
        for await (const path of BunPlatform_Glob_AsyncGen_Scan('./', RawPath(`${Builder.Dir.Src}/**/*`).toStandard())) {
          scan_paths.add(path);
          if (SrcSet.PathSet.Has(RawPath(path)) === false) {
            SrcSet.PathSet.Add(RawPath(path), RawPath(Builder.Dir.Out, NodePlatform_Path_Slice(path, 1)));
          }
        }
        for (const path of SrcSet.PathSet.Clone()) {
          if (scan_paths.has(path) === false) {
            SrcSet.PathSet.Remove(RawPath(path));
          }
        }
        await BuildPhase.Process();
        unlock();
      }, 100);
      const unwatch = NodePlatform_Directory_Watch(Builder.Dir.Src, (event, path) => {
        event_paths.add(path);
        Core_Promise_Orphan(processEvents());
      });
      if (_verbosity >= Builder.VERBOSITY._1_LOG) {
        _channel.log(_logs._watching_dir_(Builder.Dir.Src));
      }
      // Setup Stdin Reader
      const releaseStdIn = NodePlatform_Shell_StdIn_LockReader();
      NodePlatform_Shell_StdIn_AddListener(async (bytes, text, removeSelf) => {
        if (text === 'q') {
          removeSelf();
          if (_verbosity >= Builder.VERBOSITY._1_LOG) {
            _channel.log(_logs._user_command_('Quit'));
          }
          await mutex.onZeroLocks();
          unwatch();
          await BuildPhase.CleanUp();
          ReleaseLocks();
          releaseStdIn();
        }
      });
      NodePlatform_Shell_StdIn_AddListener((bytes, text, removeSelf) => {
        if (text === NodePlatform_Shell_Keys.SIGINT) {
          removeSelf();
          if (_verbosity >= Builder.VERBOSITY._1_LOG) {
            _channel.log(_logs._user_command_('Force Quit'));
          }
          unwatch();
          releaseStdIn();
          process.exit();
        }
      });
      NodePlatform_Shell_StdIn_StartReaderInRawMode();
    }
    await BuildPhase.StartUp();
    await BuildPhase.Process();
    unlock();
  } catch (error) {
    await WaitForLogger();
    ReleaseLocks();
    throw 'Errors during build. Check logs.';
  }
}
