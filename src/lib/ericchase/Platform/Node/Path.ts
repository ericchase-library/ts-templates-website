import { default as node_path } from 'node:path';
import { PrepareMessage } from '../../Utility/PrepareMessage.js';

export function JoinPaths(...paths: string[]) {
  return node_path.join(...paths);
}

export function NormalizePath(path: string) {
  return node_path.normalize(path);
}

export function ParsePath(path: string) {
  return node_path.parse(path);
}

export function ResolvePath(path: string) {
  return node_path.resolve(path);
}

// ! not tested
export function SanitizePath(path: string) {
  return path.replace(/[^a-z0-9\.\_\-]/gi, '_').toLowerCase();
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
    if (dir.length === 0) {
      return new Path(base);
    }
    if (base.length === 0) {
      return new Path(dir);
    }
    return new Path(`${dir}/${base}`);
  }
  static from(pathOrString: Path | string) {
    if (typeof pathOrString === 'string') {
      return new Path(pathOrString);
    }
    return pathOrString;
  }
  get path() {
    return this.$path;
  }
  get standard_path() {
    return this.$standard_path;
  }
  appendSegment(pathOrString: Path | string) {
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
}

export class PathSet {
  constructor(readonly path_map = new Map<string, Path>()) {}
  get paths() {
    return this.pathIterator();
  }
  add(path: Path) {
    this.path_map.set(path.path, path);
    return this;
  }
  has(path: Path) {
    return this.path_map.has(path.path);
  }
  *pathIterator() {
    for (const [, path] of this.path_map) {
      yield path.path;
    }
  }
}

export class PathGroup {
  readonly origin: string; // includes root, but not dir
  readonly root: string;
  readonly dir: string;
  readonly base: string; // includes name and ext
  readonly name: string;
  readonly ext: string;
  readonly $path: string;
  readonly $standard_path: string;
  constructor(
    readonly origin_path: Path,
    readonly relative_path: Path,
  ) {
    this.relative_path = relative_path.newRoot('');
    this.origin = origin_path.path;
    this.root = origin_path.root;
    this.dir = relative_path.dir;
    this.base = relative_path.base;
    this.name = relative_path.name;
    this.ext = relative_path.ext;
    this.$path = node_path.join(this.origin_path.path, this.relative_path.path);
    this.$standard_path = this.$path.split(node_path.sep).join('/');
  }
  static build({ origin_path = '', relative_path = '' }) {
    return new PathGroup(new Path(origin_path), new Path(relative_path));
  }
  get path() {
    return this.$path;
  }
  get standard_path() {
    return this.$standard_path;
  }
  newOrigin(new_origin_path: Path | string) {
    return new PathGroup(Path.from(new_origin_path), this.relative_path);
  }
  newDir(new_dir: string) {
    return new PathGroup(this.origin_path, this.relative_path.newDir(new_dir));
  }
  newBase(new_base: string) {
    return new PathGroup(this.origin_path, this.relative_path.newBase(new_base));
  }
  newName(new_name: string) {
    return new PathGroup(this.origin_path, this.relative_path.newName(new_name));
  }
  newExt(new_ext: string) {
    return new PathGroup(this.origin_path, this.relative_path.newExt(new_ext));
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
