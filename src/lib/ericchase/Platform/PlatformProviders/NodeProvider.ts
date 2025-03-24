import { default as node_fs } from 'node:fs';
import { CPath, Path } from '../FilePath.js';
import { PlatformProvider } from '../PlatformProvider.js';

const NodeProvider = PlatformProvider();

// Directory
NodeProvider.Directory.create = async function create(path: CPath, recursive = true) {
  try {
    if (path.equals('.') === false) {
      await node_fs.promises.mkdir(path.raw, { recursive });
    }
  } catch (error: any) {
    if (error.code !== 'EEXIST') {
      throw error;
    }
  }
  return (await node_fs.promises.stat(path.raw)).isDirectory();
};
NodeProvider.Directory.delete = async (path, recursive) => {
  try {
    await node_fs.promises.rm(path.raw, { recursive, force: true });
  } catch (error: any) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }
  return node_fs.existsSync(path.raw) === false;
};
NodeProvider.Directory.watch = (path, callback, recursive = true) => {
  const watcher = node_fs.watch(path.raw, { persistent: true, recursive }, (event, filename) => {
    callback(event, Path(filename ?? ''));
  });
  return () => {
    watcher.close();
  };
};

// File
NodeProvider.File.appendBytes = async (path, bytes) => {
  await NodeProvider.Directory.create(path.slice(0, -1));
  return node_fs.promises.appendFile(path.raw, bytes);
};
NodeProvider.File.appendText = async (path, text) => {
  await NodeProvider.Directory.create(path.slice(0, -1));
  return node_fs.promises.appendFile(path.raw, text);
};

// Path
NodeProvider.Path.getStats = (path) => {
  return node_fs.promises.stat(path.raw);
};
NodeProvider.Path.isDirectory = async (path) => {
  return (await node_fs.promises.stat(path.raw)).isDirectory();
};
NodeProvider.Path.isFile = async (path) => {
  return (await node_fs.promises.stat(path.raw)).isFile();
};
NodeProvider.Path.isSymbolicLink = async (path) => {
  return (await node_fs.promises.stat(path.raw)).isSymbolicLink();
};

export default NodeProvider;
