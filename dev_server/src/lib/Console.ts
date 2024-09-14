export function ConsoleLog(...items: any[]) {
  // biome-ignore lint: this let's us search for undesired `console.log`
  console['log'](...items);
}
export function ConsoleError(...items: any[]) {
  // biome-ignore lint: this let's us search for undesired `console.error`
  console['error'](...items);
}
