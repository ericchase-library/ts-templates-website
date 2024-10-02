namespace Console {
  export let newline_count = 0;
  export let marks = new Set<{ updated: boolean }>();
}

function updateMarks() {
  for (const mark of Console.marks) {
    Console.marks.delete(mark);
    mark.updated = true;
  }
}

export function GetConsoleMark() {
  const mark = { updated: false };
  Console.marks.add(mark);
  return mark;
}

export function ConsoleError(...items: any[]) {
  // biome-ignore lint: this let's us search for undesired console[error]s
  console['error'](...items);
  Console.newline_count = 0;
  updateMarks();
}

export function ConsoleErrorWithDate(...items: any[]) {
  // biome-ignore lint: this let's us search for undesired console[error]s
  console['error'](`[${new Date().toLocaleTimeString()}]`, ...items);
  Console.newline_count = 0;
  updateMarks();
}

export function ConsoleLog(...items: any[]) {
  // biome-ignore lint: this let's us search for undesired console[log]s
  console['log'](...items);
  Console.newline_count = 0;
  updateMarks();
}

export function ConsoleLogWithDate(...items: any[]) {
  // biome-ignore lint: this let's us search for undesired console[log]s
  console['log'](`[${new Date().toLocaleTimeString()}]`, ...items);
  Console.newline_count = 0;
  updateMarks();
}

export function ConsoleNewline(ensure_count = 1) {
  for (let i = Console.newline_count; i < ensure_count; i++) {
    // biome-ignore lint: this let's us search for undesired console[log]s
    console['log']();
    Console.newline_count++;
  }
  updateMarks();
}

export function ConsoleLogToLines(items: Iterable<any>) {
  for (const item of items) {
    ConsoleLog(item);
  }
}
export function ConsoleErrorToLines(items: Iterable<any>) {
  for (const item of items) {
    ConsoleError(item);
  }
}
