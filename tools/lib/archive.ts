import fs from 'node:fs';
import { U8ToLines, U8ToString } from '../../src/lib/ericchase/Algorithm/Uint8Array.js';
import { SpawnSync } from '../../src/lib/ericchase/Platform/Bun/Child Process.js';
import { CreateDirectory } from '../../src/lib/ericchase/Platform/Node/Fs.js';
import type { Path } from '../../src/lib/ericchase/Platform/Node/Path.js';
import { ConsoleError } from '../../src/lib/ericchase/Utility/Console.js';
import { onLog } from '../scripts/build.js';

export function has7z() {
  try {
    const { stdout } = SpawnSync('7z');
    for (const line of U8ToLines(stdout)) {
      if (line.startsWith('Usage: 7z')) {
        return true;
      }
    }
  } catch (error) {}
  return false;
}

interface ArchiveParams {
  in_dir: Path;
  out_path: Path;
}
export async function archive({ in_dir, out_path }: ArchiveParams) {
  if (has7z()) {
    const { stdout, stderr } = SpawnSync('7z', 'a', '-tzip', `./${out_path.path}`, `./${in_dir.path}/*`); // ./ are needed here
    for (const line of U8ToLines(stdout)) {
      if (line.startsWith('Archive size: ')) {
        onLog(`pack: [${line.slice('Archive size: '.length)}] ${out_path.path}`);
        break;
      }
    }
    if (stderr.byteLength > 0) {
      ConsoleError(U8ToString(stderr));
    }
  } else {
    // @ts-ignore
    const Archiver = await import('archiver');
    await CreateDirectory(out_path, true);
    return new Promise<void>((resolve) => {
      const output_stream = fs.createWriteStream(out_path.path);
      const archiver = Archiver.create('zip', {
        zlib: { level: 9 }, // Sets the compression level.
      });
      output_stream.on('close', () => {
        onLog(`pack: [${archiver.pointer()}B] ${out_path.path}`);
        resolve();
      });
      archiver.on('warning', (error: any) => {
        ConsoleError(error);
      });
      archiver.on('error', (error: any) => {
        ConsoleError(error);
      });
      archiver.pipe(output_stream);
      archiver.directory(in_dir.path, false);
      archiver.finalize();
    });
  }
}
