import { expect, test } from 'bun:test';
import { NodePlatform_PathObject_Absolute_Class } from '../../NodePlatform_PathObject_Absolute_Class.js';

test(NodePlatform_PathObject_Absolute_Class.name, () => {
  if (process.platform === 'win32') {
    expect(NodePlatform_PathObject_Absolute_Class('/').os).toEqual('win32');
  } else {
    expect(NodePlatform_PathObject_Absolute_Class('/').os).toEqual('posix');
  }
});
