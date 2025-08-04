export function WebPlatform_Utility_Download(
  data: {
    blob?: Blob;
    bytes?: Uint8Array;
    json?: string;
    text?: string;
    url?: string;
  },
  filename: string,
): void {
  const dataurl = (() => {
    if (data.blob !== undefined) {
      return URL.createObjectURL(data.blob);
    }
    if (data.bytes !== undefined) {
      return URL.createObjectURL(new Blob([data.bytes.slice()], { type: 'application/octet-stream;charset=utf-8' }));
    }
    if (data.json !== undefined) {
      return URL.createObjectURL(new Blob([data.json], { type: 'application/json;charset=utf-8' }));
    }
    if (data.text !== undefined) {
      return URL.createObjectURL(new Blob([data.text], { type: 'text/plain;charset=utf-8' }));
    }
    if (data.url !== undefined) {
      return data.url;
    }
  })();
  if (dataurl !== undefined) {
    const anchor = document.createElement('a');
    anchor.setAttribute('download', filename);
    anchor.setAttribute('href', dataurl);
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  }
}
