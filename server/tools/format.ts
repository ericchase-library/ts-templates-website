await Bun.spawn(['prettier', '--write', '.'], {
  stderr: 'inherit',
  stdout: 'inherit',
}).exited;
