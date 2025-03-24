import { Orphan } from '../Utility/Promise.js';

// Gotchas:
// If the stdin stream is switched to utf8 mode, it cannot be switched back to
// byte mode (need to verify again). Instead, leave it in byte mode, and decode the bytes.

const decoder = new TextDecoder();

let enabled = false;
let rawmode = false;

const listeners = new Set<(bytes: Uint8Array, text: string, removeSelf: () => boolean) => Promise<void>>();
function handler(bytes: Uint8Array): void {
  const text = decoder.decode(bytes);
  for (const listener of listeners) {
    Orphan(listener(bytes, text, () => listeners.delete(listener)));
  }
}

function SwitchToLineReader() {
  if (enabled === true && rawmode === true) {
    StopStdInReader();
  }
  if (enabled === false) {
    process.stdin //
      .addListener('data', handler)
      .resume();
    // await Sleep(0); // ??
    enabled = true;
    rawmode = false;
  }
}
function SwitchToRawModeReader() {
  if (enabled === true && rawmode === false) {
    StopStdInReader();
  }
  if (enabled === false) {
    process.stdin //
      .setRawMode(true)
      .addListener('data', handler)
      .resume();
    // await Sleep(0); // ??
    enabled = true;
    rawmode = true;
  }
}
function StopReader() {
  if (enabled === true) {
    process.stdin //
      .pause()
      .removeListener('data', handler)
      .setRawMode(false);
    // await Sleep(0); // ??
    enabled = true;
    rawmode = false;
  }
}

export function AddStdInListener(listener: (bytes: Uint8Array, text: string, removeSelf: () => boolean) => Promise<void>) {
  listeners.add(listener);
}

const locks = new Set<() => void>();
export function GetStdInReaderLock() {
  const release = () => {
    locks.delete(release);
    if (locks.size === 0) {
      StopReader();
    }
  };
  locks.add(release);
  return release;
}

export function StartStdInReader() {
  SwitchToLineReader();
}

export function StartStdInRawModeReader() {
  SwitchToRawModeReader();
}

export function StopStdInReader() {
  if (locks.size === 0) {
    StopReader();
  }
}
