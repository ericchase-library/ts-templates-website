export async function Async_WebPlatform_DOM_ReadyState_Callback(config: Config) {
  async function DOMContentLoaded() {
    removeEventListener('DOMContentLoaded', DOMContentLoaded);
    await config.DOMContentLoaded?.();
  }
  async function load() {
    removeEventListener('load', load);
    await config.load?.();
  }
  switch (document.readyState) {
    case 'loading':
      if (config.DOMContentLoaded !== undefined) {
        addEventListener('DOMContentLoaded', DOMContentLoaded);
      }
      if (config.load !== undefined) {
        addEventListener('load', load);
      }
      break;
    case 'interactive':
      await config.DOMContentLoaded?.();
      if (config.load !== undefined) {
        addEventListener('load', load);
      }
      break;
    case 'complete':
      await config.DOMContentLoaded?.();
      await config.load?.();
      break;
  }
}
interface Config {
  DOMContentLoaded?: () => Promise<void>;
  load?: () => Promise<void>;
}
