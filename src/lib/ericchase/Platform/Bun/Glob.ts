import node_os from 'node:os';

import { PrepareMessage } from '../../Utility/PrepareMessage.js';
import { Path, PathGroup, PathGroupSet } from '../Node/Path.js';

export class GlobGroup {
  constructor(
    readonly origin_path: Path,
    readonly pattern: string,
    readonly path_group_set: PathGroupSet,
  ) {}
  static build({ origin_path, pattern, dot = false }: { origin_path: Path | PathGroup; pattern: string; dot?: boolean }) {
    const path_group_set = new PathGroupSet();
    if (node_os.platform() === 'win32') {
      if (pattern.startsWith('/') || origin_path.path.startsWith('/')) {
        const message = `
          Paths starting with "/" are invalid on Windows.
          
          Arguments passed to function contain "${origin_path.path}" (origin path) and "${pattern}" (pattern).

          Follow the stack trace below to find the affected area of code.
        `;
        throw new Error(PrepareMessage(message, 0, 1));
      }
    }
    for (const relative_path of new Bun.Glob(pattern).scanSync({ cwd: origin_path.path, dot })) {
      path_group_set.add(new PathGroup(origin_path, new Path(relative_path)));
    }
    return new GlobGroup(Path.from(origin_path), pattern, path_group_set);
  }
  get path_groups() {
    return this.pathGroupIterator();
  }
  get paths() {
    return this.pathIterator();
  }
  newOrigin(new_origin: Path | PathGroup) {
    const origin_path = Path.from(new_origin);
    const path_group_set = new PathGroupSet();
    for (const path_group of this.path_group_set.path_groups) {
      path_group_set.add(path_group.newOrigin(origin_path));
    }
    return new GlobGroup(origin_path, this.pattern, path_group_set);
  }
  *pathGroupIterator() {
    for (const path_group of this.path_group_set.path_groups) {
      yield path_group;
    }
  }
  *pathIterator() {
    for (const path of this.path_group_set.paths) {
      yield path;
    }
  }
}

export class GlobScanner {
  static GetKey(origin_path: Path | PathGroup, pattern: string) {
    return `${Path.from(origin_path).path}|${pattern}`;
  }
  static Scan(origin_path: Path | PathGroup, pattern: string, dot = false) {
    return GlobGroup.build({ origin_path, pattern, dot });
  }
  glob_group_map = new Map<string, GlobGroup>();
  get glob_groups() {
    return this.glob_group_map.values();
  }
  get path_groups() {
    return this.pathGroupIterator();
  }
  get paths() {
    return this.pathIterator();
  }
  getGlobGroup(origin_path: Path | PathGroup, pattern: string) {
    return this.glob_group_map.get(GlobScanner.GetKey(origin_path, pattern));
  }
  update(other: GlobScanner) {
    for (const [key, glob_group] of other.glob_group_map) {
      this.glob_group_map.set(key, glob_group);
    }
    return this;
  }
  scan(origin_path: Path | PathGroup, ...patterns: string[]) {
    for (const pattern of patterns) {
      this.glob_group_map.set(GlobScanner.GetKey(origin_path, pattern), GlobScanner.Scan(origin_path, pattern));
    }
    return this;
  }
  scanDot(origin_path: Path | PathGroup, ...patterns: string[]) {
    for (const pattern of patterns) {
      this.glob_group_map.set(GlobScanner.GetKey(origin_path, pattern), GlobScanner.Scan(origin_path, pattern, true));
    }
    return this;
  }
  *pathGroupIterator() {
    for (const glob_group of this.glob_groups) {
      for (const path_group of glob_group.path_groups) {
        yield path_group;
      }
    }
  }
  *pathIterator() {
    for (const path_group of this.path_groups) {
      yield path_group.path;
    }
  }
}
