import { Class_WebPlatform_Node_Reference_Class, WebPlatform_Node_Reference_Class } from './WebPlatform_Node_Reference_Class.js';

export class Class_WebPlatform_NodeList_Reference_Class extends Array<Class_WebPlatform_Node_Reference_Class> {
  constructor(nodes?: NodeList | Node[] | null) {
    super();
    for (const node of Array.from(nodes ?? [])) {
      try {
        this.push(WebPlatform_Node_Reference_Class(node));
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

export function WebPlatform_NodeList_Reference_Class(nodes?: NodeList | Node[] | null): Class_WebPlatform_NodeList_Reference_Class {
  return new Class_WebPlatform_NodeList_Reference_Class(nodes);
}

export function WebPlatform_Node_QuerySelectorAll(...selectors: string[]): Class_WebPlatform_NodeList_Reference_Class {
  return WebPlatform_NodeList_Reference_Class(document.querySelectorAll(selectors.join(',')));
}
