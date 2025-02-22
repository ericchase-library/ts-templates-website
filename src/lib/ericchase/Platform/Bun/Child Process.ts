import type { Subprocess, SyncSubprocess } from 'bun';

import { ConsoleLogWithDate } from '../../Utility/Console.js';

type FlagChain<T> = {
  (...cmds: string[]): T;
  /** Prepends the run command with "bun". */
  Bun: FlagChain<T>;
  /**
   * Prepends the run command with "bun run".
   *
   * Overrides the `Bun` flag.
   **/
  BunRun: FlagChain<T>;
  /**
   * Sets the child process' `stdout` and `stderr` to "ignore" mode.
   *
   * The runner header will still be logged.
   **/
  Quiet: FlagChain<T>;
  /**
   * Sets the child process' `stdout` and `stderr` to "ignore" mode.
   *
   * The run header will **not** be logged.
   **/
  Silent: FlagChain<T>;
};

type RunnerFlag = 'Bun' | 'BunRun' | 'Quiet' | 'Silent';

type SpawnerFlag = 'Bun' | 'BunRun' | 'Silent';

function logRunnerHeader(cmds: string[]) {
  ConsoleLogWithDate(`> ${cmds.map((s) => (s.includes(' ') ? `"${s}"` : s)).join(' ')}`);
}

// Flags Parser Functions
function parseCommand(args: { cmds: string[]; flags: Set<'BunRun' | 'Bun'> }) {
  if (args.flags.has('BunRun')) {
    return ['bun', 'run', ...args.cmds];
  }
  if (args.flags.has('Bun')) {
    return ['bun', ...args.cmds];
  }
  return args.cmds;
}
function parseRunnerFlags(args: { cmds: string[]; flags: Set<RunnerFlag> }): { cmds: string[]; mode: 'inherit' | 'ignore' } {
  const cmds = parseCommand(args as { cmds: string[]; flags: Set<'BunRun' | 'Bun'> });
  const mode = args.flags.has('Quiet') || args.flags.has('Silent') ? 'ignore' : 'inherit';
  if (!args.flags.has('Silent')) logRunnerHeader(cmds);
  return { cmds, mode };
}
function parseSpawnerFlags(args: { cmds: string[]; flags: Set<SpawnerFlag> }): { cmds: string[] } {
  const cmds = parseCommand(args as { cmds: string[]; flags: Set<'BunRun' | 'Bun'> });
  if (!args.flags.has('Silent')) logRunnerHeader(cmds);
  return { cmds };
}

function takeFlags<T>(flags: Set<T>) {
  try {
    return new Set(flags);
  } finally {
    flags.clear();
  }
}

// Chain Functions
function runnerChain(flags = new Set<RunnerFlag>()) {
  const instance = new Proxy((...cmds: string[]) => runner({ cmds, flags: takeFlags(flags) }), {
    get: (_, flag: RunnerFlag) => runnerChain(flags.add(flag)),
    apply: (_, __, cmds) => runner({ cmds, flags: takeFlags(flags) }),
  });
  return instance;
}
function runnerChainSync(flags = new Set<RunnerFlag>()) {
  const instance = new Proxy((...cmds: string[]) => runnerSync({ cmds, flags: takeFlags(flags) }), {
    get: (_, flag: RunnerFlag) => runnerChainSync(flags.add(flag)),
    apply: (_, __, cmds) => runnerSync({ cmds, flags: takeFlags(flags) }),
  });
  return instance;
}
function spawnerChain(flags = new Set<Exclude<SpawnerFlag, 'Quiet'>>()) {
  const instance = new Proxy((...cmds: string[]) => spawner({ cmds, flags: takeFlags(flags) }), {
    get: (_, flag: SpawnerFlag) => spawnerChain(flags.add(flag)),
    apply: (_, __, cmds) => spawner({ cmds, flags: takeFlags(flags) }),
  });
  return instance;
}
function spawnerChainSync(flags = new Set<SpawnerFlag>()) {
  const instance = new Proxy((...cmds: string[]) => spawnerSync({ cmds, flags: takeFlags(flags) }), {
    get: (_, flag: SpawnerFlag) => spawnerChainSync(flags.add(flag)),
    apply: (_, __, cmds) => spawnerSync({ cmds, flags: takeFlags(flags) }),
  });
  return instance;
}

// Bun.spawn Functions
function runner(args: { cmds: string[]; flags: Set<RunnerFlag> }) {
  const { cmds, mode } = parseRunnerFlags(args);
  return Bun.spawn(cmds, { stdin: 'inherit', stdout: mode, stderr: mode });
}
function runnerSync(args: { cmds: string[]; flags: Set<RunnerFlag> }) {
  const { cmds, mode } = parseRunnerFlags(args);
  return Bun.spawnSync(cmds, { stdin: 'inherit', stdout: mode, stderr: mode });
}
function spawner(args: { cmds: string[]; flags: Set<SpawnerFlag> }) {
  const { cmds } = parseSpawnerFlags(args);
  return Bun.spawn(cmds, { stdin: 'pipe', stdout: 'pipe', stderr: 'pipe' });
}
function spawnerSync(args: { cmds: string[]; flags: Set<SpawnerFlag> }) {
  const { cmds } = parseSpawnerFlags(args);
  return Bun.spawnSync(cmds, { stdout: 'pipe', stderr: 'pipe' });
}

export type SpawnerSubprocess = Subprocess<'pipe', 'pipe', 'pipe'>;
export type SpawnerSyncSubprocess = SyncSubprocess<'pipe', 'pipe'>;

export const Run = runnerChain() as FlagChain<Subprocess<'inherit', 'inherit' | 'ignore', 'inherit' | 'ignore'>>;
export const RunSync = runnerChainSync() as FlagChain<SyncSubprocess<'inherit' | 'ignore', 'inherit' | 'ignore'>>;
export const Spawn = spawnerChain() as FlagChain<Subprocess<'pipe', 'pipe', 'pipe'>>;
export const SpawnSync = spawnerChainSync() as FlagChain<SyncSubprocess<'pipe', 'pipe'>>;
