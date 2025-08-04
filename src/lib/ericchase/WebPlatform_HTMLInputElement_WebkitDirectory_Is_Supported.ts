import { WebPlatform_Utility_Device_Is_Mobile } from './WebPlatform_Utility_Device_Is_Mobile.js';

export function WebPlatform_HTMLInputElement_WebkitDirectory_Is_Supported(): boolean {
  return WebPlatform_Utility_Device_Is_Mobile() ? false : true;
}
