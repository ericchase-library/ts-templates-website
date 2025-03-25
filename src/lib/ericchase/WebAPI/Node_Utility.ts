export class CNodeRef {
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
export function NodeRef(node?: Node | null): CNodeRef {
  return new CNodeRef(node);
}

export class CNodeListRef extends Array<CNodeRef> {
  constructor(nodes?: NodeList | Node[] | null) {
    if (nodes === null) {
      throw new ReferenceError('Reference list is null.');
    }
    if (nodes === undefined) {
      throw new ReferenceError('Reference list is undefined.');
    }
    super();
    for (const node of Array.from(nodes)) {
      try {
        this.push(new CNodeRef(node));
      } catch (_) {}
    }
  }

  as<T extends abstract new (...args: any) => any>(constructor_ref: T): Array<InstanceType<T>> {
    return this.filter((ref) => ref.is(constructor_ref)).map((ref) => ref.as(constructor_ref));
  }

  passEachAs<T extends abstract new (...args: any) => any>(constructor_ref: T, fn: (reference: InstanceType<T>) => void): void {
    for (const ref of this) {
      ref.passAs(constructor_ref, fn);
    }
  }
}
export function NodeListRef(nodes?: NodeList | Node[] | null): CNodeListRef {
  return new CNodeListRef(nodes);
}

// API designed by NOOB (https://github.com/NOOB2868)
export function SelectElements(...selectors: string[]) {
  return NodeListRef(document.querySelectorAll(selectors.join(',')));
}
