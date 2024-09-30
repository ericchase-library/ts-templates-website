import type { BunFile } from 'bun';
import node_fs from 'node:fs';
import { U8StreamCompare } from '../../Algorithm/Stream.js';

export async function CopyFile({ from, to, verify = true }: { from: string; to: string; verify?: boolean }) {
  if (from === to) {
    return false;
  }
  const fromFile = Bun.file(from);
  const toFile = Bun.file(to);
  await Bun.write(toFile, fromFile);
  if (verify === true) {
    return CompareFiles(fromFile, toFile);
  }
  return true;
}

export async function MoveFile({ from, to }: { from: string; to: string }) {
  if ((await CopyFile({ from, to, verify: true })) === true) {
    await node_fs.promises.unlink(from);
    return true;
  }
  return false;
}

export function CompareFiles(a: BunFile, b: BunFile) {
  return U8StreamCompare(a.stream(), b.stream());
}
export function ComparePaths(a: string | URL, b: string | URL) {
  return U8StreamCompare(Bun.file(a).stream(), Bun.file(b).stream());
}
