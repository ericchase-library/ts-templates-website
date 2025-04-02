export function InjectScript(code: string) {
  if (document) {
    const script = document.createElement('script');
    script.textContent = code;
    document.body.appendChild(script);
    return script;
  }
}
