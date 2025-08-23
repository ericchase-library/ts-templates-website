import { Async_BunPlatform_File_Read_Text } from '../../../src/lib/ericchase/BunPlatform_File_Read_Text.js';
import { Async_BunPlatform_File_Write_Text } from '../../../src/lib/ericchase/BunPlatform_File_Write_Text.js';
import { Core_JSON_Merge } from '../../../src/lib/ericchase/Core_JSON_Merge.js';
import { NODE_PATH } from '../../../src/lib/ericchase/NodePlatform.js';
import { Async_NodePlatform_File_Delete } from '../../../src/lib/ericchase/NodePlatform_File_Delete.js';
import { Builder } from '../../core/Builder.js';
import { JSONC } from '../../core/bundle/jsonc-parse/jsonc-parse.js';
import { Logger } from '../../core/Logger.js';

/**
 * This step processes files in `Builder.Dir.Out` only. Ensure that all config paths are relative to that folder.
 */
export function Step_Output_Merge_Files(config: Config): Builder.Step {
  return new Class(config);
}

class Class implements Builder.Step {
  StepName = Step_Output_Merge_Files.name;
  channel = Logger(this.StepName).newChannel();

  steps: Builder.Step[] = [];

  constructor(readonly config: Config) {}
  async onRun(): Promise<void> {
    for (const task of this.config.merge_tasks) {
      switch (task.type) {
        case 'json':
          {
            const data_list: any[] = [];
            // read merge files
            for (const path of task.merge_files) {
              const { error, value } = await Async_BunPlatform_File_Read_Text(NODE_PATH.join(Builder.Dir.Out, path));
              if (value !== undefined) {
                data_list.push(JSONC.parse(value));
              } else {
                throw error;
              }
            }
            const data = Core_JSON_Merge(...data_list);
            this.channel.log(`Merge ${task.merge_files.map((_) => `"${_}"`).join(', ')}`);
            await task.modify?.(data);
            // delete merge files
            for (const path of task.merge_files) {
              await Async_NodePlatform_File_Delete(path);
              this.channel.log(`Delete "${path}"`);
            }
            // write output file
            await Async_BunPlatform_File_Write_Text(task.out_file, JSON.stringify(data, null, 2).trim() + '\n');
            this.channel.log(`Write "${task.out_file}"`);
          }
          break;
        case 'text':
          {
            const text_list: any[] = [];
            // read merge files
            for (const path of task.merge_files) {
              const { error, value } = await Async_BunPlatform_File_Read_Text(NODE_PATH.join(Builder.Dir.Out, path));
              if (value !== undefined) {
                text_list.push(value.trim());
              } else {
                throw error;
              }
            }
            const text = text_list.join('\n\n');
            this.channel.log(`Merge ${task.merge_files.map((_) => `"${_}"`).join(', ')}`);
            // delete merge files
            for (const path of task.merge_files) {
              await Async_NodePlatform_File_Delete(path);
              this.channel.log(`Delete "${path}"`);
            }
            // write output file
            await Async_BunPlatform_File_Write_Text(task.out_file, text + '\n');
            this.channel.log(`Write "${task.out_file}"`);
          }
          break;
      }
    }
  }
}
interface Config {
  /**
   * For `type` `json`, later files in `merge_list` merge onto earlier files.
   *
   * For `type` `text`, later files in `merge_list` append to bottom of output
   * file.
   *
   * In all cases, `merge_files` are deleted, and `out_file` is overwritten.
   */
  merge_tasks: (
    | {
        type: 'json';
        merge_files: string[];
        out_file: string;
        modify?: (data: any) => Promise<void> | void;
      }
    | {
        type: 'text';
        merge_files: string[];
        out_file: string;
      }
  )[];
}
