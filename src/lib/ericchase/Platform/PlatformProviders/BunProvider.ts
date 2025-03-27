import { U8StreamCompare } from '../../Algorithm/Stream.js';
import { PlatformProvider } from '../PlatformProvider.js';
import NodeProvider from './NodeProvider.js';

const BunProvider = PlatformProvider();

// Directory
BunProvider.Directory.create = NodeProvider.Directory.create;
BunProvider.Directory.delete = NodeProvider.Directory.delete;
BunProvider.Directory.globScan = (path, pattern, absolutepaths = false, onlyfiles = true) => {
  return new Bun.Glob(pattern).scan({ cwd: path.raw, dot: true, absolute: absolutepaths, onlyFiles: onlyfiles });
};
BunProvider.Directory.watch = NodeProvider.Directory.watch;

// File
BunProvider.File.appendBytes = NodeProvider.File.appendBytes;
BunProvider.File.appendText = NodeProvider.File.appendText;
BunProvider.File.compare = (from, to) => {
  return U8StreamCompare(Bun.file(from.raw).stream(), Bun.file(to.raw).stream());
};
BunProvider.File.copy = async (from, to, overwrite = false) => {
  if (from.raw === to.raw) {
    return false;
  }
  if (overwrite !== true && (await Bun.file(to.raw).exists()) === true) {
    return false;
  }
  await Bun.write(Bun.file(to.raw), Bun.file(from.raw));
  return BunProvider.File.compare(from, to);
};
BunProvider.File.delete = async (path) => {
  await Bun.file(path.raw).delete();
  return (await Bun.file(path.raw).exists()) === false;
};
BunProvider.File.move = async (from, to, overwrite = false) => {
  if (from.raw === to.raw) {
    return false;
  }
  if (overwrite !== true && (await Bun.file(to.raw).exists()) === true) {
    return false;
  }
  await Bun.write(Bun.file(to.raw), Bun.file(from.raw));
  if ((await BunProvider.File.compare(from, to)) === false) {
    return false;
  }
  return BunProvider.File.delete(from);
};
BunProvider.File.readBytes = async (path) => await Bun.file(path.raw).bytes();
BunProvider.File.readText = async (path) => await Bun.file(path.raw).text();
BunProvider.File.writeBytes = async (path, bytes, createpath = true) => {
  if (createpath === true) {
    await BunProvider.Directory.create(path.slice(0, -1));
  }
  return Bun.write(path.raw, bytes);
};
BunProvider.File.writeText = async (path, text, createpath = true) => {
  if (createpath === true) {
    await BunProvider.Directory.create(path.slice(0, -1));
  }
  return Bun.write(path.raw, text);
};

// Path
BunProvider.Path.getStats = NodeProvider.Path.getStats;
BunProvider.Path.isDirectory = NodeProvider.Path.isDirectory;
BunProvider.Path.isFile = NodeProvider.Path.isFile;
BunProvider.Path.isSymbolicLink = NodeProvider.Path.isSymbolicLink;

// Utility
BunProvider.Utility.globMatch = (query, pattern) => {
  return new Bun.Glob(pattern).match(query);
};

export default BunProvider;
