import { type NodeHTMLParser, ParseHTML } from '../../src/lib/ericchase/Platform/Web/HTML/ParseHTML.js';
import { LazyTask } from '../../src/lib/ericchase/Utility/Task.js';
import type { HTMLPreprocessor } from './build.js';

export class CustomComponentPreprocessor implements HTMLPreprocessor {
  component_loaders = new Map<string, LazyTask<string | undefined>>();
  component_paths = new Set<string>();
  component_usage_count = new Map<string, number>();
  get preprocess() {
    return async (root: NodeHTMLParser.HTMLElement) => {
      for (const [tag, loader] of this.component_loaders) {
        const target_elements = root.querySelectorAll(tag);
        if (target_elements.length > 0) {
          this.component_usage_count.set(tag, (this.component_usage_count.get(tag) ?? 0) + 1);
          const component_html = await loader.get;
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
    };
  }
  registerComponentBody(tag: string, body: string) {
    if (!this.component_loaders.has(tag)) {
      this.component_usage_count.set(tag, 0);
      this.component_loaders.set(tag, new LazyTask(async () => body));
    }
    return this;
  }
  registerComponentPath(tag: string, path: string, as_is = false) {
    if (!this.component_loaders.has(tag)) {
      this.component_loaders.set(
        tag,
        new LazyTask(async () => {
          try {
            if (as_is) {
              return Bun.file(path).text();
            }
            const document = ParseHTML(await Bun.file(path).text());
            const body = document.querySelector('body');
            return (body ? body.querySelector('*') : document.querySelector('*'))?.toString();
          } catch (error) {}
        }),
      );
      this.component_paths.add(path);
      this.component_usage_count.set(tag, 0);
    }
    return this;
  }
}
