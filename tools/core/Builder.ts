import { Core_Map_GetOrDefault, Core_Type_Utility_Class_Defer } from '../../src/lib/ericchase/api.core.js';
import { BunPlatform_File_Async_ReadBytes, BunPlatform_File_Async_ReadText, BunPlatform_File_Async_WriteBytes, BunPlatform_File_Async_WriteText, BunPlatform_Glob_AsyncGen_Scan } from '../../src/lib/ericchase/api.platform-bun.js';
import { NODE_FS, NodePlatform_Directory_Watch, NodePlatform_Path_Async_GetStats, NodePlatform_Path_Join, NodePlatform_Path_Slice, NodePlatform_Shell_Keys, NodePlatform_Shell_StdIn_AddListener, NodePlatform_Shell_StdIn_LockReader, NodePlatform_Shell_StdIn_StartReaderInRawMode } from '../../src/lib/ericchase/api.platform-node.js';
import { CACHELOCK, FILESTATS } from './Cacher.js';
import { AddLoggerOutputDirectory, Logger } from './Logger.js';

await AddLoggerOutputDirectory('cache');

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
  export const _scanning_dir_ = (p0: string) => `[scan] "${p0}"`;
  export const _step_oncleanup_ = (p0: string) => `[onCleanUp] ${p0}`;
  export const _step_onrun_ = (p0: string) => `[onRun] ${p0}`;
  export const _step_onstartup_ = (p0: string) => `[onStartUp] ${p0}`;
  export const _user_command_ = (p0: string) => `[command] "${p0}"`;
  export const _watching_dir_ = (p0: string) => `[watch] "${p0}"`;
}

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
  export class File {
    constructor(
      public src_path: string,
      public out_path: string,
    ) {}
    $data: { bytes?: Uint8Array; text?: string } = { bytes: undefined, text: undefined };
    $processor_list: { processor: Builder.Processor; method: Builder.ProcessorMethod }[] = [];
    /** When true, file contents have been modified during the current processing phase. */
    ismodified = true;
    /** When false, $bytes/$text are no longer from the original file. */
    isoriginal = true;
    iswritable = true;
    addProcessor(processor: Builder.Processor, method: Builder.ProcessorMethod): void {
      this.$processor_list.push({ processor, method });
    }
    addUpstreamFile(upstream_file: File): void {
      if (upstream_file === this) {
        // _channel.error(`dependency cycle "${upstream_file.src_path}": a file cannot depend on itself`);
        // throw new Error();
        return;
      }
      if (map__downstream_to_upstream.get(upstream_file)?.has(this)) {
        _channel.error(`dependency cycle between upstream "${upstream_file.src_path}" and downstream "${this.src_path}"`);
        throw new Error();
      }
      Core_Map_GetOrDefault(map__downstream_to_upstream, this, () => new Set<Builder.File>()).add(upstream_file);
      Core_Map_GetOrDefault(map__upstream_to_downstream, upstream_file, () => new Set<Builder.File>()).add(this);
    }
    addUpstreamPath(upstream_path: string): void {
      if (upstream_path.startsWith(Builder.Dir.Src) === false) {
        _channel.error(`file "${upstream_path}" must be in src directory`);
        throw new Error();
      }
      const upstream_file = map__path_to_file.get(NodePlatform_Path_Slice(upstream_path, 1));
      if (upstream_file === undefined) {
        _channel.error(`file "${upstream_path}" does not exist`);
        throw new Error();
      }
      this.addUpstreamFile(upstream_file);
    }
    getDownstreamFiles(): Set<File> {
      return map__upstream_to_downstream.get(this) ?? new Set();
    }
    getUpstreamFiles(): Set<File> {
      return map__downstream_to_upstream.get(this) ?? new Set();
    }
    // Get cached contents or contents from file on disk as Uint8Array.
    async getBytes(): Promise<Uint8Array> {
      if (this.$data.bytes === undefined) {
        if (this.$data.text === undefined) {
          this.$data.bytes = await BunPlatform_File_Async_ReadBytes(this.src_path);
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
          this.$data.text = await BunPlatform_File_Async_ReadText(this.src_path);
        } else {
          this.$data.text = new TextDecoder().decode(this.$data.bytes);
          this.$data.bytes = undefined;
        }
      }
      return this.$data.text;
    }
    // Treats the file as both newly added and updated during the next Process phase.
    refresh(): void {
      set__unprocessed_files_to_add.add(this);
    }
    // Clears the cached contents and resets attributes.
    resetBytes(): void {
      this.isoriginal = true;
      this.ismodified = true;
      this.$data.bytes = undefined;
      this.$data.text = undefined;
    }
    // Set cached contents to Uint8Array.
    setBytes(bytes: Uint8Array): void {
      this.isoriginal = false;
      this.ismodified = true;
      this.$data.bytes = bytes;
      this.$data.text = undefined;
      set__unprocessed_files_to_update.add(this);
    }
    // Set cached contents to string.
    setText(text: string): void {
      this.isoriginal = false;
      this.ismodified = true;
      this.$data.bytes = undefined;
      this.$data.text = text;
      set__unprocessed_files_to_update.add(this);
    }
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

  export async function Start(): Promise<void> {
    Init();
  }
}

let _channel = Logger('Builder').newChannel();
let _mode = Builder.MODE.BUILD;
let _verbosity = Builder.VERBOSITY._1_LOG;

let array__startup_steps: Builder.Step[] = [];
let array__before_steps: Builder.Step[] = [];
let array__processor_modules: Builder.Processor[] = [];
let array__after_steps: Builder.Step[] = [];
let array__cleanup_steps: Builder.Step[] = [];

let map__path_to_file = new Map<string, Builder.File>();
let set__files = new Set<Builder.File>();
let set__paths = new Set<string>();

let map__downstream_to_upstream = new Map<Builder.File, Set<Builder.File>>();
let map__upstream_to_downstream = new Map<Builder.File, Set<Builder.File>>();

/**
 * use a state machine for the internal workings of the builder
 * use a message queue to supply the inputs to state machine
 */

type State = 'Init' | 'StartUp' | 'Process' | 'CleanUp' | 'Done' | 'Exit';
type Transition = 'Start' | 'Restart' | 'Process' | 'Quit' | 'Force_Quit' | 'Done' | 'Exit';

const state_machine: Record<State, Partial<Record<Transition, State>>> = {
  Init: {
    Start: 'StartUp',
  },
  StartUp: {
    Force_Quit: 'Exit',
    Process: 'Process',
    Quit: 'CleanUp',
  },
  Process: {
    Force_Quit: 'Exit',
    Process: 'Process',
    Quit: 'CleanUp',
  },
  CleanUp: {
    Done: 'Done',
  },
  Done: {},
  Exit: {},
};

let state: State = 'Init';
const array__transition_queue: Transition[] = [];
let index__transition_queue = 0;

let timeout_id: ReturnType<typeof setTimeout> | undefined = undefined;

function RequestTransition(request: Transition) {
  Log(`Transition "${request}" requested.`);
  if (array__transition_queue.at(-1) !== request) {
    array__transition_queue.push(request);
  }
  if (timeout_id !== undefined) {
    clearTimeout(timeout_id);
  }
  timeout_id = setTimeout(ProcessNextTransition, 50);
}

class MutEx {
  islocked = false;
  waitlist: Core_Type_Utility_Class_Defer<void>[] = [];
  lock(): boolean {
    if (this.islocked === false) {
      this.islocked = true;
      return true;
    }
    return false;
  }
  // async asyncLock(): Promise<void> {
  //   if (this.islocked === false) {
  //     this.islocked = true;
  //   } else {
  //     const defer = Core_Utility_Class_Defer();
  //     this.waitlist.push(defer);
  //     return defer.promise;
  //   }
  // }
  unlock(): void {
    if (this.islocked === true) {
      this.islocked = false;
      this.waitlist.shift()?.resolve();
    }
  }
}

const mutex = new MutEx();

async function ProcessNextTransition() {
  console.log('ProcessNextTransition');
  if (mutex.lock() === true) {
    while (index__transition_queue < array__transition_queue.length) {
      const requested_transition = array__transition_queue[index__transition_queue];
      index__transition_queue++;
      // Validate Transition
      const next_state = state_machine[state][requested_transition];
      if (requested_transition in state_machine[state] && next_state !== undefined) {
        const processing_state = state;
        Log(`Processing transition "${requested_transition}" on state "${processing_state}".`);
        state = next_state;
        switch (processing_state) {
          case 'Init':
            switch (requested_transition) {
              case 'Start':
                await StartUp();
                break;
            }
            break;
          case 'StartUp':
          case 'Process':
            switch (requested_transition) {
              case 'Force_Quit':
                await Exit();
                break;
              case 'Process':
                await Process();
                break;
              case 'Quit':
                await CleanUp();
                break;
            }
            break;
          case 'CleanUp':
            // no further functions
            break;
          case 'Done':
            // no valid transitions
            break;
          case 'Exit':
            // no valid transitions
            break;
        }
      } else {
        throw new Error(`Invalid transition "${requested_transition}" from state "${state}".`);
      }
    }
    array__transition_queue.length = 0;
    index__transition_queue = 0;
    mutex.unlock();
  }
}

const set__unprocessed_raw_paths = new Set<string>();
const set__unprocessed_files_to_add = new Set<Builder.File>();
const set__unprocessed_files_to_update = new Set<Builder.File>();

let unwatch_source_directory: () => void;
let unlock_stdin_reader: () => void;

async function Init() {
  Log('Init');

  // Secure Locks
  {
    FILESTATS.LockTable();
    CACHELOCK.TryLockEach(['Build', 'Format']);
  }
  RequestTransition('Start');
}

async function StartUp() {
  Log('StartUp');
  Log(_logs._phase_begin_('StartUp'));

  if (_mode === Builder.MODE.DEV) {
    // Setup Watcher
    {
      Log(_logs._watching_dir_(Builder.Dir.Src));
      unwatch_source_directory = NodePlatform_Directory_Watch(Builder.Dir.Src, (_, raw_path) => {
        set__unprocessed_raw_paths.add(raw_path);
        RequestTransition('Process');
      });
    }
  }

  // Setup Stdin Reader
  {
    unlock_stdin_reader = NodePlatform_Shell_StdIn_LockReader();
    NodePlatform_Shell_StdIn_AddListener(async (bytes, text, removeSelf) => {
      if (text == 'q') {
        removeSelf();
        Log(_logs._user_command_('Quit'));
        RequestTransition('Quit');
      }
    });
    NodePlatform_Shell_StdIn_AddListener((bytes, text, removeSelf) => {
      if (text === NodePlatform_Shell_Keys.SIGINT) {
        removeSelf();
        Log(_logs._user_command_('Force_Quit'));
        RequestTransition('Force_Quit');
        RequestTransition('Exit');
      }
    });
    NodePlatform_Shell_StdIn_StartReaderInRawMode();
  }

  // Scan Source Folder
  {
    Log(_logs._scanning_dir_(Builder.Dir.Src));
    for await (const raw_path of BunPlatform_Glob_AsyncGen_Scan(Builder.Dir.Src, '**/*')) {
      set__unprocessed_raw_paths.add(raw_path);
    }
  }

  // All Steps onStartUp
  for (const step of [...array__startup_steps, ...array__before_steps, ...array__after_steps, ...array__cleanup_steps]) {
    try {
      Log(_logs._step_onstartup_(step.StepName), Builder.VERBOSITY._2_DEBUG);
      await step.onStartUp?.();
    } catch (error) {
      Err(error, `Unhandled exception in ${step.StepName} onStartUp:`);
      throw new Error();
    }
  }

  // StartUp Steps onRun
  for (const step of array__startup_steps) {
    try {
      Log(_logs._step_onrun_(step.StepName), Builder.VERBOSITY._2_DEBUG);
      await step.onRun?.();
    } catch (error) {
      Err(error, `Unhandled exception in ${step.StepName} onRun:`);
      throw new Error();
    }
  }

  // All Processors onStartUp
  for (const processor of array__processor_modules) {
    try {
      Log(_logs._processor_onstartup_(processor.ProcessorName), Builder.VERBOSITY._2_DEBUG);
      await processor.onStartUp?.();
    } catch (error) {
      Err(error, `Unhandled exception in ${processor.ProcessorName} onStartUp:`);
      throw new Error();
    }
  }

  Log(_logs._phase_end_('StartUp'));

  RequestTransition('Process');

  if (_mode === Builder.MODE.BUILD) {
    RequestTransition('Quit');
  }
}

async function Process() {
  Log('Process');

  if (array__processor_modules.length === 0) {
    return;
  }

  Log(_logs._phase_begin_('Process'));

  let set__files_to_remove = new Set<Builder.File>();
  let set__files_to_add = new Set<Builder.File>(set__unprocessed_files_to_add);
  set__unprocessed_files_to_add.clear();
  let set__files_to_update = new Set<Builder.File>(set__unprocessed_files_to_update);
  set__unprocessed_files_to_update.clear();

  // Process Paths
  {
    let set__paths_to_remove = new Set<string>();
    let set__paths_to_add = new Set<string>();
    let set__paths_to_update = new Set<string>();

    const set__unprocessed_paths = new Set<string>();
    // Do this before awaiting any async stuff.
    {
      // Copy Unprocessed Paths
      for (const raw_path of set__unprocessed_raw_paths) {
        set__unprocessed_paths.add(NodePlatform_Path_Join(raw_path));
      }
      set__unprocessed_raw_paths.clear();
    }

    const set__paths_on_disk = new Set<string>();
    // Scan Existing Paths
    for await (const raw_path of BunPlatform_Glob_AsyncGen_Scan(Builder.Dir.Src, '**/*')) {
      set__paths_on_disk.add(NodePlatform_Path_Join(raw_path));
    }

    // if path exists in path set but not on disk, then path is newly removed
    // Get Removed Paths
    for (const path of set__paths.difference(set__paths_on_disk)) {
      set__paths_to_remove.add(path);
    }

    // if path exists on disk but not in path set, then path is newly added
    // Get Added Paths
    for (const path of set__paths_on_disk.difference(set__paths)) {
      const stats = await GetStats(NodePlatform_Path_Join(Builder.Dir.Src, path));
      if (stats !== undefined && stats.isFile() === true) {
        set__paths_to_add.add(path);
      }
    }

    // if path exists in unprocessed set and path set, then path is newly updated
    // Get Updated Paths
    for (const path of set__unprocessed_paths.intersection(set__paths)) {
      set__paths_to_update.add(path);
    }

    // Convert Paths into Files
    for (const path of set__paths_to_remove) {
      const file = map__path_to_file.get(NodePlatform_Path_Join(Builder.Dir.Src, path));
      if (file === undefined) {
        // TODO: doesn't exist
      } else {
        Log(_logs._file_removed_(path));
        set__files_to_remove.add(file);
      }
    }
    for (const path of set__paths_to_add) {
      const file = new Builder.File(NodePlatform_Path_Join(Builder.Dir.Src, path), NodePlatform_Path_Join(Builder.Dir.Out, path));
      map__path_to_file.set(path, file);
      set__files.add(file);
      set__paths.add(path);
      Log(_logs._file_added_(path));
      set__files_to_add.add(file);
    }
    for (const path of set__paths_to_update) {
      const file = map__path_to_file.get(NodePlatform_Path_Join(Builder.Dir.Src, path));
      if (file === undefined) {
        // TODO: doesn't exist
      } else {
        Log(_logs._file_updated_(path));
        set__files_to_update.add(file);
      }
    }
  }

  // Process Removed Files
  if (set__files_to_remove.size > 0) {
    for (const processor of array__processor_modules) {
      try {
        Log(_logs._processor_onremove_(processor.ProcessorName), Builder.VERBOSITY._2_DEBUG);
        await processor.onRemove?.(set__files_to_remove);
      } catch (error) {
        Err(error, `Unhandled exception in ${processor.ProcessorName} onRemove:`);
        throw new Error();
      }
    }
  }

  // Process Added Files
  if (set__files_to_add.size > 0) {
    for (const file of set__files_to_add) {
      file.resetBytes();
      set__files_to_update.add(file);
    }
    for (const processor of array__processor_modules) {
      try {
        Log(_logs._processor_onadd_(processor.ProcessorName), Builder.VERBOSITY._2_DEBUG);
        await processor.onAdd?.(set__files_to_add);
      } catch (error) {
        Err(error, `Unhandled exception in ${processor.ProcessorName} onAdd:`);
        throw new Error();
      }
    }
  }

  // Process Updated Files
  if (set__files_to_update.size > 0) {
    // Before Steps onRun
    for (const step of array__before_steps) {
      try {
        Log(_logs._step_onrun_(step.StepName), Builder.VERBOSITY._2_DEBUG);
        await step.onRun?.();
      } catch (error) {
        Err(error, `Unhandled exception in ${step.StepName} onRun:`);
        throw new Error();
      }
    }

    // Processor Modules onProcess
    const set__unprocessed_files = new Set<Builder.File>();
    for (const file of set__files_to_update) {
      file.resetBytes();
      set__unprocessed_files.add(file);
      for (const downstream_file of file.getDownstreamFiles()) {
        downstream_file.resetBytes();
        set__unprocessed_files.add(downstream_file);
      }
    }
    while (set__unprocessed_files.size > 0) {
      const task_fns: (() => Promise<void>)[] = [];
      outer: for (const file of set__unprocessed_files) {
        for (const upstream of file.getUpstreamFiles()) {
          if (set__unprocessed_files.has(upstream)) {
            continue outer;
          }
        }
        task_fns.push(async () => {
          for (const { processor, method } of file.$processor_list) {
            try {
              Log(_logs._processor_onprocess_(processor.ProcessorName, file.src_path), Builder.VERBOSITY._2_DEBUG);
              await method.call(processor, file);
            } catch (error) {
              Err(error, `Unhandled exception in ${processor.ProcessorName} for "${file.src_path}":`);
              // throw new Error();
            }
          }
          set__unprocessed_files.delete(file);
        });
      }
      const task_promises: Promise<void>[] = [];
      for (const fn of task_fns) {
        task_promises.push(fn());
      }
      await Promise.all(task_promises);
    }

    // Write Files
    for (const file of set__files_to_update) {
      if (file.iswritable === true && file.ismodified === true) {
        if (file.$data.text !== undefined) {
          await BunPlatform_File_Async_WriteText(file.out_path, file.$data.text);
        } else {
          await BunPlatform_File_Async_WriteBytes(file.out_path, await file.getBytes());
        }
        file.ismodified = false;
      }
    }

    // After Steps onRun
    for (const step of array__after_steps) {
      try {
        Log(_logs._step_onrun_(step.StepName), Builder.VERBOSITY._2_DEBUG);
        await step.onRun?.();
      } catch (error) {
        Err(error, `Unhandled exception in ${step.StepName} onRun:`);
        throw new Error();
      }
    }
  }

  Log(_logs._phase_end_('Process'));
  _channel.newLine();
}

async function CleanUp() {
  Log('CleanUp');
  Log(_logs._phase_begin_('CleanUp'));

  if (_mode === Builder.MODE.DEV) {
    unwatch_source_directory();
  }

  // All Processors onCleanUp
  for (const processor of array__processor_modules) {
    try {
      Log(_logs._processor_oncleanup_(processor.ProcessorName), Builder.VERBOSITY._2_DEBUG);
      await processor.onCleanUp?.();
    } catch (error) {
      Err(error, `Unhandled exception in ${processor.ProcessorName} onCleanUp:`);
      throw new Error();
    }
  }

  // CleanUp Steps onRun
  for (const step of array__cleanup_steps) {
    try {
      Log(_logs._step_onrun_(step.StepName), Builder.VERBOSITY._2_DEBUG);
      await step.onRun?.();
    } catch (error) {
      Err(error, `Unhandled exception in ${step.StepName} onRun:`);
      throw new Error();
    }
  }

  // All Steps onCleanUp
  for (const step of [...array__startup_steps, ...array__before_steps, ...array__after_steps, ...array__cleanup_steps]) {
    try {
      Log(_logs._step_oncleanup_(step.StepName), Builder.VERBOSITY._2_DEBUG);
      await step.onCleanUp?.();
    } catch (error) {
      Err(error, `Unhandled exception in ${step.StepName} onCleanUp:`);
      throw new Error();
    }
  }

  Log(_logs._phase_end_('CleanUp'));

  unlock_stdin_reader();

  // Release Locks
  {
    CACHELOCK.UnlockEach(['Build', 'Format']);
    FILESTATS.UnlockTable();
  }

  RequestTransition('Done');
}

async function Exit() {
  Log('Exit');
  if (_mode === Builder.MODE.DEV) {
    unwatch_source_directory();
  }

  unlock_stdin_reader();

  // Release Locks
  {
    CACHELOCK.UnlockEach(['Build', 'Format']);
    FILESTATS.UnlockTable();
  }

  process.exit();
}

async function GetStats(path: string): Promise<NODE_FS.Stats | undefined> {
  try {
    return await NodePlatform_Path_Async_GetStats(path);
  } catch (error) {
    return undefined;
  }
}

function Log(text: string, verbosity = Builder.VERBOSITY._1_LOG) {
  if (_verbosity >= verbosity) {
    _channel.log(text);
  }
}

function Err(error: any, text: string) {
  _channel.error(error, text);
}
