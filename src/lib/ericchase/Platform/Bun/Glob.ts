import { Path, PathGroup, PathGroupSet } from '../Node/Path.js';

export class GlobGroup {
  constructor(
    readonly origin_path: Path,
    readonly pattern: string,
    readonly path_group_set: PathGroupSet,
  ) {}
  static Build({ origin_path_or_string, pattern, dot = false }: { origin_path_or_string: Path | string; pattern: string; dot?: boolean }) {
    const origin_path = Path.From(origin_path_or_string);
    const path_group_set = new PathGroupSet();
    for (const relative_path of new Bun.Glob(pattern).scanSync({ cwd: origin_path.path, dot })) {
      path_group_set.add(new PathGroup(origin_path, new Path(relative_path)));
    }
    return new GlobGroup(origin_path, pattern, path_group_set);
  }
  get path_groups() {
    return this.pathGroupIterator();
  }
  get paths() {
    return this.pathIterator();
  }
  newOrigin(new_origin_path_or_string: Path | string) {
    const origin_path = Path.From(new_origin_path_or_string);
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

export class GlobManager {
  static GetKey(origin_path_or_string: Path | string, pattern: string) {
    return `${Path.From(origin_path_or_string).path}|${pattern}`;
  }
  static Scan(origin_path_or_string: Path | string, pattern: string, dot = false) {
    return GlobGroup.Build({ origin_path_or_string, pattern, dot });
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
  getGlobGroup(origin_path_or_string: Path | string, pattern: string) {
    return this.glob_group_map.get(GlobManager.GetKey(origin_path_or_string, pattern));
  }
  update(globManager: GlobManager) {
    for (const [key, glob_group] of globManager.glob_group_map) {
      this.glob_group_map.set(key, glob_group);
    }
    return this;
  }
  scan(origin_path_or_string: Path | string, ...patterns: string[]) {
    const origin_path = Path.From(origin_path_or_string);
    for (const pattern of patterns) {
      this.glob_group_map.set(GlobManager.GetKey(origin_path, pattern), GlobManager.Scan(origin_path, pattern));
    }
    return this;
  }
  scanDot(origin_path_or_string: Path | string, ...patterns: string[]) {
    const origin_path = Path.From(origin_path_or_string);
    for (const pattern of patterns) {
      this.glob_group_map.set(GlobManager.GetKey(origin_path, pattern), GlobManager.Scan(origin_path, pattern));
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
