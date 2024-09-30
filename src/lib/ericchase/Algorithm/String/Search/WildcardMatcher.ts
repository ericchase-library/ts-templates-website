export function MatchAny(text: string, pattern: string) {
  const parts = pattern.split('*');
  // check start
  if (parts[0] !== '' && !text.startsWith(parts[0])) {
    return false;
  }
  // check end
  if (parts[parts.length - 1] !== '' && !text.endsWith(parts[parts.length - 1])) {
    return false;
  }
  // check middle
  let pos = parts[0].length;
  for (let i = 1; i < parts.length - 1; i++) {
    pos = text.indexOf(parts[i], pos);
    if (pos === -1) {
      return false;
    }
  }
  return true;
}
