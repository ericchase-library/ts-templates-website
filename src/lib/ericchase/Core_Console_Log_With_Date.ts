export function Core_Console_Log_With_Date(...items: any[]): void {
  console['log'](`[${new Date().toLocaleString()}]`, ...items);
}
