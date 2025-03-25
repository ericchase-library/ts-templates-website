import { HandlerCaller } from '../DesignPattern/Handler.js';
import { SplitLines } from './String.js';
import { SyncAsync } from './Types.js';

export type Menu = { name: string; label?: string; items: (Menu | MenuItem)[] };
export type MenuItem = { name: string; action?: (options: MenuNavigatorSelectArgs) => SyncAsync<void> };

// TODO:
class CMenu {
  id!: string;
  description!: string;
  items!: CMenu[];
}
class CMenuItem {
  id!: string;
  description!: string;
  action!: () => void;
}

export function IsMenu(item: Menu | MenuItem): item is Menu {
  return 'name' in item && 'items' in item && 'action' in item === false;
}
export function IsMenuItem(item: Menu | MenuItem): item is MenuItem {
  return 'name' in item && IsMenu(item) === false && 'label' in item === false;
}

export type MenuNavigatorOpenArgs = { menu: Menu; path: string[] };
export type MenuNavigatorSelectArgs = { item: MenuItem; path: string[] };

export interface MenuNavigatorEventToHandlerMap {
  open: ({ menu, path }: MenuNavigatorOpenArgs) => void;
  select: ({ item, path }: MenuNavigatorSelectArgs) => void;
}

export class MenuNavigator {
  $open_handlers = new HandlerCaller<Parameters<MenuNavigatorEventToHandlerMap['open']>[0]>();
  $select_handlers = new HandlerCaller<Parameters<MenuNavigatorEventToHandlerMap['select']>[0]>();
  $stack: Menu[];
  constructor(menu: Menu) {
    this.$stack = [menu];
  }
  get path(): string[] {
    return this.$stack.map((menu) => menu.name);
  }
  get current() {
    return this.$stack[this.$stack.length - 1];
  }
  async close() {
    if (this.$stack.length > 1) {
      this.$stack.pop();
      await this.$open_handlers.call({ menu: this.current, path: this.path });
    }
  }
  on<K extends keyof MenuNavigatorEventToHandlerMap>(event: K, handler: MenuNavigatorEventToHandlerMap[K]): (() => void) | undefined {
    switch (event) {
      case 'open': {
        const remove = this.$open_handlers.add(handler as MenuNavigatorEventToHandlerMap['open']);
        (handler as MenuNavigatorEventToHandlerMap['open'])({ menu: this.current, path: this.path });
        return remove;
      }
      case 'select':
        return this.$select_handlers.add(handler as MenuNavigatorEventToHandlerMap['select']);
    }
  }
  open = this.select;
  remove<K extends keyof MenuNavigatorEventToHandlerMap>(event: K, handler: MenuNavigatorEventToHandlerMap[K]): void {
    switch (event) {
      case 'open':
        this.$open_handlers.remove(handler as MenuNavigatorEventToHandlerMap['open']);
        break;
      case 'select':
        this.$select_handlers.remove(handler as MenuNavigatorEventToHandlerMap['select']);
        break;
    }
  }
  async select(itemname: string) {
    for (const item of this.current.items ?? []) {
      if (item.name === itemname) {
        if (IsMenu(item)) {
          this.$stack.push(item);
          await this.$open_handlers.call({ menu: item, path: this.path });
        } else {
          await item.action?.({ item, path: this.path });
          await this.$select_handlers.call({ item, path: this.path });
        }
        return;
      }
    }
    throw new Error(`"${itemname}" does not exist in ${this.path.join(' > ')}`);
  }
}

export function ParseMenu(menu?: Menu) {
  const item_names = menu?.items?.map((item) => item.name) ?? [];
  const item_count = item_names.length;
  const label = menu?.label?.trim() ?? '';
  const label_lines = label.length > 0 ? SplitLines(label) : [];
  const lines = [...label_lines, ...item_names];
  const line_count = lines.length;
  return { item_count, item_names, label_lines, label, line_count, lines };
}
