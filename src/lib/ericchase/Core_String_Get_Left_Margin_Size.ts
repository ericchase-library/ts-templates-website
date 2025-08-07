export function Core_String_Get_Left_Margin_Size(text: string): number {
  let i = 0;
  for (; i < text.length; i++) {
    if (text[i] !== ' ') {
      break;
    }
  }
  return i;
}
