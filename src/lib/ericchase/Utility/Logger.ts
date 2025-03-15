import { Map_GetOrDefault } from 'src/lib/ericchase/Utility/Map.js';

export function Logger(uuid = '', name = '') {
  return Map_GetOrDefault(loggers, name, () => new CLogger(uuid, name));
}

// const platform = getPlatformProvider('node');
// function AddLoggerOutputFolder(path: CPath) {}

enum Kind {
  Error = 0,
  Log = 1,
}

let buffer: { kind: Kind; name: string; channel: number; items: any[]; date: number; showdate: boolean }[] = [];
let timeout: ReturnType<typeof setTimeout> | undefined;
function addlog(kind: Kind, name: string, channel: number, items: any[], showdate = false) {
  buffer.push({ kind, name, channel, items, date: Date.now(), showdate });
  timeout ??= setTimeout(() => {
    timeout = undefined;
    const lines = [];
    for (const { kind, name, channel, items, date, showdate } of buffer) {
      const line = `[${name}#${channel}] ${items.map((item) => (typeof item === 'object' ? JSON.stringify(item, null, 2) : String(item))).join(' ')}`;
      if (kind === Kind.Error) {
        if (showdate) {
          lines.push(`ERROR: (${new Date(date).toLocaleString()}) ${line}`);
        } else {
          lines.push(`ERROR: ${line}`);
        }
      } else {
        if (showdate) {
          lines.push(`(${new Date(date).toLocaleString()}) ${line}`);
        } else {
          lines.push(line);
        }
      }
    }
    buffer = [];
    console['log'](lines.join('\n'));
  }, 100);
}

class CLoggerChannel {
  constructor(
    readonly channel: number,
    readonly logger: CLogger,
  ) {}
  error(...items: any[]) {
    addlog(Kind.Error, this.logger.name, this.channel, items);
  }
  errorNotEmpty(...items: any[]) {
    for (const item of items) {
      if (Array.isArray(item) && item.length === 0) continue;
      if (ArrayBuffer.isView(item) && item.byteLength === 0) continue;
      if (typeof item === 'string' && item.length === 0) continue;
      addlog(Kind.Error, this.logger.name, this.channel, items);
      break;
    }
  }
  errorWithDate(...items: any[]) {
    addlog(Kind.Error, this.logger.name, this.channel, items, true);
  }
  log(...items: any[]) {
    addlog(Kind.Log, this.logger.name, this.channel, items);
  }
  logNotEmpty(...items: any[]) {
    for (const item of items) {
      if (Array.isArray(item) && item.length === 0) continue;
      if (ArrayBuffer.isView(item) && item.byteLength === 0) continue;
      if (typeof item === 'string' && item.length === 0) continue;
      addlog(Kind.Log, this.logger.name, this.channel, items);
      break;
    }
  }
  logWithDate(...items: any[]) {
    addlog(Kind.Log, this.logger.name, this.channel, items, true);
  }
}

class CLogger {
  constructor(
    readonly uuid: string,
    readonly name: string,
  ) {}

  error(...items: any[]) {
    addlog(Kind.Error, this.name, 0, items);
  }
  errorNotEmpty(...items: any[]) {
    for (const item of items) {
      if (Array.isArray(item) && item.length === 0) continue;
      if (ArrayBuffer.isView(item) && item.byteLength === 0) continue;
      if (typeof item === 'string' && item.length === 0) continue;
      addlog(Kind.Error, this.name, 0, items);
      break;
    }
  }
  errorWithDate(...items: any[]) {
    addlog(Kind.Error, this.name, 0, items, true);
  }
  log(...items: any[]) {
    addlog(Kind.Log, this.name, 0, items);
  }
  logNotEmpty(...items: any[]) {
    for (const item of items) {
      if (Array.isArray(item) && item.length === 0) continue;
      if (ArrayBuffer.isView(item) && item.byteLength === 0) continue;
      if (typeof item === 'string' && item.length === 0) continue;
      addlog(Kind.Log, this.name, 0, items);
      break;
    }
  }
  logWithDate(...items: any[]) {
    addlog(Kind.Log, this.name, 0, items, true);
  }

  next_channel_id = 1;
  newChannel() {
    return new CLoggerChannel(this.next_channel_id++, this);
  }
}

const loggers = new Map<string, CLogger>();
