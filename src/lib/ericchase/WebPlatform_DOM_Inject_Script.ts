export function WebPlatform_DOM_Inject_Script(code: string, setup_fn?: (script: HTMLScriptElement) => void): HTMLScriptElement {
  const script = document.createElement('script');
  setup_fn?.(script);
  script.textContent = code;
  document.body.appendChild(script);
  return script;
}
