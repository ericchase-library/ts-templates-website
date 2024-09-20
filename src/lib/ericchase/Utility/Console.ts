export function ConsoleLog(...items: any[]) {
  // biome-ignore lint: this let's us search for undesired console[log]s
  console['log'](...items);
}
export function ConsoleError(...items: any[]) {
  // biome-ignore lint: this let's us search for undesired console[error]s
  console['error'](...items);
}
