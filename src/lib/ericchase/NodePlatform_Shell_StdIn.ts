import { Core_Promise_Orphan } from './Core_Promise_Orphan.js';
import { Core_Utility_Decode_Bytes } from './Core_Utility_Decode_Bytes.js';
import { Data_Internal_NodePlatform_Shell } from './NodePlatform_Shell.js';

/**
 * Gotchas:
 * If the stdin stream is switched to utf8 mode, it cannot be switched back to
 * byte mode (As far as I can tell. Could use some verification.). Instead,
 * leave it in byte mode and decode the bytes.
 */
const SHELL__STDIN__LISTENERSET = new Set<(bytes: Uint8Array, text: string, removeSelf: () => boolean) => void | Promise<void>>();
const SHELL__STDIN__READERLOCKS = new Set<() => void>();

export function NodePlatform_Shell_StdIn_AddListener(listener: (bytes: Uint8Array, text: string, removeSelf: () => boolean) => void | Promise<void>): void {
  SHELL__STDIN__LISTENERSET.add(listener);
}

export function NodePlatform_Shell_StdIn_LockReader(): () => void {
  const release = () => {
    SHELL__STDIN__READERLOCKS.delete(release);
    NodePlatform_Shell_StdIn_StopReader();
  };
  SHELL__STDIN__READERLOCKS.add(release);
  return release;
}

export function NodePlatform_Shell_StdIn_ReaderHandler(bytes: Uint8Array): void {
  const text = Core_Utility_Decode_Bytes(bytes);
  for (const listener of SHELL__STDIN__LISTENERSET) {
    Core_Promise_Orphan(listener(bytes, text, () => SHELL__STDIN__LISTENERSET.delete(listener)));
  }
}

export function NodePlatform_Shell_StdIn_StartReader(): void {
  if (Data_Internal_NodePlatform_Shell.bool__reader_enabled === true && Data_Internal_NodePlatform_Shell.bool__raw_mode_enabled === true) {
    NodePlatform_Shell_StdIn_StopReader();
  }
  if (Data_Internal_NodePlatform_Shell.bool__reader_enabled === false) {
    process.stdin //
      .addListener('data', NodePlatform_Shell_StdIn_ReaderHandler)
      .resume();
    Data_Internal_NodePlatform_Shell.bool__reader_enabled = true;
    Data_Internal_NodePlatform_Shell.bool__raw_mode_enabled = false;
  }
}

export function NodePlatform_Shell_StdIn_StartReaderInRawMode(): boolean {
  try {
    if (Data_Internal_NodePlatform_Shell.bool__reader_enabled === true && Data_Internal_NodePlatform_Shell.bool__raw_mode_enabled === false) {
      NodePlatform_Shell_StdIn_StopReader();
    }
    if (Data_Internal_NodePlatform_Shell.bool__reader_enabled === false) {
      process.stdin //
        .setRawMode(true)
        .addListener('data', NodePlatform_Shell_StdIn_ReaderHandler)
        .resume();
      Data_Internal_NodePlatform_Shell.bool__reader_enabled = true;
      Data_Internal_NodePlatform_Shell.bool__raw_mode_enabled = true;
    }
    return true;
  } catch {}
  return false;
}

export function NodePlatform_Shell_StdIn_StopReader(): boolean {
  try {
    if (SHELL__STDIN__READERLOCKS.size === 0) {
      if (Data_Internal_NodePlatform_Shell.bool__reader_enabled === true) {
        process.stdin //
          .pause()
          .removeListener('data', NodePlatform_Shell_StdIn_ReaderHandler)
          .setRawMode(false);
        Data_Internal_NodePlatform_Shell.bool__reader_enabled = false;
        Data_Internal_NodePlatform_Shell.bool__raw_mode_enabled = false;
      }
    }
    return true;
  } catch {}
  return false;
}
