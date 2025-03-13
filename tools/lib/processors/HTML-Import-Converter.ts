import { Path } from 'src/lib/ericchase/Platform/FilePath.js';
import { ParseHTML } from 'src/lib/ericchase/Platform/NPM/NodeHTMLParser.js';
import { BuilderInternal } from 'tools/lib/BuilderInternal.js';
import { ProcessorModule } from 'tools/lib/Processor.js';
import { ProjectFile } from 'tools/lib/ProjectFile.js';

export class CProcessor_HTMLImportConverter implements ProcessorModule {
  async onAdd(builder: BuilderInternal, files: Set<ProjectFile>) {
    for (const file of files) {
      if (file.src_path.ext !== '.html') {
        continue;
      }
      file.addProcessor(this, this.onProcess);
    }
  }
  async onRemove(builder: BuilderInternal, files: Set<ProjectFile>): Promise<void> {}

  async onProcess(builder: BuilderInternal, file: ProjectFile): Promise<void> {
    let update_text = false;
    const root_element = ParseHTML((await file.getText()).trim(), { convert_tagnames_to_lowercase: true, self_close_void_tags: true });
    for (const script_tag of root_element.getElementsByTagName('script')) {
      const src = script_tag.getAttribute('src');
      if (src !== undefined) {
        if (getBasename(src).endsWith('.ts')) {
          script_tag.setAttribute('src', `${src.slice(0, src.lastIndexOf('.ts'))}.js`);
          update_text = true;
        }
      }
    }
    if (update_text === true) {
      file.setText(root_element.toString());
    }
  }
}

function getBasename(src: string) {
  try {
    return Path(new URL(src).pathname).basename;
  } catch (error) {
    return Path(src).basename;
  }
}

export function Processor_HTMLImportConverter(): ProcessorModule {
  return new CProcessor_HTMLImportConverter();
}
