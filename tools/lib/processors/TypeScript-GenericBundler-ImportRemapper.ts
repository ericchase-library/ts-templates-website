import { default as node_url } from 'node:url';
import { BinarySearch } from '../../../src/lib/ericchase/Algorithm/Search/BinarySearch.js';
import { GetRelativePath, Path } from '../../../src/lib/ericchase/Platform/FilePath.js';
import { Logger } from '../../../src/lib/ericchase/Utility/Logger.js';
import { BuilderInternal, ProcessorModule, ProjectFile } from '../Builder.js';

// Modules that import other modules will end up with broken import urls. These
// urls will need to be fixed (remapped) to the correct output file path. This
// also handles projects that have a `paths` setting in tsconfig.json.

const logger = Logger(Processor_TypeScript_GenericBundlerImportRemapper.name);

export function Processor_TypeScript_GenericBundlerImportRemapper(): ProcessorModule {
  return new CProcessor_TypeScript_GenericBundlerImportRemapper();
}

class CProcessor_TypeScript_GenericBundlerImportRemapper implements ProcessorModule {
  channel = logger.newChannel();

  alias_cache = new Map<string, string>();
  async onAdd(builder: BuilderInternal, files: Set<ProjectFile>) {
    for (const file of files) {
      if (file.src_path.endsWith('.module.ts') || file.src_path.endsWith('.module.tsx')) {
        file.addProcessor(this, this.onProcess);
      }
    }
  }
  async onRemove(builder: BuilderInternal, files: Set<ProjectFile>): Promise<void> {}
  async onProcess(builder: BuilderInternal, file: ProjectFile): Promise<void> {
    const text = await file.getText();
    // can't do lines, because import statements will become multiline if long enough
    const list_imports: { start: number; end: number; path: string }[] = [];
    const matches_imports = text.matchAll(/^import[ *{"'][\s\S]*?[ }"']from *["']([^"']*.module.js?)["'];$/dgm);
    for (const match of matches_imports) {
      if (match.indices !== undefined) {
        list_imports.push({ start: match.indices[1][0], end: match.indices[1][1], path: match[1] });
      }
    }
    if (list_imports.length > 0) {
      const list_sources: { start: number; end: number; path: string }[] = [];
      const matches_sources = text.matchAll(/^\/\/ (.*?)$/dgm);
      for (const match of matches_sources) {
        if (match.indices !== undefined) {
          list_sources.push({ start: match.indices[1][0], end: match.indices[1][1], path: match[1] });
        }
      }
      const text_parts: string[] = [];
      let text_index = 0;
      for (const item_import of list_imports) {
        const item_source = list_sources.at(BinarySearch.Insertion(list_sources, item_import, (a, b) => a.start < b.start));
        if (item_source !== undefined) {
          try {
            const remapped_import_path = getRelativePath(file.src_path.raw, item_source.path, item_import.path);
            text_parts.push(text.slice(text_index, item_import.start), remapped_import_path);
            text_index = item_import.end;
          } catch (error) {
            this.channel.error('Failed to resolve a module import:', error);
          }
        }
      }
      text_parts.push(text.slice(text_index));
      file.setText(text_parts.join(''));
    }
  }
}

function getRelativePath(file_path: string, item_source_path: string, item_import_path: string) {
  let rawpath = item_import_path;
  if (rawpath.startsWith('.') === true) {
    rawpath = `${process.cwd()}/${Path(Path(item_source_path).parentpath, rawpath).standard}`;
  }
  const relative = GetRelativePath(`${process.cwd()}/${file_path}`, true, node_url.fileURLToPath(import.meta.resolve(rawpath)));
  relative.ext = '.js';
  return relative.segments[0] === '..' ? relative.standard : `./${relative.standard}`;
}
