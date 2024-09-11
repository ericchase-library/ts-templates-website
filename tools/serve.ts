await Bun.spawn(['bun', 'run', './tools/dev.ts'], { cwd: './dev_server/', stdout: 'inherit', stderr: 'inherit' }).exited;
