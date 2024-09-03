await Bun.spawn(['bun', 'run', './tools/start.ts'], { cwd: './local_server/', stdout: 'inherit', stderr: 'inherit' }).exited;
