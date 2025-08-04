export function WebPlatform_DOM_Inject_Script(code: string): HTMLScriptElement {
  const script = document.createElement('script');
  script.textContent = code;
  document.body.appendChild(script);
  return script;
}
