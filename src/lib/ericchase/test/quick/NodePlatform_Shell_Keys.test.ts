import { expect, test } from 'bun:test';
import * as module from '../../NodePlatform_Shell_Keys.js';

/**
 * To create/update snapshots, run `bun test --update-snapshots`.
 */
test('NodePlatform_Shell_Keys', () => {
  expect(JSON.stringify(module['NodePlatform_Shell_Keys'])).toMatchSnapshot();
});
