import { NODE_PATH } from './NodePlatform.js';

export class Class_NodePlatform_PathObject_Absolute_Class {
  root = '';
  dir = '';
  name = '';
  ext = ''; // includes dot

  os_api: typeof NODE_PATH.win32 | typeof NODE_PATH.posix;
  constructor(public os: 'win32' | 'posix') {
    if (os === 'win32') {
      this.os_api = NODE_PATH.win32;
    } else {
      this.os_api = NODE_PATH.posix;
    }
  }

  /**
   * Replaces the path object's segments with the new segments from `pathlike`.
   * @param pathlike New segments to use for this path object.
   */
  overwrite(...pathlike: string[]): this {
    if (pathlike.filter((segment) => segment.length > 0).length > 0) {
      const { root, dir, name, ext } = this.os_api.parse(this.os_api.join(...pathlike.filter((item) => item.length > 0)));
      if (root === '') {
        throw new Error(`The computed path for "${pathlike}" is not considered an absolute path for ${this.os} and may not be used in a ${this.os} absolute path object.`);
      }
      this.root = root;
      this.dir = dir;
      this.name = name;
      this.ext = ext;
    } else {
      throw new Error('An empty path may not be used in an absolute path object.');
    }
    return this;
  }

  /**
   * Joins the path object into a path string. Custom processing available.
   * @param options
   * @param options.slash Suffix the path with a trailing slash
   */
  join(options?: { slash?: boolean }): string {
    options ??= {};
    options.slash ??= false;
    if (options.slash === true) {
      return this.os_api.join(...this.split()) + (this.os === 'win32' ? '\\' : '/');
    }
    return this.os_api.join(...this.split());
  }

  /**
   * Splits the path object into an array of segments.
   */
  split(): string[] {
    return [this.root, ...this.dir.slice(this.root.length).split(this.os === 'win32' ? '\\' : '/'), this.name + this.ext].filter((segment) => segment.length > 0);
  }

  /**
   * Appends new segments to the end of the path.
   * @param pathlike Segments to insert at the end of the path.
   */
  push(...pathlike: string[]): this {
    this.overwrite(...this.split(), ...pathlike);
    return this;
  }

  /**
   * Removes the last `count` segments from the path and returns them as an array of strings.
   * The root segment cannot be popped.
   * @param count Number of segments to remove from the end of the path.
   */
  pop(count = 1): string[] {
    if (count <= 0) {
      return [];
    }
    const segments = this.split();
    if (count >= segments.length) {
      count = segments.length - 1;
    }
    const removed: string[] = [];
    for (let i = 0; i < count; i++) {
      const segment = segments.pop();
      if (segment !== undefined) {
        removed.unshift(segment);
      }
    }
    this.overwrite(...segments);
    return removed;
  }

  /**
   * Returns a section of the path object as a new path object.
   * For end, a negative index can be used to indicate an offset from the end of the array.
   * For example, -2 refers to the second to last element of the array.
   * @param start
   * The beginning index of the specified portion of the array.
   * For absolute paths, only 0 makes sense, so it can't be anything else.
   * @param end
   * The end index of the specified portion of the array.
   * This is exclusive of the element at the index 'end'.
   * If end is undefined, then the slice extends to the end of the array.
   */
  slice(start: 0 = 0, end?: number): Class_NodePlatform_PathObject_Absolute_Class {
    if (start !== 0) {
      start = 0;
    }
    const segments = this.split();
    end ??= segments.length;
    if (end <= -segments.length) {
      end = 1;
    }
    return new Class_NodePlatform_PathObject_Absolute_Class(this.os).overwrite(...this.split().slice(0, end));
  }

  replaceExt(ext: string): Class_NodePlatform_PathObject_Absolute_Class {
    if (ext.length > 0) {
      this.ext = ext[0] === '.' ? ext : '.' + ext;
    } else {
      this.ext = '';
    }
    return this;
  }

  toPosix(): Class_NodePlatform_PathObject_Absolute_Class {
    if (this.os === 'win32') {
      return NodePlatform_PathObject_Absolute_Posix_Class(...this.split());
    } else {
      return this;
    }
  }
  toWin32(): Class_NodePlatform_PathObject_Absolute_Class {
    if (this.os === 'win32') {
      return this;
    } else {
      return NodePlatform_PathObject_Absolute_Win32_Class(...this.split());
    }
  }
}

export function NodePlatform_PathObject_Absolute_Class(...pathlike: string[]): Class_NodePlatform_PathObject_Absolute_Class {
  return new Class_NodePlatform_PathObject_Absolute_Class(process.platform === 'win32' ? 'win32' : 'posix').overwrite(...pathlike);
}
export function NodePlatform_PathObject_Absolute_Posix_Class(...pathlike: string[]): Class_NodePlatform_PathObject_Absolute_Class {
  return new Class_NodePlatform_PathObject_Absolute_Class('posix').overwrite(...pathlike);
}
export function NodePlatform_PathObject_Absolute_Win32_Class(...pathlike: string[]): Class_NodePlatform_PathObject_Absolute_Class {
  return new Class_NodePlatform_PathObject_Absolute_Class('win32').overwrite(...pathlike);
}
