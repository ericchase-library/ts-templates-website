export function Async_Core_Utility_Sleep(duration_ms: number): Promise<void> {
  return new Promise((resolve) =>
    setTimeout(() => {
      resolve();
    }, duration_ms),
  );
}
