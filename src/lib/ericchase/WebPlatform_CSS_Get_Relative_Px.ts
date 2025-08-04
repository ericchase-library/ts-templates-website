export function WebPlatform_CSS_Get_Relative_Px(px: number, root: HTMLElement | SVGElement = document.documentElement): number {
  const font_size_in_px = Number.parseInt(getComputedStyle(root).fontSize);
  return (font_size_in_px / 16) * px;
}
