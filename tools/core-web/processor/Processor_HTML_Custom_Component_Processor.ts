import { BunPlatform_Glob_Match } from '../../../src/lib/ericchase/BunPlatform_Glob_Match.js';
import { NODE_PATH } from '../../../src/lib/ericchase/NodePlatform.js';
import { NodePlatform_PathObject_Relative_Class } from '../../../src/lib/ericchase/NodePlatform_PathObject_Relative_Class.js';
import { Builder } from '../../core/Builder.js';
import { HTML_UTIL } from '../../core/bundle/html-util/html-util.js';
import { Logger } from '../../core/Logger.js';

export function Processor_HTML_Custom_Component_Processor(): Builder.Processor {
  return new Class();
}
class Class implements Builder.Processor {
  ProcessorName = Processor_HTML_Custom_Component_Processor.name;
  channel = Logger(this.ProcessorName).newChannel();

  /** name to htmlfile */
  component_map = new Map<string, Builder.File>();
  /** name to upstream names */
  component_upstream_map = new Map<string, Set<string>>();
  htmlfile_set = new Set<Builder.File>();

  async onAdd(files: Set<Builder.File>): Promise<void> {
    let trigger_reprocess = false;
    for (const file of files) {
      const query = file.src_path;
      if (BunPlatform_Glob_Match(query, `${Builder.Dir.Lib}/components/**/*{.css,.html}`) === true) {
        const pathobject = NodePlatform_PathObject_Relative_Class(file.src_path);
        switch (pathobject.ext) {
          case '.html':
            file.addProcessor(this, this.onProcess);
            this.component_map.set(pathobject.name, file);
            this.htmlfile_set.add(file);
            break;
        }
        trigger_reprocess = true;
        continue;
      }
      if (BunPlatform_Glob_Match(query, `${Builder.Dir.Src}/**/*.html`) === true) {
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
    let trigger_reprocess = false;
    for (const file of files) {
      const query = file.src_path;
      if (BunPlatform_Glob_Match(query, `${Builder.Dir.Lib}/components/**/*{.css,.html}`) === true) {
        const pathobject = NodePlatform_PathObject_Relative_Class(file.src_path);
        switch (pathobject.ext) {
          case '.html':
            this.component_map.delete(pathobject.name);
            this.component_upstream_map.delete(pathobject.name);
            this.htmlfile_set.delete(file);
            break;
        }
        trigger_reprocess = true;
        continue;
      }
      if (BunPlatform_Glob_Match(query, `${Builder.Dir.Src}/**/*.html`) === true) {
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
    const source_node = HTML_UTIL.ParseDocument(source_html, { recognize_self_closing_tags: true }); // html only supports self-closing void tags
    const source_pathobject = NodePlatform_PathObject_Relative_Class(file.src_path);
    const source_object: SourceObject = {
      is_modified: false,
      source_dir: source_pathobject.dir,
      source_node,
      source_head: HTML_UTIL.QuerySelector(source_node, 'head'),
    };

    const component_upstream_set = new Set<string>([source_pathobject.name]);

    // process component html files
    for (const [component_name, component_file] of this.component_map) {
      const component_html = (await component_file.getText()).trim();
      const { instance_count } = ProcessCustomComponent(source_object, component_name, component_html);
      if (instance_count > 0) {
        component_upstream_set.add(component_name);
        file.addUpstreamFile(component_file);
      }
    }

    if (BunPlatform_Glob_Match(file.src_path, `${Builder.Dir.Lib}/components/**/*.html`) === true) {
      this.component_upstream_map.set(source_pathobject.name, component_upstream_set);
    } else {
      // remove component links from non-component source
      for (const node of HTML_UTIL.QuerySelectorAll(source_object.source_node, 'link')) {
        const import_path = NODE_PATH.join(source_object.source_dir, HTML_UTIL.GetAttribute(node, 'href') ?? '');
        if (BunPlatform_Glob_Match(import_path, `${Builder.Dir.Lib}/components/**/*.css`) === true) {
          HTML_UTIL.RemoveNode(node);
          source_object.is_modified = true;
        }
      }
      // add component links to non-component source
      if (source_object.source_head !== undefined) {
        const nodes = CreateStylesheetLinks(source_object, this.component_map, this.component_upstream_map, component_upstream_set);
        for (const node of nodes) {
          HTML_UTIL.AppendChild(source_object.source_head, node);
          source_object.is_modified = true;
        }
      }
    }

    RemapImports(source_object);

    if (source_object.is_modified === true) {
      file.setText(HTML_UTIL.GetHTML(source_node));
    }
  }
}
interface SourceObject {
  is_modified: boolean;
  source_dir: string;
  source_node: HTML_UTIL.ClassDOMNode;
  source_head: HTML_UTIL.ClassDOMNode | undefined;
}

function ProcessCustomComponent(source_object: SourceObject, component_name: string, component_html: string): { instance_count: number } {
  let instance_count = 0;
  const placeholder_list = HTML_UTIL.QuerySelectorAll(source_object.source_node, component_name);
  for (const placeholder_node of placeholder_list) {
    instance_count++;
    const component_document = HTML_UTIL.ParseDocument(component_html, { recognize_self_closing_tags: true }); // html only supports self-closing void tags
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
      source_object.is_modified = true;
    }
  }
  return { instance_count };
}
function RemapImports(source_object: SourceObject): void {
  for (const script of HTML_UTIL.QuerySelectorAll(source_object.source_node, 'script')) {
    const src = HTML_UTIL.GetAttribute(script, 'src');
    if (src !== undefined) {
      const ext = NODE_PATH.parse(src).ext;
      switch (ext) {
        case '.jsx':
        case '.ts':
        case '.tsx':
          HTML_UTIL.SetAttribute(script, 'src', `${src.slice(0, src.lastIndexOf(ext))}.js`);
          source_object.is_modified = true;
          break;
      }
    }
  }
}
function CreateStylesheetLinks(source_object: SourceObject, component_map: Map<string, Builder.File>, component_upstream_map: Map<string, Set<string>>, component_upstream_set: Set<string>): HTML_UTIL.ClassDOMNode[] {
  const upstream_set = new Set<string>();
  for (const component_name of component_upstream_set) {
    for (const upstream_name of component_upstream_map.get(component_name) ?? []) {
      upstream_set.add(upstream_name);
    }
  }
  const nodes: HTML_UTIL.ClassDOMNode[] = [];
  for (const upstream_name of upstream_set) {
    const htmlfile = component_map.get(upstream_name);
    if (htmlfile !== undefined) {
      const cssfile = Builder.File.Get(NodePlatform_PathObject_Relative_Class(htmlfile.src_path).replaceExt('.css').join());
      if (cssfile !== undefined) {
        cssfile.iswritable = true;
        const relative_path = NodePlatform_PathObject_Relative_Class(NODE_PATH.relative(source_object.source_dir, cssfile.src_path)).toPosix().join({ dot: true });
        nodes.push(HTML_UTIL.ParseDocument(`<link rel="stylesheet" href="${relative_path}">`).childNodes[0]);
      }
    }
  }
  return nodes;
}
