import { NODE_PATH } from '../../../src/lib/ericchase/NodePlatform.js';
import { NodePlatform_PathObject_Relative_Class } from '../../../src/lib/ericchase/NodePlatform_PathObject_Relative_Class.js';
import { Builder } from '../../core/Builder.js';
import { Logger } from '../../core/Logger.js';
import { HTML_UTIL } from '../bundle/htmlutil.js';

export function Processor_HTML_Custom_Component_Processor(): Builder.Processor {
  return new Class();
}
class Class implements Builder.Processor {
  ProcessorName = Processor_HTML_Custom_Component_Processor.name;
  channel = Logger(this.ProcessorName).newChannel();

  component_map = new Map<string, Builder.File>();
  htmlfile_set = new Set<Builder.File>();

  async onAdd(files: Set<Builder.File>): Promise<void> {
    const component_path = NODE_PATH.join(Builder.Dir.Lib, 'components');
    let trigger_reprocess = false;
    for (const file of files) {
      const src_pathobject = NodePlatform_PathObject_Relative_Class(file.src_path);
      if (src_pathobject.ext === '.html') {
        if (file.src_path.startsWith(component_path)) {
          this.component_map.set(src_pathobject.name, file);
          trigger_reprocess = true;
        }
        file.addProcessor(this, this.onProcess);
        this.htmlfile_set.add(file);
      }
    }
    if (trigger_reprocess === true) {
      for (const file of this.htmlfile_set) {
        file.refresh();
      }
    }
  }
  async onRemove(files: Set<Builder.File>): Promise<void> {
    const component_path = NODE_PATH.join(Builder.Dir.Lib, 'components');
    let trigger_reprocess = false;
    for (const file of files) {
      const src_pathobject = NodePlatform_PathObject_Relative_Class(file.src_path);
      if (src_pathobject.ext === '.html') {
        if (file.src_path.startsWith(component_path)) {
          this.component_map.delete(src_pathobject.name);
          trigger_reprocess = true;
        }
        this.htmlfile_set.delete(file);
      }
    }
    if (trigger_reprocess === true) {
      for (const file of this.htmlfile_set) {
        file.refresh();
      }
    }
  }

  async onProcess(file: Builder.File): Promise<void> {
    const source_html = (await file.getText()).trim();
    const source_node = HTML_UTIL.ParseDocument(source_html);
    let modified = false;
    // process components
    for (const [component_name, component_file] of this.component_map) {
      const component_html = (await component_file.getText()).trim();
      const replacements = processCustomComponent(source_node, component_name, component_html);
      if (replacements > 0) {
        file.addUpstreamFile(component_file);
        modified = true;
      }
    }
    // remap imports
    for (const script of HTML_UTIL.QuerySelectorAll(source_node, 'script')) {
      const src = HTML_UTIL.GetAttribute(script, 'src');
      if (src !== undefined) {
        const ext = NODE_PATH.parse(src).ext;
        switch (ext) {
          case '.ts':
          case '.tsx':
          case '.jsx':
            HTML_UTIL.SetAttribute(script, 'src', `${src.slice(0, src.lastIndexOf(ext))}.js`);
            modified = true;
            break;
        }
      }
    }
    if (modified === true) {
      file.setText(HTML_UTIL.GetHTML(source_node));
    }
  }
}
function processCustomComponent(source_node: HTML_UTIL.ClassDOMNode, component_name: string, component_html: string): number {
  let replacements = 0;
  const placeholder_list = HTML_UTIL.QuerySelectorAll(source_node, component_name);
  for (const placeholder_node of placeholder_list) {
    const component_document = HTML_UTIL.ParseDocument(component_html);
    const component_node = component_document.childNodes.at(0);
    if (component_node !== undefined) {
      const attribute_names = new Set([...HTML_UTIL.GetAttributeNames(component_node), ...HTML_UTIL.GetAttributeNames(placeholder_node)]);
      for (const attribute_name of attribute_names) {
        switch (attribute_name) {
          case 'class':
            HTML_UTIL.MergeDelimitedAttribute(component_node, placeholder_node, attribute_name, ' ');
            break;
          case 'style':
            HTML_UTIL.MergeDelimitedAttribute(component_node, placeholder_node, attribute_name, ';');
            break;
          default:
            {
              const placeholdervalue = HTML_UTIL.GetAttribute(placeholder_node, attribute_name);
              if (placeholdervalue !== undefined) {
                HTML_UTIL.SetAttribute(component_node, attribute_name, placeholdervalue);
              }
            }
            break;
        }
      }
      const slot = HTML_UTIL.QuerySelector(component_document, 'slot');
      if (slot !== undefined) {
        HTML_UTIL.ReplaceNode(slot, placeholder_node.childNodes);
      } else {
        HTML_UTIL.AppendChild(component_node, placeholder_node.childNodes);
      }
      HTML_UTIL.ReplaceNode(placeholder_node, component_node);
      replacements += 1;
    }
  }
  return replacements;
}
