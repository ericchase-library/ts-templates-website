import { ConsoleError } from './lib/ericchase/Utility/Console.js';
import { NodeRef } from './lib/ericchase/Web API/Node_Utility.js';

class Page {
  divMessages: HTMLDivElement;
  constructor() {
    this.divMessages = NodeRef(document.querySelector('#messages')).as(HTMLDivElement);
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
      ConsoleError(error);
    }
  }
}

const page = new Page();

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
