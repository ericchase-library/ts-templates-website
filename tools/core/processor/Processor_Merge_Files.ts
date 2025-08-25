import { Core_JSON_Merge } from '../../../src/lib/ericchase/Core_JSON_Merge.js';
import { NODE_PATH } from '../../../src/lib/ericchase/NodePlatform.js';
import { Builder } from '../../core/Builder.js';
import { JSONC } from '../../core/bundle/jsonc-parse/jsonc-parse.js';
import { Logger } from '../../core/Logger.js';

export function Processor_Merge_Files(...configs: Config[]): Builder.Processor {
  return new Class(configs);
}
class Class implements Builder.Processor {
  ProcessorName = Processor_Merge_Files.name;
  channel = Logger(this.ProcessorName).newChannel();

  config_map = new Map<string, Config>();

  constructor(readonly configs: Config[]) {}
  async onStartUp(): Promise<void> {
    for (const config of this.configs) {
      for (let i = 0; i < config.merge_paths.length; i++) {
        config.merge_paths[i] = NODE_PATH.join(Builder.Dir.Src, config.merge_paths[i]);
      }
      config.out_path = NODE_PATH.join(Builder.Dir.Src, config.out_path);
      this.config_map.set(config.out_path, config);
    }
  }
  async onAdd(files: Set<Builder.File>): Promise<void> {
    for (const file of files) {
      if (this.config_map.has(file.src_path)) {
        file.addProcessor(this, this.onProcess);
      }
    }
  }

  async onProcess(file: Builder.File): Promise<void> {
    const config = this.config_map.get(file.src_path);
    if (config !== undefined) {
      const merge_files = new Set<Builder.File>();
      for (const path of config.merge_paths) {
        const merge_file = Builder.File.Get(path);
        if (merge_file !== undefined) {
          merge_files.add(merge_file);
        }
      }

      switch (config.type) {
        case 'json':
          {
            const data_list: any[] = [];
            for (const file of merge_files) {
              const text = await file.getText();
              data_list.push(JSONC.parse(text));
            }
            const merge_data = Core_JSON_Merge(...data_list);
            await config.modify?.(merge_data);
            const merge_text = JSON.stringify(merge_data, null, 2).trim();
            file.setText(merge_text + '\n');
          }
          break;
        case 'text':
          {
            const text_list: any[] = [];
            for (const file of merge_files) {
              const text = await file.getText();
              text_list.push(text.trim());
            }
            const merge_text = text_list.join('\n\n').trim();
            file.setText(merge_text + '\n');
          }
          break;
      }
    }
  }
}
type Config =
  | {
      /**
       * For `type` `json`, later files are merged on top of earlier files.
       */
      type: 'json';
      /**
       * Merged files are deleted on successful merging.
       */
      merge_paths: string[];
      /**
       * Out file is overwritten on successful merging.
       */
      out_path: string;
      modify?: (data: any) => Promise<void> | void;
    }
  | {
      /**
       * For `type` `text`, later files are appended to bottom of output file.
       */
      type: 'text';
      /**
       * Merged files are deleted on successful merging.
       */
      merge_paths: string[];
      /**
       * Out file is overwritten on successful merging.
       */
      out_path: string;
    };
