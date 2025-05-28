import { Core_Console_Error } from './lib/ericchase/api.core.js';
import { WebPlatform_Node_Class_NodeReference } from './lib/ericchase/api.platform-web.js';
import { HotRefresh } from './lib/server/HotRefresh.js';

HotRefresh();

class Page {
  divMessages: HTMLDivElement;
  constructor() {
    this.divMessages = WebPlatform_Node_Class_NodeReference(document.querySelector('#messages')).as(HTMLDivElement);
  }
  addMessage(text: string) {
    try {
      const div = document.createElement('div');
      const pre = document.createElement('pre');
      pre.textContent = text;
      div.appendChild(pre);
      this.divMessages.prepend(div);
      // scroll div into view
      div.scrollIntoView(false);
      return div;
    } catch (error) {
      Core_Console_Error(error);
    }
  }
}

const page = new Page();

page.addMessage('Hello, Module!');

// Database requires docker to be installed and running.

// try {
//   if (await DatabaseConnected()) {
//     const tableName = 'test';
//     const { created, exists } = await EnsureTableExists(tableName);
//     if (created) {
//       page.addMessage('Table created.');
//     } else if (exists) {
//       page.addMessage('Table exists.');
//     } else {
//       page.addMessage('Table creation failed.');
//     }
//   }
// } catch (error: any) {
//   page.addMessage(error);
//   page.addMessage('Is server running? Check api endpoint.');
// }
