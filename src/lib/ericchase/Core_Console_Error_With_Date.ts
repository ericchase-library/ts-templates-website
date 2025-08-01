export function Core_Console_Error_With_Date(...items: any[]): void {
  console['error'](`[${new Date().toLocaleString()}]`, ...items);
}
