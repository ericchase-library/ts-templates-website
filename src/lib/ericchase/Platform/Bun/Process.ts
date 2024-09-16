import { ConsoleLog } from '../../Utility/Console.js';

export async function Run(cmd: string | string[]) {
  ConsoleLog(`[${new Date().toLocaleTimeString()}] > ${cmd}`);
  if (Array.isArray(cmd)) {
    return Bun.spawn(cmd, { stdout: 'inherit', stderr: 'inherit' }).exited;
  }
  return Bun.spawn(cmd.split(' '), { stdout: 'inherit', stderr: 'inherit' }).exited;
}

export async function RunQuiet(cmd: string | string[]) {
  if (Array.isArray(cmd)) {
    return Bun.spawn(cmd, { stdout: 'ignore', stderr: 'ignore' }).exited;
  }
  return Bun.spawn(cmd.split(' '), { stdout: 'ignore', stderr: 'ignore' }).exited;
}
