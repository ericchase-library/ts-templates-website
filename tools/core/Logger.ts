import { Core_Console_Error } from '../../src/lib/ericchase/Core_Console_Error.js';
import { Core_Console_Log } from '../../src/lib/ericchase/Core_Console_Log.js';
import { Core_Map_Get_Or_Default } from '../../src/lib/ericchase/Core_Map_Get_Or_Default.js';
import { Core_String_Remove_WhiteSpace_Only_Lines_From_Top_And_Bottom } from '../../src/lib/ericchase/Core_String_Remove_WhiteSpace_Only_Lines_From_Top_And_Bottom.js';
import { NODE_PATH } from '../../src/lib/ericchase/NodePlatform.js';
import { Async_NodePlatform_Directory_Create } from '../../src/lib/ericchase/NodePlatform_Directory_Create.js';
import { Async_NodePlatform_File_Append_Text } from '../../src/lib/ericchase/NodePlatform_File_Append_Text.js';

// variables

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

let buffer: BufferItem[] = [];
let task: Promise<void> | undefined = undefined;
let timeout: ReturnType<typeof setTimeout> | undefined;
let unprocessedlogcount = 0;

const output_set = new Set<string>();

const name_to_buffer = new Map<string, string[]>();
const name_to_logger = new Map<string, ClassLogger>();
const name_to_uuid = new Map<string, string>();

const uuid_to_channel = new Map<string, number>();
const uuid_to_name = new Map<string, string>();

const DEFAULT_LOGGER = 'LOG';
export const DefaultLogger = Logger();

// classes

enum Kind {
  Err = 0,
  Log = 1,
  NewLine = 2,
}

interface BufferItem {
  date: number;
  kind: Kind;
  uuid: string;
  channel: string;
  items: any[];
  error?: Error;
}

export class ClassLogger {
  constructor(
    readonly $uuid: string,
    readonly $channel: string,
    readonly $name: string,
  ) {}
  error(...items: any[]) {
    if (items[0] instanceof Error) {
      addlog(Kind.Err, this, items.slice(1), items[0]);
    } else {
      addlog(Kind.Err, this, items);
    }
  }
  errorNotEmpty(...items: any[]) {
    if (items[0] instanceof Error) {
      addlog(Kind.Err, this, items.slice(1), items[0]);
    } else {
      for (const item of items) {
        if (Array.isArray(item) && item.length === 0) continue;
        if (ArrayBuffer.isView(item) && item.byteLength === 0) continue;
        if (typeof item === 'string' && item.length === 0) continue;
        addlog(Kind.Err, this, items);
        break;
      }
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
  newLine() {
    addlog(Kind.NewLine, this, []);
  }

  newChannel(): ClassLogger {
    return new ClassLogger(this.$uuid, getNextChannel(this.$uuid), this.$name);
  }
}

// functions

function addlog(kind: BufferItem['kind'], logger: ClassLogger, items: BufferItem['items'], error?: Error) {
  unprocessedlogcount++;
  buffer.push({ date: Date.now(), kind, uuid: logger.$uuid, channel: logger.$channel, items, error });
  setTimer();
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
function getNextChannel(uuid: string): string {
  const channel = (uuid_to_channel.get(uuid) ?? 0) + 1;
  uuid_to_channel.set(uuid, channel);
  return channel.toString().padStart(2, '0');
}
function getUuid(name: string): string {
  return Core_Map_Get_Or_Default(name_to_uuid, name, () => {
    const uuid = (name_to_uuid.size + 1).toString().padStart(2, '0');
    uuid_to_name.set(uuid, name);
    return uuid;
  });
}
function isLoggerEnabled(name: string) {
  if (LoggerOptions.listmode === 'allow') {
    return LoggerOptions.list.has(name);
  }
  return !LoggerOptions.list.has(name);
}
function setTimer() {
  timeout ??= setTimeout(() => {
    timeout = undefined;
    task = processBuffer();
  }, 50);
}

async function processBuffer() {
  const default_buffer = Core_Map_Get_Or_Default(name_to_buffer, DEFAULT_LOGGER, () => []);
  const temp_buffer = buffer;
  buffer = [];
  for (const { date, kind, uuid, channel, items, error } of temp_buffer) {
    unprocessedlogcount--;
    const name = uuid_to_name.get(uuid) ?? DEFAULT_LOGGER;
    const name_buffer = Core_Map_Get_Or_Default(name_to_buffer, name, () => []);
    if (isLoggerEnabled(name) === false) {
      continue;
    }
    const datestring = formatDate(new Date(date));
    switch (kind) {
      case Kind.Err:
        {
          for (const line of Core_String_Remove_WhiteSpace_Only_Lines_From_Top_And_Bottom(items.join(' '))) {
            const text = `${datestring} |${uuid}.${channel}| [${name}] <ERROR> ${line}`;
            if (LoggerOptions.console === true) {
              if (LoggerOptions.ceremony === true) {
                Core_Console_Error(text);
              } else {
                Core_Console_Error(`<ERROR> ${line}`);
              }
            }
            default_buffer.push(text);
            name_buffer.push(text);
          }
          if (error !== undefined) {
            if (error.stack) {
              Core_Console_Error(error.stack);
              default_buffer.push(error.stack.toString());
              name_buffer.push(error.stack.toString());
            }
            Core_Console_Error(error);
            default_buffer.push(error.toString());
            name_buffer.push(error.toString());
          }
        }
        break;
      case Kind.Log:
        {
          for (const line of Core_String_Remove_WhiteSpace_Only_Lines_From_Top_And_Bottom(items.join(' '))) {
            const text = `${datestring} |${uuid}.${channel}| [${name}] ${line}`;
            if (LoggerOptions.console === true) {
              if (LoggerOptions.ceremony === true) {
                Core_Console_Log(text);
              } else {
                Core_Console_Log(line);
              }
            }
            default_buffer.push(text);
            name_buffer.push(text);
          }
        }
        break;
      case Kind.NewLine:
        {
          Core_Console_Log();
        }
        break;
    }
  }
  for (const path of output_set) {
    for (const [name, lines] of name_to_buffer) {
      if (lines.length > 0) {
        await Async_NodePlatform_File_Append_Text(NODE_PATH.resolve(path, `${name}.log`), `${lines.join('\n')}\n`, true);
        name_to_buffer.set(name, []);
      }
    }
  }
}

export function Logger(name = DEFAULT_LOGGER): ClassLogger {
  return Core_Map_Get_Or_Default(name_to_logger, name, () => new ClassLogger(getUuid(name), '00', name));
}

/** Important: don't forget to await this! */
export async function AddLoggerOutputDirectory(path: string) {
  DefaultLogger.log(`Add Logger Output Directory: "${path}"`);
  path = NODE_PATH.resolve(path, 'logs');
  if (output_set.has(path) === false) {
    output_set.add(path);
    await Async_NodePlatform_Directory_Create(path, true);
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

process.on('beforeExit', async (code) => {
  await WaitForLogger();
  if (unprocessedlogcount > 0) {
    Core_Console_Error('Unprocessed Logs:', unprocessedlogcount);
  }
});
