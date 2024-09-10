await Bun.spawn(['bun', 'run', './tools/dev.ts'], { cwd: './local_server/', stdout: 'inherit', stderr: 'inherit' }).exited;
