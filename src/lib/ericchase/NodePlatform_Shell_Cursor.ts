import { Core_Console_Error } from './Core_Console_Error.js';
import { Data_Internal_NodePlatform_Shell } from './NodePlatform_Shell.js';
import { NodePlatform_Shell_Keys } from './NodePlatform_Shell_Keys.js';

function Listen_For_Uncaught_Exception(error: Error, origin: NodeJS.UncaughtExceptionOrigin): void {
  NodePlatform_Shell_Cursor_ShowCursor();
  if (process.listeners('uncaughtException').length === 1) {
    Core_Console_Error('Uncaught exception:', error);
    process.exit();
  }
}

function Setup_Exit_Trap_For_Cursor(): void {
  Data_Internal_NodePlatform_Shell.bool__exit_trap_set = true;
  process.on('exit', NodePlatform_Shell_Cursor_ShowCursor);
  process.on('SIGINT', NodePlatform_Shell_Cursor_ShowCursor);
  process.on('uncaughtException', () => Listen_For_Uncaught_Exception);
}

export function NodePlatform_Shell_Cursor_EraseCurrentLine(): void {
  process.stdout.write(`${NodePlatform_Shell_Keys.GENERAL.CSI}2K`);
}

export function NodePlatform_Shell_Cursor_HideCursor(): void {
  process.stdout.write(`${NodePlatform_Shell_Keys.GENERAL.CSI}?25l`);
  if (Data_Internal_NodePlatform_Shell.bool__exit_trap_set === false) {
    Setup_Exit_Trap_For_Cursor();
  }
}

export function NodePlatform_Shell_Cursor_MoveCursorDown(count = 0, to_start = false): void {
  if (to_start === true) {
    process.stdout.write(`${NodePlatform_Shell_Keys.GENERAL.CSI}${count}E`);
  }
  process.stdout.write(`${NodePlatform_Shell_Keys.GENERAL.CSI}${count}B`);
}

export function NodePlatform_Shell_Cursor_MoveCursorLeft(count = 0): void {
  process.stdout.write(`${NodePlatform_Shell_Keys.GENERAL.CSI}${count}D`);
}

export function NodePlatform_Shell_Cursor_MoveCursorRight(count = 0): void {
  process.stdout.write(`${NodePlatform_Shell_Keys.GENERAL.CSI}${count}C`);
}

export function NodePlatform_Shell_Cursor_MoveCursorStart(): void {
  process.stdout.write('\r');
}

export function NodePlatform_Shell_Cursor_MoveCursorToColumn(count = 0): void {
  process.stdout.write(`${NodePlatform_Shell_Keys.GENERAL.CSI}${count}G`);
}

export function NodePlatform_Shell_Cursor_MoveCursorUp(count = 0, to_start = false): void {
  if (to_start === true) {
    process.stdout.write(`${NodePlatform_Shell_Keys.GENERAL.CSI}${count}F`);
  }
  process.stdout.write(`${NodePlatform_Shell_Keys.GENERAL.CSI}${count}A`);
}

export function NodePlatform_Shell_Cursor_ShowCursor(): void {
  process.stdout.write(`${NodePlatform_Shell_Keys.GENERAL.CSI}?25h`);
}
