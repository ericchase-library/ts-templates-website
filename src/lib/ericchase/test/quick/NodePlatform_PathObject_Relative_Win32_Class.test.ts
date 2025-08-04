import { describe, expect, test } from 'bun:test';
import { Core_Array_Zip_Generator } from '../../Core_Array_Zip_Generator.js';
import { Core_String_Remove_WhiteSpace_Only_Lines } from '../../Core_String_Remove_WhiteSpace_Only_Lines.js';
import { Core_String_Trim_Lines } from '../../Core_String_Trim_Lines.js';
import { Class_NodePlatform_PathObject_Relative_Class, NodePlatform_PathObject_Relative_Win32_Class } from '../../NodePlatform_PathObject_Relative_Class.js';

function Prep_SplitLines(cases: string) {
  return Core_String_Trim_Lines(Core_String_Remove_WhiteSpace_Only_Lines(cases));
}

function PathFactory(...pathlike: string[]): Class_NodePlatform_PathObject_Relative_Class {
  return NodePlatform_PathObject_Relative_Win32_Class(...pathlike);
}
const set_relative_paths = Prep_SplitLines(`
  .
  ./
  .\\
  ./path/to/dir/name.ext
  .\\path\\to\\dir\\name.ext

  ..
  ../
  ..\\
  ../path/to/dir/name.ext
  ..\\path\\to\\dir\\name.ext

  path/to/dir/name.ext
  path\\to\\dir\\name.ext
`);
const set_absolute_paths = Prep_SplitLines(`
  /
  /path/to/dir/name.ext
  //Server/Share/path/to/dir/name.ext
  //?/C:/path/to/dir/name.ext
  //./COM1/path/to/dir/name.ext
  C:/
  C:/path/to/dir/name.ext

  \\
  \\path\\to\\dir\\name.ext
  \\\\Server\\Share\\path\\to\\dir\\name.ext
  \\\\?\\C:\\path\\to\\dir\\name.ext
  \\\\.\\COM1\\path\\to\\dir\\name.ext
  C:\\
  C:\\path\\to\\dir\\name.ext
`);
/**
 * These paths parse into relative paths, but removing the segments from the
 * beginning may result in absolute paths.
 */
const set_potentially_problematic_for_relative_paths = Prep_SplitLines(`
  .//?/C:/path/to/dir/name.ext
  .\\\\?\\C:\\path\\to\\dir\\name.ext

  ../C:/path/to/dir/name.ext
  ..\\C:\\path\\to\\dir\\name.ext

  dir/C:/path/to/dir/name.ext
  dir\\C:\\path\\to\\dir\\name.ext
`);

describe(NodePlatform_PathObject_Relative_Win32_Class.name, () => {
  describe('1. Error Cases', () => {
    //## overwrite()
    describe(PathFactory().overwrite.name + '()', () => {
      describe('Absolute Paths Should Throw', () => {
        for (const received of set_absolute_paths) {
          test(received, () => {
            expect(() => PathFactory(received)).toThrowError();
            expect(() => PathFactory().overwrite(received)).toThrowError();
          });
        }
        for (const received of set_potentially_problematic_for_relative_paths) {
          test(received, () => {
            expect(() => PathFactory(received)).not.toThrowError();
            expect(() => PathFactory().overwrite(received)).not.toThrowError();
          });
        }
      });
    });

    //## unshift()
    describe(PathFactory().unshift.name + '()', () => {
      for (const received of set_relative_paths) {
        test(received, () => {
          expect(() => PathFactory(received)).not.toThrowError();
          expect(() => PathFactory(received).unshift('C:/')).toThrowError();
        });
      }
      for (const received of set_absolute_paths) {
        test(received, () => {
          expect(() => PathFactory().unshift(received)).toThrowError();
        });
      }
    });

    //## shift()
    describe(PathFactory().shift.name + '()', () => {
      for (const received of set_potentially_problematic_for_relative_paths) {
        test(received, () => {
          expect(() => PathFactory(received)).not.toThrowError();
          expect(() => PathFactory(received).shift(1)).toThrowError();
        });
      }
    });
  });
  describe('2. Basic Cases', () => {
    //## overwrite()
    describe(PathFactory().overwrite.name + '()', () => {
      const set_expected = [
        //
        { dir: '', name: '.', ext: '' },
        { dir: '', name: '.', ext: '' },
        { dir: '', name: '.', ext: '' },
        { dir: 'path\\to\\dir', name: 'name', ext: '.ext' },
        { dir: 'path\\to\\dir', name: 'name', ext: '.ext' },

        { dir: '', name: '..', ext: '' },
        { dir: '', name: '..', ext: '' },
        { dir: '', name: '..', ext: '' },
        { dir: '..\\path\\to\\dir', name: 'name', ext: '.ext' },
        { dir: '..\\path\\to\\dir', name: 'name', ext: '.ext' },

        { dir: 'path\\to\\dir', name: 'name', ext: '.ext' },
        { dir: 'path\\to\\dir', name: 'name', ext: '.ext' },
      ];
      for (const [received, expected] of Core_Array_Zip_Generator(set_relative_paths, set_expected)) {
        test(received!, () => {
          {
            const path_object = PathFactory(received!);
            expect(path_object).toHaveProperty('dir', expected?.dir);
            expect(path_object).toHaveProperty('name', expected?.name);
            expect(path_object).toHaveProperty('ext', expected?.ext);
          }
          {
            const path_object = PathFactory().overwrite(received!);
            expect(path_object).toHaveProperty('dir', expected?.dir);
            expect(path_object).toHaveProperty('name', expected?.name);
            expect(path_object).toHaveProperty('ext', expected?.ext);
          }
        });
      }
    });

    //## join()
    describe(PathFactory().join.name + '()', () => {
      const set_expected_join = Prep_SplitLines(`
        .
        .
        .
        path\\to\\dir\\name.ext
        path\\to\\dir\\name.ext

        ..
        ..
        ..
        ..\\path\\to\\dir\\name.ext
        ..\\path\\to\\dir\\name.ext

        path\\to\\dir\\name.ext
        path\\to\\dir\\name.ext
      `);
      for (const [received, expected] of Core_Array_Zip_Generator(set_relative_paths, set_expected_join)) {
        test(received!, () => {
          expect(PathFactory(received!).join()).toEqual(expected!);
        });
        test(received! + '/', () => {
          expect(PathFactory(received! + '/').join()).toEqual(expected!);
        });
        test(received! + '\\', () => {
          expect(PathFactory(received! + '\\').join()).toEqual(expected!);
        });
      }
    });

    const set_expected_split = [
      //
      ['.'],
      ['.'],
      ['.'],
      ['path', 'to', 'dir', 'name.ext'],
      ['path', 'to', 'dir', 'name.ext'],

      ['..'],
      ['..'],
      ['..'],
      ['..', 'path', 'to', 'dir', 'name.ext'],
      ['..', 'path', 'to', 'dir', 'name.ext'],

      ['path', 'to', 'dir', 'name.ext'],
      ['path', 'to', 'dir', 'name.ext'],
    ];

    //## split()
    describe(PathFactory().split.name + '()', () => {
      for (const [received, expected] of Core_Array_Zip_Generator(set_relative_paths, set_expected_split)) {
        test(received!, () => {
          expect(PathFactory(received!).split()).toEqual(expected!);
        });
        test(received! + '/', () => {
          expect(PathFactory(received! + '/').split()).toEqual(expected!);
        });
        test(received! + '\\', () => {
          expect(PathFactory(received! + '\\').split()).toEqual(expected!);
        });
      }
    });

    //## push()
    describe(PathFactory().push.name + '()', () => {
      const set_expected_1 = Prep_SplitLines(`
        segment.new
        segment.new
        segment.new
        path\\to\\dir\\name.ext\\segment.new
        path\\to\\dir\\name.ext\\segment.new

        ..\\segment.new
        ..\\segment.new
        ..\\segment.new
        ..\\path\\to\\dir\\name.ext\\segment.new
        ..\\path\\to\\dir\\name.ext\\segment.new

        path\\to\\dir\\name.ext\\segment.new
        path\\to\\dir\\name.ext\\segment.new
      `);
      for (const [received, expected] of Core_Array_Zip_Generator(set_relative_paths, set_expected_1)) {
        test(received!, () => {
          expect(PathFactory(received!).push('segment.new').join()).toEqual(expected!);
        });
      }
      const set_expected_2 = [
        //
        ['segment.new'],
        ['segment.new'],
        ['segment.new'],
        ['path', 'to', 'dir', 'name.ext', 'segment.new'],
        ['path', 'to', 'dir', 'name.ext', 'segment.new'],

        ['..', 'segment.new'],
        ['..', 'segment.new'],
        ['..', 'segment.new'],
        ['..', 'path', 'to', 'dir', 'name.ext', 'segment.new'],
        ['..', 'path', 'to', 'dir', 'name.ext', 'segment.new'],

        ['path', 'to', 'dir', 'name.ext', 'segment.new'],
        ['path', 'to', 'dir', 'name.ext', 'segment.new'],
      ];
      for (const [received, expected] of Core_Array_Zip_Generator(set_relative_paths, set_expected_2)) {
        test(received!, () => {
          expect(PathFactory(received!).push('segment.new').split()).toEqual(expected!);
        });
      }
    });

    //## pop()
    describe(PathFactory().pop.name + '(0)', () => {
      for (const [received, expected_remaining] of Core_Array_Zip_Generator(set_relative_paths, set_expected_split)) {
        test(received!, () => {
          const path_object = PathFactory(received!);
          expect(path_object.pop(0)).toEqual([]);
          expect(path_object.split()).toEqual(expected_remaining!);
        });
      }
    });
    describe(PathFactory().pop.name + '(1)', () => {
      const set_expected_popped = [
        //
        ['.'],
        ['.'],
        ['.'],
        ['name.ext'],
        ['name.ext'],

        ['..'],
        ['..'],
        ['..'],
        ['name.ext'],
        ['name.ext'],

        ['name.ext'],
        ['name.ext'],
      ];
      const set_expected_remaining = [
        //
        ['.'],
        ['.'],
        ['.'],
        ['path', 'to', 'dir'],
        ['path', 'to', 'dir'],

        ['.'],
        ['.'],
        ['.'],
        ['..', 'path', 'to', 'dir'],
        ['..', 'path', 'to', 'dir'],

        ['path', 'to', 'dir'],
        ['path', 'to', 'dir'],
      ];
      for (const [received, expected_popped, expected_remaining] of Core_Array_Zip_Generator(set_relative_paths, set_expected_popped, set_expected_remaining)) {
        test(received!, () => {
          const path_object = PathFactory(received!);
          expect(path_object.pop(1)).toEqual(expected_popped!);
          expect(path_object.split()).toEqual(expected_remaining!);
        });
      }
    });
    describe(PathFactory().pop.name + '(2)', () => {
      const set_expected_popped = [
        //
        ['.'],
        ['.'],
        ['.'],
        ['dir', 'name.ext'],
        ['dir', 'name.ext'],

        ['..'],
        ['..'],
        ['..'],
        ['dir', 'name.ext'],
        ['dir', 'name.ext'],

        ['dir', 'name.ext'],
        ['dir', 'name.ext'],
      ];
      const set_expected_remaining = [
        //
        ['.'],
        ['.'],
        ['.'],
        ['path', 'to'],
        ['path', 'to'],

        ['.'],
        ['.'],
        ['.'],
        ['..', 'path', 'to'],
        ['..', 'path', 'to'],

        ['path', 'to'],
        ['path', 'to'],
      ];
      for (const [received, expected_popped, expected_remaining] of Core_Array_Zip_Generator(set_relative_paths, set_expected_popped, set_expected_remaining)) {
        test(received!, () => {
          const path_object = PathFactory(received!);
          expect(path_object.pop(2)).toEqual(expected_popped!);
          expect(path_object.split()).toEqual(expected_remaining!);
        });
      }
    });
    describe(PathFactory().pop.name + '(3)', () => {
      const set_expected_popped = [
        //
        ['.'],
        ['.'],
        ['.'],
        ['to', 'dir', 'name.ext'],
        ['to', 'dir', 'name.ext'],

        ['..'],
        ['..'],
        ['..'],
        ['to', 'dir', 'name.ext'],
        ['to', 'dir', 'name.ext'],

        ['to', 'dir', 'name.ext'],
        ['to', 'dir', 'name.ext'],
      ];
      const set_expected_remaining = [
        //
        ['.'],
        ['.'],
        ['.'],
        ['path'],
        ['path'],

        ['.'],
        ['.'],
        ['.'],
        ['..', 'path'],
        ['..', 'path'],

        ['path'],
        ['path'],
      ];
      for (const [received, expected_popped, expected_remaining] of Core_Array_Zip_Generator(set_relative_paths, set_expected_popped, set_expected_remaining)) {
        test(received!, () => {
          const path_object = PathFactory(received!);
          expect(path_object.pop(3)).toEqual(expected_popped!);
          expect(path_object.split()).toEqual(expected_remaining!);
        });
      }
    });
    describe(PathFactory().pop.name + '(4)', () => {
      const set_expected_popped = [
        //
        ['.'],
        ['.'],
        ['.'],
        ['path', 'to', 'dir', 'name.ext'],
        ['path', 'to', 'dir', 'name.ext'],

        ['..'],
        ['..'],
        ['..'],
        ['path', 'to', 'dir', 'name.ext'],
        ['path', 'to', 'dir', 'name.ext'],

        ['path', 'to', 'dir', 'name.ext'],
        ['path', 'to', 'dir', 'name.ext'],
      ];
      const set_expected_remaining = [
        //
        ['.'],
        ['.'],
        ['.'],
        ['.'],
        ['.'],

        ['.'],
        ['.'],
        ['.'],
        ['..'],
        ['..'],

        ['.'],
        ['.'],
      ];
      for (const [received, expected_popped, expected_remaining] of Core_Array_Zip_Generator(set_relative_paths, set_expected_popped, set_expected_remaining)) {
        test(received!, () => {
          const path_object = PathFactory(received!);
          expect(path_object.pop(4)).toEqual(expected_popped!);
          expect(path_object.split()).toEqual(expected_remaining!);
        });
      }
    });
    describe(PathFactory().pop.name + '(5)', () => {
      const set_expected_popped = [
        //
        ['.'],
        ['.'],
        ['.'],
        ['path', 'to', 'dir', 'name.ext'],
        ['path', 'to', 'dir', 'name.ext'],

        ['..'],
        ['..'],
        ['..'],
        ['..', 'path', 'to', 'dir', 'name.ext'],
        ['..', 'path', 'to', 'dir', 'name.ext'],

        ['path', 'to', 'dir', 'name.ext'],
        ['path', 'to', 'dir', 'name.ext'],
      ];
      for (const [received, expected_popped] of Core_Array_Zip_Generator(set_relative_paths, set_expected_popped)) {
        test(received!, () => {
          const path_object = PathFactory(received!);
          expect(path_object.pop(5)).toEqual(expected_popped!);
          expect(path_object.split()).toEqual(['.']);
        });
      }
    });
    describe(PathFactory().pop.name + '(*)', () => {
      const set_expected_remaining = [
        //
        ['.'],
        ['.'],
        ['.'],
        ['path', 'to', 'dir', 'name.ext'],
        ['path', 'to', 'dir', 'name.ext'],

        ['..'],
        ['..'],
        ['..'],
        ['..', 'path', 'to', 'dir', 'name.ext'],
        ['..', 'path', 'to', 'dir', 'name.ext'],

        ['path', 'to', 'dir', 'name.ext'],
        ['path', 'to', 'dir', 'name.ext'],
      ];
      for (const received of set_relative_paths) {
        test(received!, () => {
          const path_object = PathFactory(received);
          path_object.pop();
          path_object.pop();
          path_object.pop();
          path_object.pop();
          path_object.pop();
          path_object.pop();
          expect(path_object.split()).toEqual(['.']);
        });
      }
    });

    //## unshift()
    describe(PathFactory().unshift.name + '()', () => {
      const set_expected_1 = Prep_SplitLines(`
        segment.new
        segment.new
        segment.new
        segment.new\\path\\to\\dir\\name.ext
        segment.new\\path\\to\\dir\\name.ext

        .
        .
        .
        path\\to\\dir\\name.ext
        path\\to\\dir\\name.ext

        segment.new\\path\\to\\dir\\name.ext
        segment.new\\path\\to\\dir\\name.ext
      `);
      for (const [received, expected] of Core_Array_Zip_Generator(set_relative_paths, set_expected_1)) {
        test(received!, () => {
          expect(PathFactory(received!).unshift('segment.new').join()).toEqual(expected!);
        });
      }
      const set_expected_2 = [
        //
        ['segment.new'],
        ['segment.new'],
        ['segment.new'],
        ['segment.new', 'path', 'to', 'dir', 'name.ext'],
        ['segment.new', 'path', 'to', 'dir', 'name.ext'],

        ['.'],
        ['.'],
        ['.'],
        ['path', 'to', 'dir', 'name.ext'],
        ['path', 'to', 'dir', 'name.ext'],

        ['segment.new', 'path', 'to', 'dir', 'name.ext'],
        ['segment.new', 'path', 'to', 'dir', 'name.ext'],
      ];
      for (const [received, expected] of Core_Array_Zip_Generator(set_relative_paths, set_expected_2)) {
        test(received!, () => {
          expect(PathFactory(received!).unshift('segment.new').split()).toEqual(expected!);
        });
      }
    });

    //## shift()
    describe(PathFactory().shift.name + '(0)', () => {
      for (const [received, expected_remaining] of Core_Array_Zip_Generator(set_relative_paths, set_expected_split)) {
        test(received!, () => {
          const path_object = PathFactory(received!);
          expect(path_object.shift(0)).toEqual([]);
          expect(path_object.split()).toEqual(expected_remaining!);
        });
      }
    });
    describe(PathFactory().shift.name + '(1)', () => {
      const set_expected_popped = [
        //
        ['.'],
        ['.'],
        ['.'],
        ['path'],
        ['path'],

        ['..'],
        ['..'],
        ['..'],
        ['..'],
        ['..'],

        ['path'],
        ['path'],
      ];
      const set_expected_remaining = [
        //
        ['.'],
        ['.'],
        ['.'],
        ['to', 'dir', 'name.ext'],
        ['to', 'dir', 'name.ext'],

        ['.'],
        ['.'],
        ['.'],
        ['path', 'to', 'dir', 'name.ext'],
        ['path', 'to', 'dir', 'name.ext'],

        ['to', 'dir', 'name.ext'],
        ['to', 'dir', 'name.ext'],
      ];
      for (const [received, expected_popped, expected_remaining] of Core_Array_Zip_Generator(set_relative_paths, set_expected_popped, set_expected_remaining)) {
        test(received!, () => {
          const path_object = PathFactory(received!);
          expect(path_object.shift(1)).toEqual(expected_popped!);
          expect(path_object.split()).toEqual(expected_remaining!);
        });
      }
    });
    describe(PathFactory().shift.name + '(2)', () => {
      const set_expected_popped = [
        //
        ['.'],
        ['.'],
        ['.'],
        ['path', 'to'],
        ['path', 'to'],

        ['..'],
        ['..'],
        ['..'],
        ['..', 'path'],
        ['..', 'path'],

        ['path', 'to'],
        ['path', 'to'],
      ];
      const set_expected_remaining = [
        //
        ['.'],
        ['.'],
        ['.'],
        ['dir', 'name.ext'],
        ['dir', 'name.ext'],

        ['.'],
        ['.'],
        ['.'],
        ['to', 'dir', 'name.ext'],
        ['to', 'dir', 'name.ext'],

        ['dir', 'name.ext'],
        ['dir', 'name.ext'],
      ];
      for (const [received, expected_popped, expected_remaining] of Core_Array_Zip_Generator(set_relative_paths, set_expected_popped, set_expected_remaining)) {
        test(received!, () => {
          const path_object = PathFactory(received!);
          expect(path_object.shift(2)).toEqual(expected_popped!);
          expect(path_object.split()).toEqual(expected_remaining!);
        });
      }
    });
    describe(PathFactory().shift.name + '(3)', () => {
      const set_expected_popped = [
        //
        ['.'],
        ['.'],
        ['.'],
        ['path', 'to', 'dir'],
        ['path', 'to', 'dir'],

        ['..'],
        ['..'],
        ['..'],
        ['..', 'path', 'to'],
        ['..', 'path', 'to'],

        ['path', 'to', 'dir'],
        ['path', 'to', 'dir'],
      ];
      const set_expected_remaining = [
        //
        ['.'],
        ['.'],
        ['.'],
        ['name.ext'],
        ['name.ext'],

        ['.'],
        ['.'],
        ['.'],
        ['dir', 'name.ext'],
        ['dir', 'name.ext'],

        ['name.ext'],
        ['name.ext'],
      ];
      for (const [received, expected_popped, expected_remaining] of Core_Array_Zip_Generator(set_relative_paths, set_expected_popped, set_expected_remaining)) {
        test(received!, () => {
          const path_object = PathFactory(received!);
          expect(path_object.shift(3)).toEqual(expected_popped!);
          expect(path_object.split()).toEqual(expected_remaining!);
        });
      }
    });
    describe(PathFactory().shift.name + '(4)', () => {
      const set_expected_popped = [
        //
        ['.'],
        ['.'],
        ['.'],
        ['path', 'to', 'dir', 'name.ext'],
        ['path', 'to', 'dir', 'name.ext'],

        ['..'],
        ['..'],
        ['..'],
        ['..', 'path', 'to', 'dir'],
        ['..', 'path', 'to', 'dir'],

        ['path', 'to', 'dir', 'name.ext'],
        ['path', 'to', 'dir', 'name.ext'],
      ];
      const set_expected_remaining = [
        //
        ['.'],
        ['.'],
        ['.'],
        ['.'],
        ['.'],

        ['.'],
        ['.'],
        ['.'],
        ['name.ext'],
        ['name.ext'],

        ['.'],
        ['.'],
      ];
      for (const [received, expected_popped, expected_remaining] of Core_Array_Zip_Generator(set_relative_paths, set_expected_popped, set_expected_remaining)) {
        test(received!, () => {
          const path_object = PathFactory(received!);
          expect(path_object.shift(4)).toEqual(expected_popped!);
          expect(path_object.split()).toEqual(expected_remaining!);
        });
      }
    });
    describe(PathFactory().shift.name + '(5)', () => {
      const set_expected_popped = [
        //
        ['.'],
        ['.'],
        ['.'],
        ['path', 'to', 'dir', 'name.ext'],
        ['path', 'to', 'dir', 'name.ext'],

        ['..'],
        ['..'],
        ['..'],
        ['..', 'path', 'to', 'dir', 'name.ext'],
        ['..', 'path', 'to', 'dir', 'name.ext'],

        ['path', 'to', 'dir', 'name.ext'],
        ['path', 'to', 'dir', 'name.ext'],
      ];
      for (const [received, expected_popped] of Core_Array_Zip_Generator(set_relative_paths, set_expected_popped)) {
        test(received!, () => {
          const path_object = PathFactory(received!);
          expect(path_object.shift(5)).toEqual(expected_popped!);
          expect(path_object.split()).toEqual(['.']);
        });
      }
    });
    describe(PathFactory().shift.name + '(*)', () => {
      for (const received of set_relative_paths) {
        test(received!, () => {
          const path_object = PathFactory(received!);
          path_object.shift();
          path_object.shift();
          path_object.shift();
          path_object.shift();
          path_object.shift();
          path_object.shift();
          expect(path_object.split()).toEqual(['.']);
        });
      }
    });

    //## slice()
    describe(PathFactory().slice.name + '(0,0)', () => {
      for (const received of set_relative_paths) {
        test(received, () => {
          expect(PathFactory(received!).slice(0, 0).split()).toEqual(['.']);
        });
      }
    });
    describe(PathFactory().slice.name + '(0)', () => {
      for (const [received, expected] of Core_Array_Zip_Generator(set_relative_paths, set_expected_split)) {
        test(received!, () => {
          expect(PathFactory(received!).slice(0).split()).toEqual(expected!);
        });
      }
    });
    describe(PathFactory().slice.name + '(0,1)', () => {
      const set_expected = [
        //
        ['.'],
        ['.'],
        ['.'],
        ['path'],
        ['path'],

        ['..'],
        ['..'],
        ['..'],
        ['..'],
        ['..'],

        ['path'],
        ['path'],
      ];
      for (const [received, expected] of Core_Array_Zip_Generator(set_relative_paths, set_expected)) {
        test(received!, () => {
          expect(PathFactory(received!).slice(0, 1).split()).toEqual(expected!);
        });
      }
    });
    describe(PathFactory().slice.name + '(0,2)', () => {
      const set_expected = [
        //
        ['.'],
        ['.'],
        ['.'],
        ['path', 'to'],
        ['path', 'to'],

        ['..'],
        ['..'],
        ['..'],
        ['..', 'path'],
        ['..', 'path'],

        ['path', 'to'],
        ['path', 'to'],
      ];
      for (const [received, expected] of Core_Array_Zip_Generator(set_relative_paths, set_expected)) {
        test(received!, () => {
          expect(PathFactory(received!).slice(0, 2).split()).toEqual(expected!);
        });
      }
    });
    describe(PathFactory().slice.name + '(0,3)', () => {
      const set_expected = [
        //
        ['.'],
        ['.'],
        ['.'],
        ['path', 'to', 'dir'],
        ['path', 'to', 'dir'],

        ['..'],
        ['..'],
        ['..'],
        ['..', 'path', 'to'],
        ['..', 'path', 'to'],

        ['path', 'to', 'dir'],
        ['path', 'to', 'dir'],
      ];
      for (const [received, expected] of Core_Array_Zip_Generator(set_relative_paths, set_expected)) {
        test(received!, () => {
          expect(PathFactory(received!).slice(0, 3).split()).toEqual(expected!);
        });
      }
    });
    describe(PathFactory().slice.name + '(0,4)', () => {
      const set_expected = [
        //
        ['.'],
        ['.'],
        ['.'],
        ['path', 'to', 'dir', 'name.ext'],
        ['path', 'to', 'dir', 'name.ext'],

        ['..'],
        ['..'],
        ['..'],
        ['..', 'path', 'to', 'dir'],
        ['..', 'path', 'to', 'dir'],

        ['path', 'to', 'dir', 'name.ext'],
        ['path', 'to', 'dir', 'name.ext'],
      ];
      for (const [received, expected] of Core_Array_Zip_Generator(set_relative_paths, set_expected)) {
        test(received!, () => {
          expect(PathFactory(received!).slice(0, 4).split()).toEqual(expected!);
        });
      }
    });
    describe(PathFactory().slice.name + '(0,5)', () => {
      const set_expected = [
        //
        ['.'],
        ['.'],
        ['.'],
        ['path', 'to', 'dir', 'name.ext'],
        ['path', 'to', 'dir', 'name.ext'],

        ['..'],
        ['..'],
        ['..'],
        ['..', 'path', 'to', 'dir', 'name.ext'],
        ['..', 'path', 'to', 'dir', 'name.ext'],

        ['path', 'to', 'dir', 'name.ext'],
        ['path', 'to', 'dir', 'name.ext'],
      ];
      for (const [received, expected] of Core_Array_Zip_Generator(set_relative_paths, set_expected)) {
        test(received!, () => {
          expect(PathFactory(received!).slice(0, 5).split()).toEqual(expected!);
          expect(PathFactory(received!).slice(0, 6).split()).toEqual(expected!);
        });
      }
    });
    describe(PathFactory().slice.name + '(0,-1)', () => {
      const set_expected = [
        //
        ['.'],
        ['.'],
        ['.'],
        ['path', 'to', 'dir'],
        ['path', 'to', 'dir'],

        ['.'],
        ['.'],
        ['.'],
        ['..', 'path', 'to', 'dir'],
        ['..', 'path', 'to', 'dir'],

        ['path', 'to', 'dir'],
        ['path', 'to', 'dir'],
      ];
      for (const [received, expected] of Core_Array_Zip_Generator(set_relative_paths, set_expected)) {
        test(received!, () => {
          expect(PathFactory(received!).slice(0, -1).split()).toEqual(expected!);
        });
      }
    });
    describe(PathFactory().slice.name + '(0,-2)', () => {
      const set_expected = [
        //
        ['.'],
        ['.'],
        ['.'],
        ['path', 'to'],
        ['path', 'to'],

        ['.'],
        ['.'],
        ['.'],
        ['..', 'path', 'to'],
        ['..', 'path', 'to'],

        ['path', 'to'],
        ['path', 'to'],
      ];
      for (const [received, expected] of Core_Array_Zip_Generator(set_relative_paths, set_expected)) {
        test(received!, () => {
          expect(PathFactory(received!).slice(0, -2).split()).toEqual(expected!);
        });
      }
    });
    describe(PathFactory().slice.name + '(0,-3)', () => {
      const set_expected = [
        //
        ['.'],
        ['.'],
        ['.'],
        ['path'],
        ['path'],

        ['.'],
        ['.'],
        ['.'],
        ['..', 'path'],
        ['..', 'path'],

        ['path'],
        ['path'],
      ];
      for (const [received, expected] of Core_Array_Zip_Generator(set_relative_paths, set_expected)) {
        test(received!, () => {
          expect(PathFactory(received!).slice(0, -3).split()).toEqual(expected!);
        });
      }
    });
    describe(PathFactory().slice.name + '(0,-4)', () => {
      const set_expected = [
        //
        ['.'],
        ['.'],
        ['.'],
        ['.'],
        ['.'],

        ['.'],
        ['.'],
        ['.'],
        ['..'],
        ['..'],

        ['.'],
        ['.'],
      ];
      for (const [received, expected] of Core_Array_Zip_Generator(set_relative_paths, set_expected)) {
        test(received!, () => {
          expect(PathFactory(received!).slice(0, -4).split()).toEqual(expected!);
        });
      }
    });
    describe(PathFactory().slice.name + '(0,-5*)', () => {
      for (const received of set_relative_paths) {
        test(received!, () => {
          expect(PathFactory(received!).slice(0, -5).split()).toEqual(['.']);
          expect(PathFactory(received!).slice(0, -6).split()).toEqual(['.']);
        });
      }
    });
  });
});
