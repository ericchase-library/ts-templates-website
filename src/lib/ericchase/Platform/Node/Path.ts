import node_path from 'node:path';

import { PrepareMessage } from '../../Utility/PrepareMessage.js';

/** Use `new Path(...).appendSegment(...)` instead. */
export function JoinPaths(...paths: (Path | PathGroup)[]) {
  return node_path.join(...paths.map((path) => path.path));
}

/** Use `new Path(...).path` instead. */
export function NormalizePath(path: Path | PathGroup) {
  return node_path.normalize(path.path);
}

/** Use `new Path(...)` instead. */
export function ParsePath(path: Path | PathGroup) {
  return node_path.parse(path.path);
}

/** Use `new Path(...).resolve` instead. */
export function ResolvePath(path: Path | PathGroup) {
  return node_path.resolve(path.path);
}

export function SanitizeFileName(name: string) {
  return name.replace(/[^a-z0-9\.\_\-]/gi, '_').toLowerCase();
}

export const PathSeparator = node_path.sep;

export class Path {
  readonly dir: string; // includes root segment
  readonly root: string;
  readonly base: string; // includes name and ext
  readonly name: string;
  readonly ext: string;
  readonly $path: string;
  readonly $standard_path: string;
  constructor(path = '') {
    const { dir, root, base, name, ext } = node_path.parse(node_path.normalize(path));
    this.dir = dir;
    this.root = root;
    this.base = base;
    this.name = name;
    this.ext = ext;
    this.$path = node_path.join(dir, base);
    this.$standard_path = this.path.split(node_path.sep).join('/');
  }
  static build({ dir = '', base = '' }) {
    return new Path(dir).appendSegment(base);
  }
  static from(pathOrString: Path | PathGroup | string) {
    if (typeof pathOrString === 'string') {
      return new Path(pathOrString);
    }
    if (pathOrString instanceof PathGroup) {
      return new Path(pathOrString.path);
    }
    return pathOrString;
  }
  get path() {
    return this.$path;
  }
  get resolve() {
    return node_path.resolve(this.path);
  }
  get standard_path() {
    return this.$standard_path;
  }
  appendSegment(pathOrString: Path | PathGroup | string) {
    return new Path(node_path.join(this.path, Path.from(pathOrString).path));
  }
  newDir(new_dir: string) {
    return Path.build({ dir: new_dir, base: this.base });
  }
  newRoot(new_root: string) {
    return this.newDir(new_root + this.dir.slice(this.root.length));
  }
  newBase(new_base: string) {
    return Path.build({ dir: this.dir, base: new_base });
  }
  newName(new_name: string) {
    if (new_name.length === 0) {
      const message = `
        Path.newName does not accept an empty string. Use Path.newBase instead.
        
        Current path value is "${this.path}".

        Follow the stack trace below to find the affected area of code.
      `;
      throw new Error(PrepareMessage(message, 0, 1));
    }
    return this.newBase(`${new_name}${this.ext}`);
  }
  newExt(new_ext: string) {
    if (new_ext.length === 0) {
      return this.newBase(this.name);
    }
    if (new_ext.lastIndexOf('.') > 0) {
      const message = `
        Path.newExt does not accept dots (".") after the first character.
        
        Current path value is "${this.path}".

        Follow the stack trace below to find the affected area of code.
      `;
      throw new Error(PrepareMessage(message, 0));
    }
    if (new_ext.indexOf('.') === 0) {
      return this.newBase(`${this.name}${new_ext}`);
    }
    return this.newBase(`${this.name}.${new_ext}`);
  }
  toString() {
    return this.path;
  }
}

export class PathSet {
  constructor(readonly path_map = new Map<string, Path>()) {}
  get paths() {
    return this.pathIterator();
  }
  get size() {
    return this.path_map.size;
  }
  add(pathOrString: Path | PathGroup | string) {
    const path = Path.from(pathOrString);
    this.path_map.set(path.path, path);
    return this;
  }
  has(pathOrString: Path | PathGroup | string) {
    const path = Path.from(pathOrString);
    return this.path_map.has(path.path);
  }
  *pathIterator() {
    for (const [, path] of this.path_map) {
      yield path.path;
    }
  }
}

export class PathGroup {
  readonly origin_path: Path;
  readonly relative_path: Path;
  readonly $path: string;
  readonly $standard_path: string;
  constructor(origin_path: Path | PathGroup | string, relative_path: Path | PathGroup | string) {
    this.origin_path = Path.from(origin_path);
    this.relative_path = Path.from(relative_path).newRoot('');
    const final_path = Path.from(this.origin_path).appendSegment(this.relative_path);
    this.$path = final_path.path;
    this.$standard_path = final_path.standard_path;
  }
  static build({ origin_path = '', relative_path = '' }: { origin_path?: Path | PathGroup | string; relative_path?: Path | PathGroup | string }) {
    return new PathGroup(origin_path, relative_path);
  }
  get path() {
    return this.$path;
  }
  get standard_path() {
    return this.$standard_path;
  }
  newOrigin(new_origin_path: Path | PathGroup | string) {
    return new PathGroup(new_origin_path, this.relative_path);
  }
  newRelative(new_relative_path: Path | PathGroup | string) {
    return new PathGroup(this.origin_path, new_relative_path);
  }
  newRelativeDir(new_dir: string) {
    return new PathGroup(this.origin_path, this.relative_path.newDir(new_dir));
  }
  newRelativeBase(new_base: string) {
    return new PathGroup(this.origin_path, this.relative_path.newBase(new_base));
  }
  newRelativeName(new_name: string) {
    return new PathGroup(this.origin_path, this.relative_path.newName(new_name));
  }
  newRelativeExt(new_ext: string) {
    return new PathGroup(this.origin_path, this.relative_path.newExt(new_ext));
  }
  toString() {
    return this.path;
  }
}

export class PathGroupSet {
  constructor(readonly path_group_map = new Map<string, PathGroup>()) {}
  get path_groups() {
    return this.pathGroupIterator();
  }
  get paths() {
    return this.pathIterator();
  }
  get size() {
    return this.path_group_map.size;
  }
  add(path_group: PathGroup) {
    this.path_group_map.set(path_group.path, path_group);
    return this;
  }
  has(path_group: PathGroup) {
    return this.path_group_map.has(path_group.path);
  }
  *pathGroupIterator() {
    for (const [, path_group] of this.path_group_map) {
      yield path_group;
    }
  }
  *pathIterator() {
    for (const [, path_group] of this.path_group_map) {
      yield path_group.path;
    }
  }
}
