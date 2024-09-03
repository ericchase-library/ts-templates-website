import { LoadIncludeFile, ProcessTemplateFile } from '../TemplateProcessor.js';

await LoadIncludeFile('button', './component/button.html');
await ProcessTemplateFile('./index.template.html', './index.html');
