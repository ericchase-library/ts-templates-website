import type { BunFile } from 'bun';

import { U8StreamCompare } from '../../Algorithm/Stream.js';
import { DeleteFile } from '../Node/Fs.js';
import type { Path, PathGroup } from '../Node/Path.js';

export async function CopyFile({ from, to, verify = true }: { from: Path | PathGroup | URL; to: Path | PathGroup | URL; verify?: boolean }) {
  if (from.toString() === to.toString()) {
    return false;
  }
  const from_file = Bun.file(from.toString());
  const to_file = Bun.file(to.toString());
  await Bun.write(to_file, from_file);
  if (verify === true) {
    return CompareFiles(from_file, to_file);
  }
  return true;
}

export async function MoveFile({ from, to }: { from: Path | PathGroup | URL; to: Path | PathGroup | URL }) {
  if ((await CopyFile({ from, to, verify: true })) === true) {
    await DeleteFile(from);
    return true;
  }
  return false;
}

export function CompareFiles(file_a: BunFile, file_b: BunFile) {
  return U8StreamCompare(file_a.stream(), file_b.stream());
}

export function ComparePaths(path_a: Path | PathGroup | URL, path_b: Path | PathGroup | URL) {
  return U8StreamCompare(Bun.file(path_a.toString()).stream(), Bun.file(path_b.toString()).stream());
}
