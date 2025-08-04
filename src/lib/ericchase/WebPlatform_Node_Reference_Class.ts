export class Class_WebPlatform_Node_Reference_Class {
  node: Node;
  constructor(node?: Node | null) {
    if (node === null) {
      throw new ReferenceError('Reference is null.');
    }
    if (node === undefined) {
      throw new ReferenceError('Reference is undefined.');
    }
    this.node = node;
  }
  as<T extends abstract new (...args: any) => any>(constructor_ref: T): InstanceType<T> {
    if (this.node instanceof constructor_ref) return this.node as InstanceType<T>;
    throw new TypeError(`Reference node is not ${constructor_ref}`);
  }
  is<T extends abstract new (...args: any) => any>(constructor_ref: T): boolean {
    return this.node instanceof constructor_ref;
  }
  passAs<T extends abstract new (...args: any) => any>(constructor_ref: T, fn: (reference: InstanceType<T>) => void): void {
    if (this.node instanceof constructor_ref) {
      fn(this.node as InstanceType<T>);
    }
  }
  tryAs<T extends abstract new (...args: any) => any>(constructor_ref: T): InstanceType<T> | undefined {
    if (this.node instanceof constructor_ref) {
      return this.node as InstanceType<T>;
    }
  }
  get classList() {
    return this.as(HTMLElement).classList;
  }
  get className() {
    return this.as(HTMLElement).className;
  }
  get style() {
    return this.as(HTMLElement).style;
  }
  getAttribute(qualifiedName: string): string | null {
    return this.as(HTMLElement).getAttribute(qualifiedName);
  }
  setAttribute(qualifiedName: string, value: string): void {
    this.as(HTMLElement).setAttribute(qualifiedName, value);
  }
  getStyleProperty(property: string): string {
    return this.as(HTMLElement).style.getPropertyValue(property);
  }
  setStyleProperty(property: string, value: string | null, priority?: string): void {
    this.as(HTMLElement).style.setProperty(property, value, priority);
  }
}

export function WebPlatform_Node_Reference_Class(node?: Node | null): Class_WebPlatform_Node_Reference_Class {
  return new Class_WebPlatform_Node_Reference_Class(node);
}

export function WebPlatform_Node_QuerySelector(selector: string): Class_WebPlatform_Node_Reference_Class {
  // API designed by NOOB (https://github.com/NOOB2868)
  return WebPlatform_Node_Reference_Class(document.querySelector(selector));
}
