import { default as node_path } from 'node:path';
import { BinarySearch } from '../../../src/lib/ericchase/Algorithm/Search/BinarySearch.js';
import { CPath, GetRelativePath, Path } from '../../../src/lib/ericchase/Platform/FilePath.js';
import { Logger } from '../../../src/lib/ericchase/Utility/Logger.js';
import { BuilderInternal, ProcessorModule, ProjectFile } from '../Builder.js';

const logger = Logger(Processor_TypeScript_GenericBundlerImportRemapper.name);

export function Processor_TypeScript_GenericBundlerImportRemapper(): ProcessorModule {
  return new CProcessor_TypeScript_GenericBundlerImportRemapper();
}

class CProcessor_TypeScript_GenericBundlerImportRemapper implements ProcessorModule {
  channel = logger.newChannel();

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
    // can't do lines, because import statements will become multilined if long enough
    const list_imports: { start: number; end: number; path: CPath }[] = [];
    const matches_imports = text.matchAll(/^import[ *{"'][\s\S]*?[ }"']from *["']([^"']*?)["'];$/dgm);
    for (const match of matches_imports) {
      if (match.indices !== undefined) {
        list_imports.push({ start: match.indices[1][0], end: match.indices[1][1], path: Path(match[1]) });
      }
    }
    if (list_imports.length > 0) {
      const list_sources: { start: number; end: number; path: CPath }[] = [];
      const matches_sources = text.matchAll(/^\/\/ (.*?)$/dgm);
      for (const match of matches_sources) {
        if (match.indices !== undefined) {
          list_sources.push({ start: match.indices[1][0], end: match.indices[1][1], path: Path(match[1]) });
        }
      }
      const text_parts: string[] = [];
      let text_index = 0;
      for (const item_import of list_imports) {
        const item_source = list_sources[BinarySearch.Insertion(list_sources, item_import, (a, b) => a.start < b.start) - 1]; // - 1 because insertion index would be 1 after
        if (item_source.path.equals(file.src_path) === false) {
          const path_join_source_import = Path(node_path.join(item_source.path.slice(0, -1).standard, item_import.path.standard));
          const path_relative = GetRelativePath({ isFile: true, path: file.src_path }, { isFile: true, path: path_join_source_import });
          const path_fixed_import = path_relative.segments[0] === '..' ? path_relative.standard : `./${path_relative.standard}`;
          text_parts.push(text.slice(text_index, item_import.start), path_fixed_import);
          text_index = item_import.end;
        }
      }
      text_parts.push(text.slice(text_index));
      file.setText(text_parts.join(''));
    }
  }
}
