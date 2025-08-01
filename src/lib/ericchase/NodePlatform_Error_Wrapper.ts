export class Class_NodePlatform_Error extends Error {
  path?: string;
  syscall?: string;
  errno?: number;
  code?: string;
  original: any;
  get message() {
    return this.code + ': NODE PLATFORM ERROR (ORIGINAL ERROR BELOW)';
  }
}

export function NodePlatform_Error(original: any): Class_NodePlatform_Error {
  const error = new Class_NodePlatform_Error();
  error.path = original.path;
  error.syscall = original.syscall;
  error.errno = original.errno;
  error.code = original.code;
  error.original = original;
  error.stack = original.stack;
  return error;
}

/**
 * Async functions have a tendency to lose call stack information. This function
 * attempts to create a meaningful call stack at a target location for potential
 * async errors.
 */
export async function Async_NodePlatform_Error_Wrapped_Call<T>(error: Error, promise: Promise<T>): Promise<T> {
  try {
    return await promise;
  } catch (original: any) {
    throw NodePlatform_Error(original);
  }
}
