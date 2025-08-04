export function WebPlatform_Utility_Open_Window(url: string, cb_load?: (proxy: Window, event: Event) => void, cb_unload?: (proxy: Window, event: Event) => void): void {
  const proxy = window.open(url, '_blank');
  if (proxy) {
    if (cb_load) {
      proxy.addEventListener('load', (event: Event) => {
        cb_load(proxy, event);
      });
    }
    if (cb_unload) {
      proxy.addEventListener('unload', (event: Event) => {
        cb_unload(proxy, event);
      });
    }
  }
}
