import { Shell } from '../Platform/Node/Shell.js';
import { ConsoleLog } from './Console.js';
import { MenuNavigator, ParseMenu, type Menu } from './Menu.js';

export class ShellMenu {
  $current_item_index = 0;
  $cursor_line_number = 0;
  $navigator: MenuNavigator = new MenuNavigator({ name: '', label: '', items: [] });
  $parser_cache = ParseMenu();
  $remove_open_handler: (() => void) | undefined = undefined;
  $remove_select_handler: (() => void) | undefined = undefined;
  constructor(options: { menu?: Menu; menu_navigator?: MenuNavigator }) {
    this.swap(options);
  }
  get item() {
    if (this.navigator.current !== undefined) {
      return this.navigator.current.items?.[this.$current_item_index];
    }
    throw new Error(`Internal Error: ${MenuNavigator.name} instance has no Menu instances.`);
  }
  get menu() {
    if (this.navigator.current !== undefined) {
      return this.navigator.current;
    }
    throw new Error(`Internal Error: ${MenuNavigator.name} instance has no Menu instances.`);
  }
  set menu(menu: Menu) {
    this.swap({ menu });
  }
  get navigator() {
    return this.$navigator;
  }
  set navigator(menu_navigator: MenuNavigator) {
    this.swap({ menu_navigator });
  }
  clear() {
    this.$moveCursorToLine(0);
    this.$printEmptyLine(this.$parser_cache.line_count);
    this.$moveCursorToLine(0);
    this.$parser_cache = ParseMenu();
  }
  repaint() {
    // TODO: need to split long lines up properly
    const parse = ParseMenu(this.menu);
    const count = Math.max(parse.line_count, this.$parser_cache.line_count);
    this.$moveCursorToLine(0);
    for (let index = 0; index < count; index++) {
      if (parse.lines[index] !== this.$parser_cache.lines[index]) {
        if (index < parse.line_count) {
          this.$printLine(parse.lines[index]);
        } else {
          this.$printEmptyLine();
        }
      }
    }
    this.$parser_cache = parse;
    this.$drawArrow();
  }
  update(line_numbers: number[]) {
    for (const line_number of line_numbers) {
      this.$moveCursorToLine(line_number);
      this.$printLine(this.$parser_cache.lines[line_number]);
    }
    this.$drawArrow();
  }
  swap(options: { menu?: Menu; menu_navigator?: MenuNavigator }) {
    this.clear();
    this.$remove_open_handler?.();
    this.$remove_select_handler?.();
    // navigator takes precedence
    if (options.menu_navigator) this.$navigator = options.menu_navigator;
    else if (options.menu) this.$navigator = new MenuNavigator(options.menu);
    else throw new TypeError(`${ShellMenu.name} requires a Menu or ${MenuNavigator.name} instance.`);
    this.$remove_open_handler = this.navigator.on('open', () => {
      this.$current_item_index = 0;
      this.repaint();
    });
    this.$remove_select_handler = this.navigator.on('select', () => {
      this.repaint();
    });
    this.repaint();
  }
  previousItem() {
    if (this.$current_item_index > 0) {
      this.$current_item_index--;
      const arrow_line_number = this.$parser_cache.label_lines.length + this.$current_item_index;
      this.update([arrow_line_number, arrow_line_number + 1]);
    }
  }
  nextItem() {
    if (this.$current_item_index + 1 < this.$parser_cache.item_count) {
      this.$current_item_index++;
      const arrow_line_number = this.$parser_cache.label_lines.length + this.$current_item_index;
      this.update([arrow_line_number - 1, arrow_line_number]);
    }
  }
  async selectItem() {
    await this.navigator.select(this.$parser_cache.item_names[this.$current_item_index]);
  }
  async previousMenu() {
    await this.navigator.close();
  }
  $drawArrow() {
    this.$moveCursorToLine(this.$parser_cache.label_lines.length + this.$current_item_index, true);
    this.$type('-> ', 0);
  }
  $moveCursorDown() {
    Shell.MoveCursorDown();
    this.$cursor_line_number++;
  }
  $moveCursorUp() {
    Shell.MoveCursorUp();
    this.$cursor_line_number--;
  }
  $moveCursorToLine(line_number: number, to_start = false) {
    if (this.$cursor_line_number < line_number) {
      Shell.MoveCursorDown(line_number - this.$cursor_line_number, to_start);
    } else if (this.$cursor_line_number > line_number) {
      Shell.MoveCursorUp(this.$cursor_line_number - line_number, to_start);
    }
    this.$cursor_line_number = line_number;
  }
  $printLine(line: string) {
    Shell.MoveCursorStart();
    Shell.EraseLine();
    ConsoleLog(`   ${line}`);
    this.$cursor_line_number++;
  }
  $printEmptyLine(count = 1) {
    Shell.MoveCursorStart();
    for (let i = 0; i < count; i++) {
      Shell.EraseLine();
      this.$moveCursorDown();
    }
  }
  $type(text: string, column?: number) {
    if (column !== undefined) {
      Shell.MoveCursorToColumn(column);
    }
    process.stdout.write(text);
  }
}
