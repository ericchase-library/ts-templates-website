export function Async_WebPlatform_Utility_Upload(options?: { ext_or_mime?: string }): Promise<string | undefined> {
  return new Promise<string | undefined>((resolve, reject) => {
    options ??= {};
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    if (options.ext_or_mime !== undefined) {
      input.setAttribute('accept', options.ext_or_mime);
    }
    input.style.setProperty('display', 'none');
    input.addEventListener('error', (event) => {
      reject(event.error);
    });
    input.addEventListener('change', async () => {
      resolve(await input.files?.[0]?.text());
    });
    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
  });
}
