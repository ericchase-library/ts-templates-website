import { type NodeHTMLParser, ParseHTML } from '../../../src/lib/ericchase/Platform/Node/HTML Processor/ParseHTML.js';
import type { Path, PathGroup } from '../../../src/lib/ericchase/Platform/Node/Path.js';
import type { SyncAsync } from '../../../src/lib/ericchase/Utility/Types.js';
import type { HTMLPreprocessor } from './HTMLPreprocessor.js';

export class CustomComponentPreprocessor implements HTMLPreprocessor {
  component_loaders = new Map<string, () => SyncAsync<string | undefined>>();
  component_paths = new Set<string>();
  component_usage_count = new Map<string, number>();
  async preprocess(root: NodeHTMLParser.HTMLElement) {
    for (const [tag, loader] of this.component_loaders) {
      const target_elements = root.querySelectorAll(tag);
      if (target_elements.length > 0) {
        this.component_usage_count.set(tag, (this.component_usage_count.get(tag) ?? 0) + 1);
        const component_html = await loader();
        if (component_html) {
          for (const element of root.querySelectorAll(tag)) {
            // Steps
            //
            // 1. Create new component element
            //
            element.insertAdjacentHTML('afterend', component_html);
            const component = element.nextElementSibling;
            if (!component) continue;
            //
            // 2. Overwrite attributes (merge class and style)
            //
            for (const [key, value] of Object.entries(element.attributes)) {
              if (key === 'class') {
                component.setAttribute(key, [component.getAttribute(key), value].filter((_) => _).join(' '));
              } else if (key === 'style') {
                component.setAttribute(key, [component.getAttribute(key), value].filter((_) => _).join(';'));
              } else {
                component.setAttribute(key, value);
              }
            }
            //
            // 3. Move child nodes
            //
            const slot = component.querySelector('slot');
            if (slot) {
              slot.replaceWith(...element.childNodes);
            } else {
              for (const child of element.childNodes) {
                component.appendChild(child);
              }
            }
            //
            // 4. Remove old element
            //
            element.remove();
          }
        }
      }
    }
  }
  registerComponentBody(tag: string, body: string) {
    if (!this.component_loaders.has(tag)) {
      this.component_usage_count.set(tag, 0);
      this.component_loaders.set(tag, () => body);
    }
    return this;
  }
  registerComponentPath(tag: string, path: Path | PathGroup, as_is = false) {
    if (!this.component_loaders.has(tag)) {
      if (as_is) {
        this.component_loaders.set(tag, async () => {
          try {
            return await Bun.file(path.path).text();
          } catch (error) {}
        });
      } else {
        this.component_loaders.set(tag, async () => {
          try {
            const document = ParseHTML(await Bun.file(path.path).text());
            const body = document.querySelector('body');
            return (body ? body.querySelector('*') : document.querySelector('*'))?.toString();
          } catch (error) {}
        });
      }
      this.component_paths.add(path.path);
      this.component_usage_count.set(tag, 0);
    }
    return this;
  }
}
