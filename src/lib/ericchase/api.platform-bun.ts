import { Core_Stream_Uint8_Async_Compare } from './api.core.js';
import { NodePlatform_Directory_Async_Create, NodePlatform_Path_GetParentPath, NodePlatform_Path_Join } from './api.platform-node.js';

// Exports

export function BunPlatform_Args_Has(arg: string): boolean {
  return Bun.argv.includes(arg);
}

export function BunPlatform_File_Async_Compare(frompath: string, topath: string): Promise<boolean> {
  return Core_Stream_Uint8_Async_Compare(Bun.file(NodePlatform_Path_Join(frompath)).stream(), Bun.file(NodePlatform_Path_Join(topath)).stream());
}

export async function BunPlatform_File_Async_Copy(frompath: string, topath: string, overwrite = false): Promise<boolean> {
  if (NodePlatform_Path_Join(frompath) === NodePlatform_Path_Join(topath)) {
    return false;
  }
  if (overwrite !== true && (await Bun.file(NodePlatform_Path_Join(topath)).exists()) === true) {
    return false;
  }
  await Bun.write(Bun.file(NodePlatform_Path_Join(topath)), Bun.file(NodePlatform_Path_Join(frompath)));
  return BunPlatform_File_Async_Compare(NodePlatform_Path_Join(frompath), NodePlatform_Path_Join(topath));
}

export async function BunPlatform_File_Async_Delete(path: string): Promise<boolean> {
  await Bun.file(NodePlatform_Path_Join(path)).delete();
  return (await Bun.file(NodePlatform_Path_Join(path)).exists()) === false;
}

export async function BunPlatform_File_Async_Move(frompath: string, topath: string, overwrite = false): Promise<boolean> {
  if (NodePlatform_Path_Join(frompath) === NodePlatform_Path_Join(topath)) {
    return false;
  }
  if (overwrite !== true && (await Bun.file(NodePlatform_Path_Join(topath)).exists()) === true) {
    return false;
  }
  await Bun.write(Bun.file(NodePlatform_Path_Join(topath)), Bun.file(NodePlatform_Path_Join(frompath)));
  if ((await BunPlatform_File_Async_Compare(NodePlatform_Path_Join(frompath), NodePlatform_Path_Join(topath))) === false) {
    return false;
  }
  return BunPlatform_File_Async_Delete(NodePlatform_Path_Join(frompath));
}

export function BunPlatform_File_Async_ReadBytes(path: string): Promise<Uint8Array> {
  return Bun.file(NodePlatform_Path_Join(path)).bytes();
}

export function BunPlatform_File_Async_ReadText(path: string): Promise<string> {
  return Bun.file(NodePlatform_Path_Join(path)).text();
}

export async function BunPlatform_File_Async_WriteBytes(path: string, bytes: Uint8Array, createpath = true): Promise<number> {
  if (createpath === true) {
    await NodePlatform_Directory_Async_Create(NodePlatform_Path_GetParentPath(NodePlatform_Path_Join(path)));
  }
  return Bun.write(NodePlatform_Path_Join(path), bytes);
}

export async function BunPlatform_File_Async_WriteText(path: string, text: string, createpath = true): Promise<number> {
  if (createpath === true) {
    await NodePlatform_Directory_Async_Create(NodePlatform_Path_GetParentPath(NodePlatform_Path_Join(path)));
  }
  return Bun.write(NodePlatform_Path_Join(path), text);
}

export async function* BunPlatform_Glob_AsyncGen_Scan(path: string, pattern: string, options?: { absolutepaths?: boolean; onlyfiles?: boolean }): AsyncGenerator<string> {
  for await (const value of new Bun.Glob(pattern).scan({
    absolute: options?.absolutepaths ?? false,
    cwd: NodePlatform_Path_Join(path),
    dot: true,
    onlyFiles: options?.onlyfiles ?? true,
  })) {
    yield value;
  }
}

export async function BunPlatform_Glob_Ex_Async_Scan(path: string, include_patterns: string[], exclude_patterns: string[], options?: { absolutepaths?: boolean; onlyfiles?: boolean }): Promise<Set<string>> {
  const included: string[] = [];
  for (const pattern of include_patterns) {
    included.push(...(await Array.fromAsync(BunPlatform_Glob_AsyncGen_Scan(path, pattern, options))));
  }
  const excluded: string[] = [];
  for (const pattern of exclude_patterns) {
    excluded.push(...(await Array.fromAsync(BunPlatform_Glob_AsyncGen_Scan(path, pattern, options))));
  }
  return new Set(included).difference(new Set(excluded));
}

export function BunPlatform_Glob_Ex_Match(query: string, include_patterns: string[], exclude_patterns: string[]): boolean {
  let matched = false;
  for (const pattern of include_patterns) {
    if (BunPlatform_Glob_Match(query, pattern) === true) {
      matched = true;
      break;
    }
  }
  for (const pattern of exclude_patterns) {
    if (BunPlatform_Glob_Match(query, pattern) === true) {
      matched = false;
      break;
    }
  }
  return matched;
}

export function BunPlatform_Glob_Match(query: string, pattern: string): boolean {
  return new Bun.Glob(pattern).match(query);
}
