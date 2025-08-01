console.log(process.env);

const { stdout } = Bun.spawnSync(['node', '--version']);
console.log(new TextDecoder().decode(stdout));
