import { Async_BunPlatform_File_Read_Text } from '../../../src/lib/ericchase/BunPlatform_File_Read_Text.js';
import { Async_BunPlatform_File_Write_Text } from '../../../src/lib/ericchase/BunPlatform_File_Write_Text.js';
import { Core_JSON_Merge } from '../../../src/lib/ericchase/Core_JSON_Merge.js';
import { NODE_PATH } from '../../../src/lib/ericchase/NodePlatform.js';
import { Builder } from '../../core/Builder.js';
import { JSONC_Parse } from '../../core/bundle/jsonc-parser/parse.js';
import { Logger } from '../../core/Logger.js';

export function Step_Dev_Project_Update_Config(config: Config): Builder.Step {
  return new Class(config);
}
class Class implements Builder.Step {
  StepName = Step_Dev_Project_Update_Config.name;
  channel = Logger(this.StepName).newChannel();

  constructor(public config: Config) {}
  async onStartUp(): Promise<void> {}
  async onRun(): Promise<void> {
    // JSON-based Configs
    await Async_MergeJSONConfigs(this.config.project_path, '.vscode/settings.json');
    await Async_MergeJSONConfigs(this.config.project_path, '.prettierrc');
    await Async_MergeJSONConfigs(this.config.project_path, 'package.json');
    await Async_MergeJSONConfigs(this.config.project_path, 'tsconfig.json');

    // INI-based Configs
    await Async_MergeINIConfigs(this.config.project_path, '.gitignore');
    await Async_MergeINIConfigs(this.config.project_path, '.prettierignore');
  }
  async onCleanUp(): Promise<void> {}
}
interface Config {
  project_path: string;
}

async function Async_MergeJSONConfigs(project_path: string, config_path: string) {
  const base_config = JSONC_Parse((await Async_BunPlatform_File_Read_Text(NODE_PATH.join(project_path, Builder.Dir.Tools, 'base-config', config_path))).value ?? '{}');
  const repo_config = JSONC_Parse((await Async_BunPlatform_File_Read_Text(NODE_PATH.join(project_path, 'repo-config', config_path))).value ?? '{}');
  await Async_BunPlatform_File_Write_Text(NODE_PATH.join(project_path, config_path), JSON.stringify(Core_JSON_Merge(base_config, repo_config), null, 2));
}

async function Async_MergeINIConfigs(project_path: string, config_path: string) {
  const base_config = (await Async_BunPlatform_File_Read_Text(NODE_PATH.join(project_path, Builder.Dir.Tools, 'base-config', config_path))).value ?? '';
  const repo_config = (await Async_BunPlatform_File_Read_Text(NODE_PATH.join(project_path, 'repo-config', config_path))).value ?? '';
  const separator = '\n\n## Project Specific\n\n';
  await Async_BunPlatform_File_Write_Text(NODE_PATH.join(project_path, config_path), base_config.trim() + separator + repo_config.trim() + '\n');
}
