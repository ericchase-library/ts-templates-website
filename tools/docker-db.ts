import { ConsoleError } from '../src/lib/ericchase/Utility/Console.js';

const [command] = Bun.argv.slice(2);

ConsoleError('reminder: make sure docker desktop is running');
if (command === 'start') {
  Bun.spawnSync(['docker-compose', 'up', '-d'], { cwd: './dev_database', stdout: 'inherit', stderr: 'inherit' });
}
if (command === 'stop') {
  Bun.spawnSync(['docker-compose', 'down'], { cwd: './dev_database', stdout: 'inherit', stderr: 'inherit' });
}
