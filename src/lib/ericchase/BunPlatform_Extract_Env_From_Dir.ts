import { NODE_PATH } from './NodePlatform.js';

interface Options {
  /**
   * Specify extra ".env" files to load on top of the automatically loaded
   * `.env` files.
   *
   * Note: Bun reads the following files automatically (listed in order of
   * increasing precedence), regardless of which files you specify.
   * - [1] .env
   * - [2] .env.production, .env.development, .env.test (depending on value of
   *   NODE_ENV)
   * - [3] .env.local
   *
   * @default undefined
   */
  envfiles?: string[];
  /**
   * Set the target folder to run the environment variable extraction process
   * in.
   *
   * (`cwd` is short for "current working directory")
   */
  cwd: string;
}

/**
 * This is a helper function for extracting specific environment variables from
 * a process ran inside a target folder.
 *
 * @param {string[]} names - The specific environment variable names to
 * extract. If you want all environment variables of the currently running
 * process, use `Bun.env` directly. If you want to extract all environment
 * variables with names matching values in `Bun.argv` from the currently
 * running process, then call the `BunPlatform_Argv_To_Env` function.
 */
export async function Async_BunPlatform_Extract_Env_From_Dir(
  options: Options,
  ...names: string[]
): Promise<
  | {
      error: string;
      type: 'json';
      value: any;
    }
  | {
      error: string;
      type: 'text';
      value: string;
    }
> {
  options.envfiles ??= [];

  const path =
    names.length === 0
      ? NODE_PATH.join(__dirname, 'BunPlatform_Helper_Send_Env_To_Stdout.ts') //
      : NODE_PATH.join(__dirname, 'BunPlatform_Helper_Send_Argv_To_Env_To_Stdout.ts');

  let cmd = ['bun'];
  for (const envfile of options.envfiles) {
    cmd.push(`--env-file=${envfile}`);
  }
  cmd.push('run', path);
  for (const name of names) {
    cmd.push(name);
  }

  const p0 = Bun.spawn(cmd, { cwd: options.cwd, stdout: 'pipe', stderr: 'pipe' });
  await p0.exited;
  const stderr = await new Response(p0.stderr).text();
  const stdout = await new Response(p0.stdout).text();
  try {
    return {
      error: stderr,
      type: 'json',
      value: JSON.parse(stdout),
    };
  } catch {}
  return {
    error: stderr,
    type: 'text',
    value: stdout,
  };
}
