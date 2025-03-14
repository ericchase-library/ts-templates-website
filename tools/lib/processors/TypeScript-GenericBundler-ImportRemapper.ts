import { Path } from 'src/lib/ericchase/Platform/FilePath.js';
import { BuilderInternal } from 'tools/lib/BuilderInternal.js';
import { ProcessorModule } from 'tools/lib/Processor.js';
import { ProjectFile } from 'tools/lib/ProjectFile.js';

export function Processor_TypeScript_GenericBundlerImportRemapper(): ProcessorModule {
  return new CProcessor_TypeScript_GenericBundlerImportRemapper();
}

export class CProcessor_TypeScript_GenericBundlerImportRemapper implements ProcessorModule {
  async onAdd(builder: BuilderInternal, files: Set<ProjectFile>) {
    for (const file of files) {
      if (file.src_path.endsWith('.module.ts') === false) {
        continue;
      }
      file.addProcessor(this, this.onProcess);
    }
  }
  async onRemove(builder: BuilderInternal, files: Set<ProjectFile>): Promise<void> {}

  async onProcess(builder: BuilderInternal, file: ProjectFile): Promise<void> {
    let text = await file.getText();
    let find_results = findImportPath(text);
    while (find_results.indexStart !== -1) {
      const import_path = Path(find_results.importPath);
      if (import_path.startsWith(builder.dir.src.standard)) {
        // replace src dir of import with ./ or ../ chain depending on from path
        const new_import_path =
          file.src_path.segments.length === 2 //
            ? import_path.standard.replace('src/', './')
            : import_path.standard.replace('src/', '../'.repeat(file.src_path.segments.length - 2));
        text = text.slice(0, find_results.indexStart) + new_import_path + text.slice(find_results.indexEnd);
        find_results.indexEnd = find_results.indexStart + new_import_path.length;
      }
      find_results = findImportPath(text, find_results.indexEnd);
    }
    file.setText(text);
  }
}

function indexOf(source: string, target: string, position = 0) {
  const index = source.indexOf(target, position);
  return { start: index, end: index + target.length };
}
function lastIndexOf(source: string, target: string, position = 0) {
  const index = source.lastIndexOf(target, position);
  return { start: index, end: index + target.length };
}
function findImportPath(text: string, indexStart = 0) {
  while (indexStart !== -1) {
    // find next "import"
    const index_import = indexOf(text, 'import', indexStart);
    if (-1 === index_import.start) {
      break;
    }
    // find next ";" after "import"
    const index_semicolon = indexOf(text, ';', index_import.end);
    if (-1 === index_semicolon.start) {
      break;
    }

    // look backwards from ";" for matching pair of single or double quotes
    const index_quotes = findQuotePairFromEnd(text, index_import.end, index_semicolon.start);
    if (-1 === index_quotes.start) {
      break;
    }

    // return import path if extension is ".js"
    const text_import_path = text.slice(index_quotes.start + 1, index_quotes.end);
    if (Path(text_import_path).ext === '.js') {
      return { indexStart: index_quotes.start + 1, indexEnd: index_quotes.end, importPath: text_import_path };
    }
    indexStart = index_import.end;
  }
  return { indexStart: -1, indexEnd: -1, importPath: Path() };
}
function findQuotePairFromEnd(text: string, start: number, end: number) {
  const slice = text.slice(start, end);
  const double_end = slice.lastIndexOf('"');
  const single_end = slice.lastIndexOf("'");
  if (double_end === -1 && single_end === -1) {
    return { start: -1, end: -1 };
  }
  if (double_end > single_end) {
    return { start: start + slice.lastIndexOf('"', double_end - 1), end: start + double_end };
  }
  return { start: start + slice.lastIndexOf("'", single_end - 1), end: start + single_end };
}
