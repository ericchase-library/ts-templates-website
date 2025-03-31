import { CPath, Path } from '../Platform/FilePath.js';
import { CPlatformProvider } from '../Platform/PlatformProvider.js';
import { Map_GetOrDefault } from './Map.js';
import { RemoveWhiteSpaceOnlyLinesFromTopAndBottom } from './String.js';

const LoggerOptions: {
  ceremony: boolean;
  console: boolean;
  list: Set<string>;
  listmode: 'allow' | 'block';
} = {
  ceremony: true,
  console: true,
  list: new Set(),
  listmode: 'block',
};

enum Kind {
  Err = 0,
  Log = 1,
}

class CLogger {
  constructor(
    readonly uuid: string,
    readonly channel: string,
    readonly name: string,
  ) {}
  error(...items: any[]) {
    addlog(Kind.Err, this, items);
  }
  errorNotEmpty(...items: any[]) {
    for (const item of items) {
      if (Array.isArray(item) && item.length === 0) continue;
      if (ArrayBuffer.isView(item) && item.byteLength === 0) continue;
      if (typeof item === 'string' && item.length === 0) continue;
      addlog(Kind.Err, this, items);
      break;
    }
  }
  log(...items: any[]) {
    addlog(Kind.Log, this, items);
  }
  logNotEmpty(...items: any[]) {
    for (const item of items) {
      if (Array.isArray(item) && item.length === 0) continue;
      if (ArrayBuffer.isView(item) && item.byteLength === 0) continue;
      if (typeof item === 'string' && item.length === 0) continue;
      addlog(Kind.Log, this, items);
      break;
    }
  }

  newChannel(): CLogger {
    return new CLogger(this.uuid, getNextChannel(this.uuid), this.name);
  }
}

let buffer: BufferItem[] = [];
let timeout: ReturnType<typeof setTimeout> | undefined;
const output_map = new Map<CPath, CPlatformProvider>();

const name_to_buffer = new Map<string, string[]>();
const name_to_logger = new Map<string, CLogger>();
const name_to_uuid = new Map<string, string>();
const uuid_to_channel = new Map<string, number>();
const uuid_to_name = new Map<string, string>();

interface BufferItem {
  date: number;
  kind: 0 | 1; // Kind.Err | Kind.Log
  uuid: string;
  channel: string;
  items: any[];
}

let unprocessedlogcount = 0;
function addlog(kind: BufferItem['kind'], logger: CLogger, items: BufferItem['items']) {
  unprocessedlogcount++;
  buffer.push({ date: Date.now(), kind, uuid: logger.uuid, channel: logger.channel, items });
  setTimer();
}
function getUuid(name: string): string {
  return Map_GetOrDefault(name_to_uuid, name, () => {
    const uuid = (name_to_uuid.size + 1).toString().padStart(2, '0');
    uuid_to_name.set(uuid, name);
    return uuid;
  });
}
function getNextChannel(uuid: string): string {
  const channel = (uuid_to_channel.get(uuid) ?? 0) + 1;
  uuid_to_channel.set(uuid, channel);
  return channel.toString().padStart(2, '0');
}
function isLoggerEnabled(name: string) {
  if (LoggerOptions.listmode === 'allow') {
    return LoggerOptions.list.has(name);
  }
  return !LoggerOptions.list.has(name);
}
async function processBuffer() {
  const default_buffer = Map_GetOrDefault(name_to_buffer, 'default', () => []);
  const temp_buffer = buffer;
  buffer = [];
  for (const { date, kind, uuid, channel, items } of temp_buffer) {
    unprocessedlogcount--;
    const name = uuid_to_name.get(uuid) ?? 'default';
    const name_buffer = Map_GetOrDefault(name_to_buffer, name, () => []);
    if (isLoggerEnabled(name) === false) {
      continue;
    }
    const datestring = formatDate(new Date(date));
    if (kind === Kind.Err) {
      for (const line of RemoveWhiteSpaceOnlyLinesFromTopAndBottom(items.join(' '))) {
        const text = `${datestring} |${uuid}.${channel}| (${name}) <ERROR> ${line}`;
        if (LoggerOptions.console === true) {
          if (LoggerOptions.ceremony === true) {
            // biome-ignore lint/complexity/useLiteralKeys: <explanation>
            console['error'](text);
          } else {
            // biome-ignore lint/complexity/useLiteralKeys: <explanation>
            console['error'](`<ERROR> ${line}`);
          }
        }
        default_buffer.push(text);
        name_buffer.push(text);
      }
    } else {
      for (const line of RemoveWhiteSpaceOnlyLinesFromTopAndBottom(items.join(' '))) {
        const text = `${datestring} |${uuid}.${channel}| (${name}) ${line}`;
        if (LoggerOptions.console === true) {
          if (LoggerOptions.ceremony === true) {
            // biome-ignore lint/complexity/useLiteralKeys: <explanation>
            console['log'](text);
          } else {
            // biome-ignore lint/complexity/useLiteralKeys: <explanation>
            console['log'](line);
          }
        }
        default_buffer.push(text);
        name_buffer.push(text);
      }
    }
  }
  for (const [path, platform] of output_map) {
    for (const [name, lines] of name_to_buffer) {
      if (lines.length > 0) {
        await platform.File.appendText(Path(path, `${name}.log`), `${lines.join('\n')}\n`);
        name_to_buffer.set(name, []);
      }
    }
  }
}
let task: Promise<void> | undefined = undefined;
function setTimer() {
  timeout ??= setTimeout(() => {
    timeout = undefined;
    task = processBuffer();
  }, 50);
}

export const DefaultLogger = Logger();

export function Logger(name = 'default'): CLogger {
  return Map_GetOrDefault(name_to_logger, name, () => new CLogger(getUuid(name), '00', name));
}

/** Important: don't forget to await this! */
export async function AddLoggerOutputDirectory(path: CPath | string, platform: CPlatformProvider) {
  DefaultLogger.log(`Add Logger Output Directory: "${Path(path).raw}"`);
  path = Path(path, 'logs');
  if (output_map.has(path) === false) {
    output_map.set(path, platform);
    await platform.Directory.create(path);
  }
}

export function SetLoggerOptions(options: { ceremony?: boolean; console?: boolean; list?: string[]; listmode?: 'allow' | 'block' }) {
  if (options.ceremony !== undefined) LoggerOptions.ceremony = options.ceremony;
  if (options.console !== undefined) LoggerOptions.console = options.console;
  if (options.list !== undefined) LoggerOptions.list = new Set(options.list);
  if (options.listmode !== undefined) LoggerOptions.listmode = options.listmode;
}

export async function WaitForLogger() {
  if (unprocessedlogcount > 0) {
    await new Promise<void>((resolve, reject) => {
      let id = setInterval(() => {
        if (unprocessedlogcount > 0) {
          setTimer();
        } else {
          clearInterval(id);
          resolve();
        }
      }, 250);
    });
    await task;
  }
}

function formatDate(date: Date) {
  // biome-ignore lint/style/useSingleVarDeclarator: performance
  let y = date.getFullYear(),
    m = date.getMonth() + 1,
    d = date.getDate(),
    hh = date.getHours(),
    mm = date.getMinutes(),
    ss = date.getSeconds(),
    ap = hh < 12 ? 'AM' : 'PM';
  hh = hh % 12 || 12; // Convert to 12-hour format, ensuring 12 instead of 0
  // biome-ignore lint/style/useTemplate: performance
  return y + '-' + (m < 10 ? '0' : '') + m + '-' + (d < 10 ? '0' : '') + d + ' ' + (hh < 10 ? '0' : '') + hh + ':' + (mm < 10 ? '0' : '') + mm + ':' + (ss < 10 ? '0' : '') + ss + ' ' + ap;
}

process.on('beforeExit', async (code) => {
  await WaitForLogger();
  if (unprocessedlogcount > 0) {
    // biome-ignore lint/complexity/useLiteralKeys: <explanation>
    console['error']('Unprocessed Logs:', unprocessedlogcount);
  }
});
