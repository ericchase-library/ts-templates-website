import { Core_Console_Log } from './Core_Console_Log.js';

export function Core_Utility_Extract_Object_Structure(target: any, name?: string, indent = '') {
  if (name === undefined) {
    if (typeof target === 'function') {
      name = `function ${target.name || '<anonymous>'}`;
    } else if (target && target.constructor && target.constructor.name && target.constructor.name !== 'Object') {
      name = `${target.constructor.name} instance`;
    } else {
      name = 'Object';
    }
  }

  if (target === undefined) {
    Core_Console_Log(`${indent}${name} = undefined`);
    return;
  }

  if (target === null) {
    Core_Console_Log(`${indent}${name} = null`);
    return;
  }

  if (typeof target !== 'object' && typeof target !== 'function') {
    Core_Console_Log(`${indent}${name} = ${JSON.stringify(target)}`);
    return;
  }

  const object_type = typeof target === 'function' ? 'function' : 'object';
  Core_Console_Log(`${indent}${name} (${object_type}) {`);

  const all_keys = [...Object.getOwnPropertyNames(target), ...Object.getOwnPropertySymbols(target)];
  for (const key of all_keys) {
    const desc = Object.getOwnPropertyDescriptor(target, key);
    const key_name = typeof key === 'symbol' ? key.toString() : key;
    let value_string;

    if (desc !== undefined) {
      if ('value' in desc) {
        const value = desc.value;
        if (typeof value === 'function') {
          value_string = `[Function: ${value.name || '<anonymous>'}]`;
        } else if (typeof value === 'object' && value !== null) {
          value_string = `[Object]`;
        } else {
          value_string = JSON.stringify(value);
        }
        Core_Console_Log(`${indent}  ${key_name} : ${value_string} (data property, writable=${desc.writable}, enumerable=${desc.enumerable}, configurable=${desc.configurable})`);
      } else {
        Core_Console_Log(`${indent}  ${key_name} : (accessor property, enumerable=${desc.enumerable}, configurable=${desc.configurable})`);
        if (desc.get) {
          Core_Console_Log(`${indent}    get: [Function: ${desc.get.name || '<anonymous>'}]`);
        }
        if (desc.set) {
          Core_Console_Log(`${indent}    set: [Function: ${desc.set.name || '<anonymous>'}]`);
        }
      }
    }
  }

  const proto = Object.getPrototypeOf(target);
  if (proto) {
    Core_Utility_Extract_Object_Structure(proto, '[[Prototype]]', indent + '  ');
  } else {
    Core_Console_Log(`${indent}  [[Prototype]] = null`);
  }

  Core_Console_Log(`${indent}}`);
}
