import treekill from 'tree-kill';
import { Async_BunPlatform_File_Read_Bytes } from '../../src/lib/ericchase/BunPlatform_File_Read_Bytes.js';
import { Async_BunPlatform_File_Read_Text } from '../../src/lib/ericchase/BunPlatform_File_Read_Text.js';
import { Async_BunPlatform_File_Write_Bytes } from '../../src/lib/ericchase/BunPlatform_File_Write_Bytes.js';
import { Async_BunPlatform_File_Write_Text } from '../../src/lib/ericchase/BunPlatform_File_Write_Text.js';
import { Core_Console_Error } from '../../src/lib/ericchase/Core_Console_Error.js';
import { Core_Map_Get_Or_Default } from '../../src/lib/ericchase/Core_Map_Get_Or_Default.js';
import { Class_Core_Promise_Deferred_Class, Core_Promise_Deferred_Class } from '../../src/lib/ericchase/Core_Promise_Deferred_Class.js';
import { Core_String_Split_Lines } from '../../src/lib/ericchase/Core_String_Split_Lines.js';
import { Core_Utility_Decode_Bytes } from '../../src/lib/ericchase/Core_Utility_Decode_Bytes.js';
import { NODE_PATH } from '../../src/lib/ericchase/NodePlatform.js';
import { Async_NodePlatform_File_Delete } from '../../src/lib/ericchase/NodePlatform_File_Delete.js';
import { NodePlatform_PathObject_Relative_Class } from '../../src/lib/ericchase/NodePlatform_PathObject_Relative_Class.js';
import { NodePlatform_Shell_Keys } from '../../src/lib/ericchase/NodePlatform_Shell_Keys.js';
import { NodePlatform_Shell_StdIn_AddListener, NodePlatform_Shell_StdIn_LockReader, NodePlatform_Shell_StdIn_StartReaderInRawMode } from '../../src/lib/ericchase/NodePlatform_Shell_StdIn.js';
import { CACHELOCK, Cacher_Watch_Directory, FILESTATS } from './Cacher.js';
import { AddLoggerOutputDirectory, Logger, WaitForLogger } from './Logger.js';

await AddLoggerOutputDirectory('cache');

namespace _errors {
  export const _dependency_cycle_ = (p0: string, p1: string) => `Dependency Cycle: Between upstream "${p0}" and downstream "${p1}"!`;
  export const _dependency_cycle_self_ = (p0: string) => `Dependency Cycle: "${p0}" - A file cannot depend on itself!`;
  export const _path_does_not_exist_ = (p0: string) => `Path "${p0}" does not exist!`;
  export const _upstream_does_not_exist_ = (p0: string) => `Upstream path "${p0}" does not exist!`;
  export const _upstream_not_in_src_ = (p0: string) => `Upstream path "${p0}" must reside in src directory!`;
}
namespace _logs {
  export const _file_added_ = (p0: string) => `[added] "${p0}"`;
  export const _file_deleted_ = (p0: string) => `[removed] "${p0}"`;
  export const _file_modified_ = (p0: string) => `[modified] "${p0}"`;
  export const _file_refresh_ = (p0: string) => `[refresh] "${p0}"`;
  export const _file_set_bytes_ = (p0: string) => `[set-bytes] "${p0}"`;
  export const _file_set_text_ = (p0: string) => `[set-text] "${p0}"`;
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
    static Get(path: string) {
      return map__path_to_file.get(path);
    }

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
    iswritable = false;
    addProcessor(processor: Builder.Processor, method: Builder.ProcessorMethod): void {
      this.$processor_list.push({ processor, method });
    }
    addUpstreamFile(upstream_file: File): void {
      if (upstream_file === this) {
        // ignore
        // _channel.error(undefined, _errors._dependency_cycle_self_(upstream_file.src_path));
        // throw new Error(_errors._dependency_cycle_self_(upstream_file.src_path));
      } else {
        if (map__downstream_to_upstream.get(upstream_file)?.has(this)) {
          _channel.error(undefined, _errors._dependency_cycle_(upstream_file.src_path, this.src_path));
          throw new Error(_errors._dependency_cycle_(upstream_file.src_path, this.src_path));
        } else {
          Core_Map_Get_Or_Default(map__downstream_to_upstream, this, () => new Set<Builder.File>()).add(upstream_file);
          Core_Map_Get_Or_Default(map__upstream_to_downstream, upstream_file, () => new Set<Builder.File>()).add(this);
        }
      }
    }
    addUpstreamPath(upstream_path: string): void {
      const relative_pathobject = NodePlatform_PathObject_Relative_Class(upstream_path);
      const path = relative_pathobject.join();
      if (path.startsWith(Builder.Dir.Src) !== true) {
        _channel.error(undefined, _errors._upstream_not_in_src_(path));
        throw new Error(_errors._upstream_not_in_src_(path));
      } else {
        const upstream_file = map__path_to_file.get(path);
        if (upstream_file === undefined) {
          _channel.error(undefined, _errors._upstream_does_not_exist_(path));
          throw new Error(_errors._upstream_does_not_exist_(path));
        } else {
          this.addUpstreamFile(upstream_file);
        }
      }
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
          const { error, value: bytes } = await Async_BunPlatform_File_Read_Bytes(this.src_path);
          if (bytes !== undefined) {
            this.$data.bytes = bytes;
          } else {
            throw error;
          }
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
          const { error, value: text } = await Async_BunPlatform_File_Read_Text(this.src_path);
          if (text !== undefined) {
            this.$data.text = text;
          } else {
            Err(error, _errors._path_does_not_exist_(this.src_path));
            throw new Error();
          }
        } else {
          this.$data.text = new TextDecoder().decode(this.$data.bytes);
          this.$data.bytes = undefined;
        }
      }
      return this.$data.text;
    }
    // Treats the file as modified during the next Process phase.
    refresh(): void {
      Log(_logs._file_refresh_(this.src_path), VERBOSITY._2_DEBUG);
      set__modified_paths.add(this.src_path);
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
      Log(_logs._file_set_bytes_(this.src_path), VERBOSITY._2_DEBUG);
      this.isoriginal = false;
      this.ismodified = true;
      this.$data.bytes = bytes;
      this.$data.text = undefined;
    }
    // Set cached contents to string.
    setText(text: string): void {
      Log(_logs._file_set_text_(this.src_path), VERBOSITY._2_DEBUG);
      this.isoriginal = false;
      this.ismodified = true;
      this.$data.bytes = undefined;
      this.$data.text = text;
    }
  }

  export let Dir = {
    get Lib() {
      return _dir_lib;
    },
    set Lib(path: string) {
      _dir_lib = NODE_PATH.join(path);
    },
    get Out() {
      return _dir_out;
    },
    set Out(path: string) {
      _dir_out = NODE_PATH.join(path);
    },
    get Src() {
      return _dir_src;
    },
    set Src(path: string) {
      _dir_src = NODE_PATH.join(path);
    },
    get Tools() {
      return _dir_tools;
    },
    set Tools(path: string) {
      _dir_tools = NODE_PATH.join(path);
    },
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
    await Init();
  }
}

let _dir_lib = 'src/lib';
let _dir_out = 'out';
let _dir_src = 'src';
let _dir_tools = 'tools';

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

const set__added_paths = new Set<string>();
const set__deleted_paths = new Set<string>();
const set__modified_paths = new Set<string>();

const set__error_paths = new Set<string>();

let unwatch_source_directory: () => void;
let unlock_stdin_reader: () => void;
let busytask: Class_Core_Promise_Deferred_Class<void> | undefined = undefined;
let quitting = false;

async function Init() {
  busytask = Core_Promise_Deferred_Class();
  // Secure Locks
  {
    FILESTATS.LockTable();
    CACHELOCK.TryLockEach(['Build', 'Format']);
  }
  // Setup Stdin Reader
  {
    unlock_stdin_reader = NodePlatform_Shell_StdIn_LockReader();
    NodePlatform_Shell_StdIn_AddListener(async (bytes, text, removeSelf) => {
      if (text === 'q') {
        removeSelf();
        Log(_logs._user_command_('Quit'));
        await busytask?.promise;
        await Async_CleanUp();
      }
    });
    NodePlatform_Shell_StdIn_AddListener(async (bytes, text, removeSelf) => {
      if (text === NodePlatform_Shell_Keys.SIGINT) {
        removeSelf();
        Log(_logs._user_command_('ForceQuit'));
        await ForceQuit();
      }
    });
    NodePlatform_Shell_StdIn_StartReaderInRawMode();
  }
  await Async_ScanSourceFolder();
  await Async_StartUp();
  await Async_BeforeSteps();
  await Async_Process();
  await Async_AfterSteps();
  switch (_mode) {
    case Builder.MODE.BUILD:
      await Async_CleanUp();
      break;
    case Builder.MODE.DEV:
      unwatch_source_directory?.();
      SetupWatcher();
      NodePlatform_Shell_StdIn_AddListener(async (bytes, text, removeSelf) => {
        if (text === 'r') {
          busytask = Core_Promise_Deferred_Class();
          await Async_ScanSourceFolder();
          await Async_BeforeSteps();
          await Async_Process();
          await Async_AfterSteps();
          unwatch_source_directory?.();
          SetupWatcher();
          busytask.resolve();
          busytask = undefined;
        }
      });
      break;
  }
  busytask.resolve();
  busytask = undefined;
}

async function Async_ScanSourceFolder() {
  Log(_logs._scanning_dir_(Builder.Dir.Src));
  for (const subpath of await Array.fromAsync(
    new Bun.Glob('**/*').scan({
      absolute: false,
      cwd: Builder.Dir.Src,
      dot: true,
      followSymlinks: false,
      onlyFiles: true,
      throwErrorOnBrokenSymlink: false,
    }),
  )) {
    const path = NODE_PATH.join(Builder.Dir.Src, subpath);
    set__added_paths.add(path);
    await FILESTATS.UpdateStats(path);
  }
}

function SetupWatcher() {
  unwatch_source_directory = Cacher_Watch_Directory(Builder.Dir.Src, 250, async (added, deleted, modified) => {
    if (quitting === false) {
      for (const path of added) {
        set__added_paths.add(path);
      }
      for (const path of deleted) {
        set__deleted_paths.add(path);
      }
      for (const path of modified) {
        set__modified_paths.add(path);
      }
      if (set__added_paths.size > 0 || set__deleted_paths.size > 0 || set__modified_paths.size > 0) {
        for (const path of set__error_paths) {
          set__added_paths.add(path);
          set__deleted_paths.add(path);
          set__modified_paths.add(path);
        }
        set__error_paths.clear();
        busytask = Core_Promise_Deferred_Class();
        await Async_BeforeSteps();
        await Async_Process();
        await Async_AfterSteps();
        busytask.resolve();
        busytask = undefined;
      }
    }
  });
}

async function Async_StartUp() {
  Log(_logs._phase_begin_('StartUp'));

  // All Steps onStartUp
  for (const step of [...array__startup_steps, ...array__before_steps, ...array__after_steps, ...array__cleanup_steps]) {
    try {
      Log(_logs._step_onstartup_(step.StepName), Builder.VERBOSITY._2_DEBUG);
      await step.onStartUp?.();
    } catch (error) {
      Err(error, `Unhandled exception in ${step.StepName} onStartUp:`);
      throw error;
    }
  }

  // StartUp Steps onRun
  for (const step of array__startup_steps) {
    try {
      Log(_logs._step_onrun_(step.StepName), Builder.VERBOSITY._2_DEBUG);
      await step.onRun?.();
    } catch (error) {
      Err(error, `Unhandled exception in ${step.StepName} onRun:`);
      throw error;
    }
  }

  // Processor Modules onStartUp
  for (const processor of array__processor_modules) {
    try {
      Log(_logs._processor_onstartup_(processor.ProcessorName), Builder.VERBOSITY._2_DEBUG);
      await processor.onStartUp?.();
    } catch (error) {
      Err(error, `Unhandled exception in ${processor.ProcessorName} onStartUp:`);
      throw error;
    }
  }

  Log(_logs._phase_end_('StartUp'));
  _channel.newLine();
}

async function Async_BeforeSteps() {
  Log(_logs._phase_begin_('BeforeSteps'));

  for (const step of array__before_steps) {
    try {
      Log(_logs._step_onrun_(step.StepName), Builder.VERBOSITY._2_DEBUG);
      await step.onRun?.();
    } catch (error) {
      Err(error, `Unhandled exception in ${step.StepName} onRun:`);
      throw error;
    }
  }

  Log(_logs._phase_end_('BeforeSteps'));
  _channel.newLine();
}

async function Async_Process() {
  Log(_logs._phase_begin_('Process'));

  const set__files_to_remove = new Set<Builder.File>();
  const set__files_to_add = new Set<Builder.File>();
  const set__files_to_update = new Set<Builder.File>();

  let caught_error = false;

  // Process Removed Files
  {
    for (const path of set__deleted_paths) {
      const file = map__path_to_file.get(path);
      if (file !== undefined) {
        set__files_to_remove.add(file);
      } else {
        Log(_errors._path_does_not_exist_(path));
      }
    }
    set__deleted_paths.clear();
    if (set__files_to_remove.size > 0) {
      // Processor Modules onRemove
      for (const processor of array__processor_modules) {
        try {
          Log(_logs._processor_onremove_(processor.ProcessorName), Builder.VERBOSITY._2_DEBUG);
          await processor.onRemove?.(set__files_to_remove);
        } catch (error) {
          Err(error, `Unhandled exception in ${processor.ProcessorName} onRemove:`);
          caught_error = true;
        }
      }
      for (const file of set__files_to_remove) {
        map__path_to_file.delete(file.src_path);
        set__files.delete(file);
        set__paths.delete(file.src_path);
        await Async_NodePlatform_File_Delete(file.out_path);
        Log(_logs._file_deleted_(file.src_path), Builder.VERBOSITY._1_LOG);
      }
    }
  }

  // Process Added Files
  {
    for (const path of set__added_paths) {
      const file = Core_Map_Get_Or_Default(map__path_to_file, path, () => {
        const new_file = new Builder.File(path, NODE_PATH.join(Builder.Dir.Out, NODE_PATH.relative(Builder.Dir.Src, path)));
        set__files.add(new_file);
        set__paths.add(path);
        Log(_logs._file_added_(path), Builder.VERBOSITY._1_LOG);
        return new_file;
      });
      set__files_to_add.add(file);
      set__files_to_update.add(file);
    }
    set__added_paths.clear();
    if (set__files_to_add.size > 0) {
      // Processor Modules onAdd
      for (const processor of array__processor_modules) {
        try {
          Log(_logs._processor_onadd_(processor.ProcessorName), Builder.VERBOSITY._2_DEBUG);
          await processor.onAdd?.(set__files_to_add);
        } catch (error) {
          Err(error, `Unhandled exception in ${processor.ProcessorName} onAdd:`);
          caught_error = true;
        }
      }
      // Processor Modules onProcess
      for (const file of set__files_to_add) {
        file.resetBytes();
        for (const { processor, method } of file.$processor_list) {
          try {
            Log(_logs._processor_onprocess_(processor.ProcessorName, file.src_path), Builder.VERBOSITY._2_DEBUG);
            await method.call(processor, file);
          } catch (error) {
            Err(error, `Unhandled exception in ${processor.ProcessorName} for "${file.src_path}":`);
            caught_error = true;
          }
        }
      }
      // Write Files
      for (const file of set__files_to_add) {
        if (file.iswritable === true) {
          if (file.$data.text !== undefined) {
            await Async_BunPlatform_File_Write_Text(file.out_path, file.$data.text);
          } else {
            await Async_BunPlatform_File_Write_Bytes(file.out_path, await file.getBytes());
          }
          file.ismodified = false;
        }
      }
    }
  }

  // Process Updated Files
  {
    for (const path of set__modified_paths) {
      const file = map__path_to_file.get(path);
      if (file !== undefined) {
        Log(_logs._file_modified_(path), Builder.VERBOSITY._1_LOG);
        set__files_to_update.add(file);
      } else {
        Log(_errors._path_does_not_exist_(path));
      }
    }
    set__modified_paths.clear();
    if (set__files_to_update.size > 0) {
      // Processor Modules onProcess
      const set__unprocessed_files = new Set<Builder.File>();
      for (const file of set__files_to_update) {
        file.resetBytes();
        set__unprocessed_files.add(file);
        for (const downstream_file of file.getDownstreamFiles()) {
          downstream_file.resetBytes();
          set__unprocessed_files.add(downstream_file);
          set__files_to_update.add(downstream_file);
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
                caught_error = true;
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
            await Async_BunPlatform_File_Write_Text(file.out_path, file.$data.text);
          } else {
            await Async_BunPlatform_File_Write_Bytes(file.out_path, await file.getBytes());
          }
          file.ismodified = false;
        }
      }
    }
  }

  Log(_logs._phase_end_('Process'));
  _channel.newLine();

  if (caught_error === true) {
    for (const path of set__added_paths.union(set__deleted_paths).union(set__modified_paths)) {
      set__error_paths.add(path);
    }
    set__deleted_paths.clear();
    set__added_paths.clear();
    set__modified_paths.clear();
  } else if (set__added_paths.size > 0 || set__deleted_paths.size > 0 || set__modified_paths.size > 0) {
    await Async_Process();
  }
}

async function Async_AfterSteps() {
  Log(_logs._phase_begin_('AfterSteps'));

  for (const step of array__after_steps) {
    try {
      Log(_logs._step_onrun_(step.StepName), Builder.VERBOSITY._2_DEBUG);
      await step.onRun?.();
    } catch (error) {
      Err(error, `Unhandled exception in ${step.StepName} onRun:`);
      throw error;
    }
  }

  Log(_logs._phase_end_('AfterSteps'));
  _channel.newLine();
}

async function Async_CleanUp() {
  Log(_logs._phase_begin_('CleanUp'));

  quitting = true;

  unwatch_source_directory?.();

  // Processor Modules onCleanUp
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

  // Release Locks
  {
    CACHELOCK.UnlockEach(['Build', 'Format']);
    FILESTATS.UnlockTable();
  }

  Log(_logs._phase_end_('CleanUp'));
  _channel.newLine();

  unlock_stdin_reader?.();
  await KillChildren();
  await WaitForLogger();
  process.exit();
}

async function ForceQuit() {
  Log('ForceQuit');

  unwatch_source_directory?.();

  // Release Locks
  {
    CACHELOCK.UnlockEach(['Build', 'Format']);
    FILESTATS.UnlockTable();
  }

  unlock_stdin_reader?.();
  await KillChildren();
  process.exit();
}

function Log(text: string, verbosity = Builder.VERBOSITY._1_LOG) {
  if (_verbosity >= verbosity) {
    _channel.log(text);
  }
}

function Err(error: any, text: string) {
  _channel.error(error, text);
}

function GetChildrenPIDs(pid: number) {
  const { stdout: bytes } = Bun.spawnSync(['pgrep', '-P', `${pid}`], { stdout: 'pipe' });
  const stdout = Core_Utility_Decode_Bytes(bytes);
  return Core_String_Split_Lines(stdout, true).map((pid) => Number.parseInt(pid));
}

async function KillChildren() {
  if (process.platform !== 'win32') {
    try {
      const pids = GetChildrenPIDs(process.pid);
      for (const pid of pids) {
        pids.push(...GetChildrenPIDs(pid));
      }
      const tasks: Promise<string>[] = [];
      for (const pid of pids) {
        tasks.push(KillProcess(pid));
      }
      for (const task of await Promise.allSettled(tasks)) {
        if (task.status === 'rejected') {
          Core_Console_Error(task.reason);
        }
      }
    } catch (error) {
      Core_Console_Error(error);
    }
  }
}

function KillProcess(pid: number) {
  return new Promise<string>((resolve, reject) => {
    treekill(pid, 'SIGKILL', (error) => {
      if (error) {
        reject(error);
      } else {
        resolve(`Killed PID ${pid}`);
      }
    });
  });
}
