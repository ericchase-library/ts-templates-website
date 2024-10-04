import { UpdateMarkerManager } from './UpdateMarker.js';

const marker_manager = new UpdateMarkerManager<{ newline_count: number }>({ newline_count: 0 });

export function GetConsoleMarker() {
  return marker_manager.getNewMarker();
}

export function ConsoleError(...items: any[]) {
  // biome-ignore lint: this let's us search for undesired console[error]s
  console['error'](...items);
  marker_manager.extra.newline_count = 0;
  marker_manager.updateMarkers();
}

export function ConsoleErrorWithDate(...items: any[]) {
  // biome-ignore lint: this let's us search for undesired console[error]s
  console['error'](`[${new Date().toLocaleTimeString()}]`, ...items);
  marker_manager.extra.newline_count = 0;
  marker_manager.updateMarkers();
}

export function ConsoleLog(...items: any[]) {
  // biome-ignore lint: this let's us search for undesired console[log]s
  console['log'](...items);
  marker_manager.extra.newline_count = 0;
  marker_manager.updateMarkers();
}

export function ConsoleLogWithDate(...items: any[]) {
  // biome-ignore lint: this let's us search for undesired console[log]s
  console['log'](`[${new Date().toLocaleTimeString()}]`, ...items);
  marker_manager.extra.newline_count = 0;
  marker_manager.updateMarkers();
}

export function ConsoleNewline(ensure_count = 1) {
  for (let i = marker_manager.extra.newline_count; i < ensure_count; i++) {
    // biome-ignore lint: this let's us search for undesired console[log]s
    console['log']();
    marker_manager.extra.newline_count++;
  }
  marker_manager.updateMarkers();
}

export function ConsoleLogToLines(items: Iterable<any>) {
  if (typeof items === 'string') {
    ConsoleLog(items);
  } else {
    for (const item of items) {
      ConsoleLog(item);
    }
  }
}

export function ConsoleErrorToLines(items: Iterable<any>) {
  if (typeof items === 'string') {
    ConsoleError(items);
  } else {
    for (const item of items) {
      ConsoleError(item);
    }
  }
}
