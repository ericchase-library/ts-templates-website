import { PROMISE__ARRAY__UINT8__EMPTY } from './Core_Array_Uint8.js';
import { Async_Core_Stream_Uint8_Read_Some } from './Core_Stream_Uint8_Read_Some.js';
import { WebPlatform_Blob_CompatClass } from './WebPlatform_Blob_CompatClass.js';

export function Async_WebPlatform_Blob_Read_Some(blob: Blob, count: number): Promise<Uint8Array> {
  const stream = WebPlatform_Blob_CompatClass(blob).stream();
  if (stream !== undefined) {
    return Async_Core_Stream_Uint8_Read_Some(stream, count);
  }
  return PROMISE__ARRAY__UINT8__EMPTY;
}
