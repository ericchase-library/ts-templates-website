import { describe, expect, test } from 'bun:test';
import { Core_Array_Zip_Generator } from '../../Core_Array_Zip_Generator.js';
import { Core_String_Remove_WhiteSpace_Only_Lines } from '../../Core_String_Remove_WhiteSpace_Only_Lines.js';
import { Core_String_Trim_Lines } from '../../Core_String_Trim_Lines.js';
import { Class_NodePlatform_PathObject_Absolute_Class, NodePlatform_PathObject_Absolute_Posix_Class } from '../../NodePlatform_PathObject_Absolute_Class.js';

function Prep_SplitLines(cases: string) {
  return Core_String_Trim_Lines(Core_String_Remove_WhiteSpace_Only_Lines(cases));
}

function PathFactory(...pathlike: string[]): Class_NodePlatform_PathObject_Absolute_Class {
  return NodePlatform_PathObject_Absolute_Posix_Class(...pathlike);
}
/**
 * Note
 * On posix platforms, the backslash \ is not considered a path separator. Any
 * paths that only contain backslashes \ are considered to be a single file or
 * directory name.
 * For example, all of these are just one long name, not individual folders:
 * .\\\\?\\C:\\path\\to\\dir\\name.ext
 * ..\\C:\\path\\to\\dir\\name.ext
 * dir\\C:\\path\\to\\dir\\name.ext
 */
const set_relative_paths = Prep_SplitLines(`
  .
  ./
  ./path/to/dir/name.ext

  ..
  ../
  ../path/to/dir/name.ext

  path/to/dir/name.ext
`);
const set_absolute_paths = Prep_SplitLines(`
  /
  /path/to/dir/name.ext
`);
/**
 * Note
 * On posix platforms, the only valid absolute path root I could find is the
 * forward slash / which represents the root device. So as far as I can tell,
 * there cannot be any problematic paths for relative path objects. If the
 * initial path is not considered absolute, then the only way to create an
 * absolute path is to unshift a forward slash /. This of course will be
 * treated as a normal absolute path and the unshift call will throw. As for
 * absolute paths, there is no unshift method, so the only way to create a
 * relative path is with an overwrite call, and this is already expected.
 */
// const set_potentially_problematic_for_absolute_paths_posix: string[] = [];
// const set_potentially_problematic_for_relative_paths_posix: string[] = [];

describe(NodePlatform_PathObject_Absolute_Posix_Class.name, () => {
  describe('1. Error Cases', () => {
    //## overwrite()
    describe(PathFactory('/').overwrite.name + '()', () => {
      describe('Relative Paths Should Throw', () => {
        for (const received of set_relative_paths) {
          test(received, () => {
            expect(() => PathFactory(received)).toThrowError();
            expect(() => PathFactory('/').overwrite(received)).toThrowError();
          });
        }
      });
      test('Empty Input Should Throw', () => {
        expect(() => PathFactory()).toThrowError();
        expect(() => PathFactory('/').overwrite()).toThrowError();
      });
      test('Empty String Should Throw', () => {
        expect(() => PathFactory('')).toThrowError();
        expect(() => PathFactory('/').overwrite('')).toThrowError();
      });
    });
    //## slice()
    describe(PathFactory('/').slice.name + '(0,0)', () => {
      for (const received of set_absolute_paths) {
        test(received, () => {
          expect(() => PathFactory(received).slice(0, 0)).toThrowError();
        });
      }
    });
  });
  describe('2. Basic Cases', () => {
    //## overwrite()
    describe(PathFactory('/').overwrite.name + '()', () => {
      const set_expected = [
        //
        { root: '/', dir: '/', name: '', ext: '' },
        { root: '/', dir: '/path/to/dir', name: 'name', ext: '.ext' },
      ];
      for (const [received, expected] of Core_Array_Zip_Generator(set_absolute_paths, set_expected)) {
        test(received!, () => {
          {
            const path_object = PathFactory(received!);
            expect(path_object).toHaveProperty('root', expected?.root);
            expect(path_object).toHaveProperty('dir', expected?.dir);
            expect(path_object).toHaveProperty('name', expected?.name);
            expect(path_object).toHaveProperty('ext', expected?.ext);
          }
          {
            const path_object = PathFactory('/').overwrite(received!);
            expect(path_object).toHaveProperty('root', expected?.root);
            expect(path_object).toHaveProperty('dir', expected?.dir);
            expect(path_object).toHaveProperty('name', expected?.name);
            expect(path_object).toHaveProperty('ext', expected?.ext);
          }
        });
      }
    });

    //## join()
    describe(PathFactory('/').join.name + '()', () => {
      const set_expected = Prep_SplitLines(`
        /
        /path/to/dir/name.ext
      `);
      for (const [received, expected] of Core_Array_Zip_Generator(set_absolute_paths, set_expected)) {
        test(received!, () => {
          expect(PathFactory(received!).join()).toEqual(expected!);
        });
        test(received! + '/', () => {
          expect(PathFactory(received! + '/').join()).toEqual(expected!);
        });
      }
    });

    const set_expected_split = [
      //
      ['/'],
      ['/', 'path', 'to', 'dir', 'name.ext'],
    ];

    //## split()
    describe(PathFactory('/').split.name + '()', () => {
      for (const [received, expected] of Core_Array_Zip_Generator(set_absolute_paths, set_expected_split)) {
        test(received!, () => {
          expect(PathFactory(received!).split()).toEqual(expected!);
        });
        test(received! + '/', () => {
          expect(PathFactory(received! + '/').split()).toEqual(expected!);
        });
      }
    });

    //## push()
    describe(PathFactory('/').push.name + '()', () => {
      const set_expected_1 = Prep_SplitLines(`
        /segment.new
        /path/to/dir/name.ext/segment.new
      `);
      for (const [received, expected] of Core_Array_Zip_Generator(set_absolute_paths, set_expected_1)) {
        test(received!, () => {
          expect(PathFactory(received!).push('segment.new').join()).toEqual(expected!);
        });
      }
      const set_expected_2 = [
        //
        ['/', 'segment.new'],
        ['/', 'path', 'to', 'dir', 'name.ext', 'segment.new'],
      ];
      for (const [received, expected] of Core_Array_Zip_Generator(set_absolute_paths, set_expected_2)) {
        test(received!, () => {
          expect(PathFactory(received!).push('segment.new').split()).toEqual(expected!);
        });
      }
    });

    //## pop()
    describe(PathFactory('/').pop.name + '(0)', () => {
      for (const [received, expected_remaining] of Core_Array_Zip_Generator(set_absolute_paths, set_expected_split)) {
        test(received!, () => {
          const path_object = PathFactory(received!);
          expect(path_object.pop(0)).toEqual([]);
          expect(path_object.split()).toEqual(expected_remaining!);
        });
      }
    });
    describe(PathFactory('/').pop.name + '(1)', () => {
      const set_expected_popped = [
        //
        [],
        ['name.ext'],
      ];
      const set_expected_remaining = [
        //
        ['/'],
        ['/', 'path', 'to', 'dir'],
      ];
      for (const [received, expected_popped, expected_remaining] of Core_Array_Zip_Generator(set_absolute_paths, set_expected_popped, set_expected_remaining)) {
        test(received!, () => {
          const path_object = PathFactory(received!);
          expect(path_object.pop(1)).toEqual(expected_popped!);
          expect(path_object.split()).toEqual(expected_remaining!);
        });
      }
    });
    describe(PathFactory('/').pop.name + '(2)', () => {
      const set_expected_popped = [
        //
        [],
        ['dir', 'name.ext'],
      ];
      const set_expected_remaining = [
        //
        ['/'],
        ['/', 'path', 'to'],
      ];
      for (const [received, expected_popped, expected_remaining] of Core_Array_Zip_Generator(set_absolute_paths, set_expected_popped, set_expected_remaining)) {
        test(received!, () => {
          const path_object = PathFactory(received!);
          expect(path_object.pop(2)).toEqual(expected_popped!);
          expect(path_object.split()).toEqual(expected_remaining!);
        });
      }
    });
    describe(PathFactory('/').pop.name + '(3)', () => {
      const set_expected_popped = [
        //
        [],
        ['to', 'dir', 'name.ext'],
      ];
      const set_expected_remaining = [
        //
        ['/'],
        ['/', 'path'],
      ];
      for (const [received, expected_popped, expected_remaining] of Core_Array_Zip_Generator(set_absolute_paths, set_expected_popped, set_expected_remaining)) {
        test(received!, () => {
          const path_object = PathFactory(received!);
          expect(path_object.pop(3)).toEqual(expected_popped!);
          expect(path_object.split()).toEqual(expected_remaining!);
        });
      }
    });
    describe(PathFactory('/').pop.name + '(4)', () => {
      const set_expected_popped = [
        //
        [],
        ['path', 'to', 'dir', 'name.ext'],
      ];
      const set_expected_remaining = [
        //
        ['/'],
        ['/'],
      ];
      for (const [received, expected_popped, expected_remaining] of Core_Array_Zip_Generator(set_absolute_paths, set_expected_popped, set_expected_remaining)) {
        test(received!, () => {
          const path_object = PathFactory(received!);
          expect(path_object.pop(4)).toEqual(expected_popped!);
          expect(path_object.split()).toEqual(expected_remaining!);
        });
      }
    });
    describe(PathFactory('/').pop.name + '(5)', () => {
      const set_expected_popped = [
        //
        [],
        ['path', 'to', 'dir', 'name.ext'],
      ];
      const set_expected_remaining = [
        //
        ['/'],
        ['/'],
      ];
      for (const [received, expected_popped, expected_remaining] of Core_Array_Zip_Generator(set_absolute_paths, set_expected_popped, set_expected_remaining)) {
        test(received!, () => {
          const path_object = PathFactory(received!);
          expect(path_object.pop(5)).toEqual(expected_popped!);
          expect(path_object.split()).toEqual(expected_remaining!);
        });
      }
    });
    describe(PathFactory('/').pop.name + '(*)', () => {
      const set_expected_remaining = [
        //
        ['/'],
        ['/'],
      ];
      for (const [received, expected_remaining] of Core_Array_Zip_Generator(set_absolute_paths, set_expected_remaining)) {
        test(received!, () => {
          const path_object = PathFactory(received!);
          path_object.pop();
          path_object.pop();
          path_object.pop();
          path_object.pop();
          path_object.pop();
          path_object.pop();
          expect(path_object.split()).toEqual(expected_remaining!);
        });
      }
    });

    //## slice()
    describe(PathFactory('/').slice.name + '(!0 => 0)', () => {
      for (const [received, expected] of Core_Array_Zip_Generator(set_absolute_paths, set_expected_split)) {
        test(received!, () => {
          for (let i = -5; i < 6; i++) {
            //@ts-ignore 'start' parameter should be set to 0 if not 0
            expect(PathFactory(received!).slice(i).split()).toEqual(expected!);
          }
        });
      }
    });
    describe(PathFactory('/').slice.name + '(0)', () => {
      for (const [received, expected] of Core_Array_Zip_Generator(set_absolute_paths, set_expected_split)) {
        test(received!, () => {
          expect(PathFactory(received!).slice(0).split()).toEqual(expected!);
        });
      }
    });
    describe(PathFactory('/').slice.name + '(0,1)', () => {
      const set_expected = [
        //
        ['/'],
        ['/'],
      ];
      for (const [received, expected] of Core_Array_Zip_Generator(set_absolute_paths, set_expected)) {
        test(received!, () => {
          expect(PathFactory(received!).slice(0, 1).split()).toEqual(expected!);
        });
      }
    });
    describe(PathFactory('/').slice.name + '(0,2)', () => {
      const set_expected = [
        //
        ['/'],
        ['/', 'path'],
      ];
      for (const [received, expected] of Core_Array_Zip_Generator(set_absolute_paths, set_expected)) {
        test(received!, () => {
          expect(PathFactory(received!).slice(0, 2).split()).toEqual(expected!);
        });
      }
    });
    describe(PathFactory('/').slice.name + '(0,3)', () => {
      const set_expected = [
        //
        ['/'],
        ['/', 'path', 'to'],
      ];
      for (const [received, expected] of Core_Array_Zip_Generator(set_absolute_paths, set_expected)) {
        test(received!, () => {
          expect(PathFactory(received!).slice(0, 3).split()).toEqual(expected!);
        });
      }
    });
    describe(PathFactory('/').slice.name + '(0,4)', () => {
      const set_expected = [
        //
        ['/'],
        ['/', 'path', 'to', 'dir'],
      ];
      for (const [received, expected] of Core_Array_Zip_Generator(set_absolute_paths, set_expected)) {
        test(received!, () => {
          expect(PathFactory(received!).slice(0, 4).split()).toEqual(expected!);
        });
      }
    });
    describe(PathFactory('/').slice.name + '(0,5)', () => {
      const set_expected = [
        //
        ['/'],
        ['/', 'path', 'to', 'dir', 'name.ext'],
      ];
      for (const [received, expected] of Core_Array_Zip_Generator(set_absolute_paths, set_expected)) {
        test(received!, () => {
          expect(PathFactory(received!).slice(0, 5).split()).toEqual(expected!);
          expect(PathFactory(received!).slice(0, 6).split()).toEqual(expected!);
        });
      }
    });
    describe(PathFactory('/').slice.name + '(0,-1)', () => {
      const set_expected = [
        //
        ['/'],
        ['/', 'path', 'to', 'dir'],
      ];
      for (const [received, expected] of Core_Array_Zip_Generator(set_absolute_paths, set_expected)) {
        test(received!, () => {
          expect(PathFactory(received!).slice(0, -1).split()).toEqual(expected!);
        });
      }
    });
    describe(PathFactory('/').slice.name + '(0,-2)', () => {
      const set_expected = [
        //
        ['/'],
        ['/', 'path', 'to'],
      ];
      for (const [received, expected] of Core_Array_Zip_Generator(set_absolute_paths, set_expected)) {
        test(received!, () => {
          expect(PathFactory(received!).slice(0, -2).split()).toEqual(expected!);
        });
      }
    });
    describe(PathFactory('/').slice.name + '(0,-3)', () => {
      const set_expected = [
        //
        ['/'],
        ['/', 'path'],
      ];
      for (const [received, expected] of Core_Array_Zip_Generator(set_absolute_paths, set_expected)) {
        test(received!, () => {
          expect(PathFactory(received!).slice(0, -3).split()).toEqual(expected!);
        });
      }
    });
    describe(PathFactory('/').slice.name + '(0,-4)', () => {
      const set_expected = [
        //
        ['/'],
        ['/'],
      ];
      for (const [received, expected] of Core_Array_Zip_Generator(set_absolute_paths, set_expected)) {
        test(received!, () => {
          expect(PathFactory(received!).slice(0, -4).split()).toEqual(expected!);
          expect(PathFactory(received!).slice(0, -5).split()).toEqual(expected!);
          expect(PathFactory(received!).slice(0, -6).split()).toEqual(expected!);
        });
      }
    });
  });
});
