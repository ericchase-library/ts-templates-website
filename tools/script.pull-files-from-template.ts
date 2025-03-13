import { Path } from 'src/lib/ericchase/Platform/FilePath.js';
import { Builder } from 'tools/lib/Builder.js';
import { BuildStep_BunInstall } from 'tools/lib/steps/Bun-Install.js';
import { BuildStep_FSCleanDirectory } from 'tools/lib/steps/FS-CleanDirectory.js';
import { BuildStep_FSCopyFiles } from 'tools/lib/steps/FS-Copy-Files.js';
import { BuildStep_FSFormat } from 'tools/lib/steps/FS-Format.js';
import { BuildStep_FSMirrorDirectory } from 'tools/lib/steps/FS-Mirror-Directory.js';

const builder = new Builder(Bun.argv[2] === '--watch' ? 'watch' : 'build');

const template_project_path = Path('../../Project@Template');
builder.setStartupSteps([
  BuildStep_BunInstall(),

  // Mirror Template Project Server Directories
  BuildStep_FSMirrorDirectory({ from: Path(template_project_path, 'server/'), to: 'server/', include_patterns: ['**/*'], exclude_patterns: ['node_modules/**/*', 'bun.lockb'] }),

  // Mirror Template Project Directories "src/lib/ericchase", "tools/lib"
  BuildStep_FSMirrorDirectory({ from: Path(template_project_path, 'src/lib/ericchase/'), to: 'src/lib/ericchase/', include_patterns: ['**/*.ts'] }),
  BuildStep_FSMirrorDirectory({ from: Path(template_project_path, 'tools/lib/'), to: 'tools/lib/', include_patterns: ['**/*.ts'] }),

  // Copy Template Project Root Files
  BuildStep_FSCopyFiles({ from: Path(template_project_path, './'), to: './', include_patterns: ['.gitignore', '.prettierignore', '.prettierrc', 'LICENSE-APACHE', 'biome.json', 'tsconfig.json'], overwrite: true }),
  BuildStep_FSCopyFiles({ from: Path(template_project_path, './'), to: './', include_patterns: ['package.json'], overwrite: false }),
  BuildStep_FSCleanDirectory([builder.dir.out]),

  BuildStep_FSFormat('quiet'),
  //
]);

await builder.start();
