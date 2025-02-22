import node_fs from 'node:fs';

import { Path, type PathGroup } from './Path.js';

export async function DeleteFile(path: Path | PathGroup | URL) {
  await node_fs.promises.unlink(path.toString());
}

export async function ReadFile(path: Path | PathGroup | URL) {
  return await node_fs.promises.readFile(path.toString(), { encoding: 'utf8' });
}

export async function RenameFile(from: Path | PathGroup | URL, to: Path | PathGroup | URL) {
  await node_fs.promises.rename(from.toString(), to.toString());
}

export async function WriteFile(path: Path | PathGroup | URL, text: string) {
  await node_fs.promises.writeFile(path.toString(), text, { encoding: 'utf8' });
}

export async function CleanDirectory(path: Path | PathGroup | URL) {
  await DeleteDirectory(path);
  await CreateDirectory(path);
}

export async function CreateDirectory(path: Path | PathGroup | URL, is_file = false) {
  try {
    if (path instanceof URL) {
      await node_fs.promises.mkdir(path, { recursive: true });
    } else {
      await node_fs.promises.mkdir(is_file === true ? Path.from(path).dir : path.path, { recursive: true });
    }
  } catch (error) {
    // @ts-ignore
    if (error?.code !== 'EEXIST') {
      throw error;
    }
  }
}

export async function DeleteDirectory(path: Path | PathGroup | URL) {
  await node_fs.promises.rm(path.toString(), { recursive: true, force: true });
}
