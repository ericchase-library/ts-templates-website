import { BunPlatform_Glob_Match_Ex } from '../../../src/lib/ericchase/BunPlatform_Glob_Match_Ex.js';
import { NODE_PATH } from '../../../src/lib/ericchase/NodePlatform.js';
import { NodePlatform_PathObject_Relative_Class } from '../../../src/lib/ericchase/NodePlatform_PathObject_Relative_Class.js';
import { Builder } from '../../core/Builder.js';
import { HTML_UTIL } from '../../core/bundle/html-util/html-util.js';
import { Logger } from '../../core/Logger.js';

export function Processor_HTML_Remove_HotReload_On_Build(): Builder.Processor {
  return new Class();
}
class Class implements Builder.Processor {
  ProcessorName = Processor_HTML_Remove_HotReload_On_Build.name;
  channel = Logger(this.ProcessorName).newChannel();

  async onAdd(files: Set<Builder.File>): Promise<void> {
    if (Builder.GetMode() !== Builder.MODE.BUILD) return;
    for (const file of files) {
      const query = file.src_path;
      if (BunPlatform_Glob_Match_Ex(query, [`${Builder.Dir.Src}/**/*.html`], [`${Builder.Dir.Lib}/**`]) === true) {
        file.addProcessor(this, this.onProcess);
      }
    }
  }

  async onProcess(file: Builder.File): Promise<void> {
    const source_html = (await file.getText()).trim();
    const source_node = HTML_UTIL.ParseDocument(source_html, { recognize_self_closing_tags: true }); // html only supports self-closing void tags
    let modified = false;
    // remap imports
    for (const script of HTML_UTIL.QuerySelectorAll(source_node, 'script')) {
      const src = HTML_UTIL.GetAttribute(script, 'src');
      if (src !== undefined) {
        if (NodePlatform_PathObject_Relative_Class(src).replaceExt('').join().endsWith(NODE_PATH.join('lib/server/hot-reload.iife'))) {
          HTML_UTIL.RemoveNode(script);
          modified = true;
        }
      }
    }
    if (modified === true) {
      file.setText(HTML_UTIL.GetHTML(source_node));
    }
  }
}
