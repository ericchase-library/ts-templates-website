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
    const ignore = listener(bytes, text, () => listeners.delete(listener));
  }
}

export function AddStdinListener(listener: (bytes: Uint8Array, text: string, removeSelf: () => boolean) => Promise<void>) {
  listeners.add(listener);
}

export function StartStdinReader() {
  if (enabled === true && rawmode === true) {
    StopStdinReader();
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

export function StartStdinRawModeReader() {
  if (enabled === true && rawmode === false) {
    StopStdinReader();
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

export function StopStdinReader() {
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
