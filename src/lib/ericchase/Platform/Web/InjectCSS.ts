export function InjectCSS(styles: string): CSSStyleSheet | undefined {
  if (document && 'adoptedStyleSheets' in document) {
    const stylesheet = new CSSStyleSheet();
    stylesheet.replaceSync(styles);
    document.adoptedStyleSheets.push(stylesheet);
    return stylesheet;
  }
  return undefined;
}
