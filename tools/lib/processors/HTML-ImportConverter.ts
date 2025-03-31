import { Path } from '../../../src/lib/ericchase/Platform/FilePath.js';
import { ParseHTML } from '../../../src/lib/ericchase/Platform/NPM/NodeHTMLParser.js';
import { Logger } from '../../../src/lib/ericchase/Utility/Logger.js';
import { BuilderInternal, ProcessorModule, ProjectFile } from '../Builder.js';

const logger = Logger(Processor_HTML_ImportConverter.name);

export function Processor_HTML_ImportConverter(): ProcessorModule {
  return new CProcessor_HTML_ImportConverter();
}

class CProcessor_HTML_ImportConverter implements ProcessorModule {
  channel = logger.newChannel();

  async onAdd(builder: BuilderInternal, files: Set<ProjectFile>): Promise<void> {
    for (const file of files) {
      if (file.src_path.ext === '.html') {
        file.addProcessor(this, this.onProcess);
      }
    }
  }

  async onProcess(builder: BuilderInternal, file: ProjectFile): Promise<void> {
    let update_text = false;
    const root_element = ParseHTML((await file.getText()).trim(), { convert_tagnames_to_lowercase: true, self_close_void_tags: true });
    for (const script_tag of root_element.getElementsByTagName('script')) {
      const src = script_tag.getAttribute('src');
      if (src !== undefined) {
        const { ext } = getPath(src);
        switch (ext) {
          case '.js':
          case '.jsx':
          case '.ts':
          case '.tsx':
            script_tag.setAttribute('src', `${src.slice(0, src.lastIndexOf(ext))}.js`);
            update_text = true;
            break;
        }
      }
    }
    if (update_text === true) {
      file.setText(root_element.toString());
    }
  }
}

function getPath(src: string) {
  try {
    return Path(new URL(src).pathname);
  } catch (error) {
    return Path(src);
  }
}
