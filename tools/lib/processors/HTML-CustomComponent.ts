import { Path } from '../../../src/lib/ericchase/Platform/FilePath.js';
import { ParseHTML } from '../../../src/lib/ericchase/Platform/NPM/NodeHTMLParser.js';
import { Logger } from '../../../src/lib/ericchase/Utility/Logger.js';
import { BuilderInternal, ProcessorModule, ProjectFile } from '../Builder.js';

const logger = Logger(Processor_HTML_CustomComponent.name);

export function Processor_HTML_CustomComponent(): ProcessorModule {
  return new CProcessor_HTML_CustomComponent();
}

class CProcessor_HTML_CustomComponent implements ProcessorModule {
  channel = logger.newChannel();

  component_map = new Map<string, ProjectFile>();
  htmlfile_set = new Set<ProjectFile>();

  async onAdd(builder: BuilderInternal, files: Set<ProjectFile>): Promise<void> {
    const component_path = Path(builder.dir.lib, 'components');
    let trigger_reprocess = false;
    for (const file of files) {
      if (file.src_path.ext === '.html') {
        if (file.src_path.startsWith(component_path)) {
          this.component_map.set(file.src_path.name, file);
          trigger_reprocess = true;
        }
        file.addProcessor(this, this.onProcess);
        this.htmlfile_set.add(file);
      }
    }
    if (trigger_reprocess === true) {
      for (const file of this.htmlfile_set) {
        builder.reprocessFile(file);
      }
    }
  }
  async onRemove(builder: BuilderInternal, files: Set<ProjectFile>): Promise<void> {
    const component_path = Path(builder.dir.lib, 'components');
    let component_added = false;
    for (const file of files) {
      if (file.src_path.ext === '.html') {
        if (file.src_path.startsWith(component_path)) {
          this.component_map.delete(file.src_path.name);
          component_added = true;
        }
        this.htmlfile_set.delete(file);
      }
    }
    if (component_added === true) {
      for (const file of this.htmlfile_set) {
        builder.reprocessFile(file);
      }
    }
  }
  async onProcess(builder: BuilderInternal, file: ProjectFile): Promise<void> {
    let update_text = false;
    const root_element = ParseHTML((await file.getText()).trim(), { convert_tagnames_to_lowercase: true, self_close_void_tags: true });
    for (const [component_name, component_file] of this.component_map) {
      try {
        const placeholder_elements = root_element.getElementsByTagName(component_name);
        if (placeholder_elements.length > 0) {
          builder.addDependency(component_file, file);
          for (const placeholder_element of placeholder_elements) {
            // Steps
            //
            // 1. Create new component element
            //
            placeholder_element.insertAdjacentHTML('afterend', (await component_file.getText()).trim());
            const component_element = placeholder_element.nextElementSibling;
            if (component_element) {
              //
              // 2. Overwrite attributes (merge class and style)
              //
              for (const [key, value] of Object.entries(placeholder_element.attributes)) {
                switch (key) {
                  case 'class':
                    component_element.setAttribute(key, [component_element.getAttribute(key), value].filter((_) => _).join(' '));
                    break;
                  case 'style':
                    component_element.setAttribute(key, [component_element.getAttribute(key), value].filter((_) => _).join(';'));
                    break;
                  default:
                    component_element.setAttribute(key, value);
                    break;
                }
              }
              //
              // 3. Move child nodes
              //
              const slot = component_element.querySelector('slot');
              if (slot) {
                slot.replaceWith(...placeholder_element.childNodes);
              } else {
                for (const child of placeholder_element.childNodes) {
                  component_element.appendChild(child);
                }
              }
              //
              // 4. Remove old element
              //
              placeholder_element.remove();
              update_text = true;
            }
          }
        }
      } catch (error) {
        this.channel.error(`ERROR: Processor: ${__filename}, File: ${file.src_path}`);
        this.channel.log(error);
      }
    }
    if (update_text === true) {
      file.setText(root_element.toString());
    }
  }
}
