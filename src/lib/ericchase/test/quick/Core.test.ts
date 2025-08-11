import { describe, expect, test } from 'bun:test';
import { Core_Array_Are_Equal } from '../../Core_Array_Are_Equal.js';
import { Core_Array_Binary_Search_Exact_Match } from '../../Core_Array_Binary_Search_Exact_Match.js';
import { Core_Array_Binary_Search_Insertion_Index } from '../../Core_Array_Binary_Search_Insertion_Index.js';
import { Core_Array_Buffer_To_Bytes_Generator } from '../../Core_Array_Buffer_To_Bytes_Generator.js';
import { Core_Array_Chunks_Generator } from '../../Core_Array_Chunks_Generator.js';
import { Core_Array_Get_Endpoints } from '../../Core_Array_Get_Endpoints.js';
import { Core_Array_Shuffle } from '../../Core_Array_Shuffle.js';
import { Core_Array_Sliding_Window_Generator } from '../../Core_Array_Sliding_Window_Generator.js';
import { Core_Array_Split } from '../../Core_Array_Split.js';
import { Core_Array_Uint32_To_Hex } from '../../Core_Array_Uint32_To_Hex.js';
import { ARRAY__UINT8__EMPTY } from '../../Core_Array_Uint8.js';
import { Core_Array_Uint8_Concat } from '../../Core_Array_Uint8_Concat.js';
import { Core_Array_Uint8_Copy } from '../../Core_Array_Uint8_Copy.js';
import { Core_Array_Uint8_From_Base64 } from '../../Core_Array_Uint8_From_Base64.js';
import { Core_Array_Uint8_From_String } from '../../Core_Array_Uint8_From_String.js';
import { Core_Array_Uint8_From_Uint32 } from '../../Core_Array_Uint8_From_Uint32.js';
import { Core_Array_Uint8_Group_Class } from '../../Core_Array_Uint8_Group_Class.js';
import { Core_Array_Uint8_Split } from '../../Core_Array_Uint8_Split.js';
import { Core_Array_Uint8_Take } from '../../Core_Array_Uint8_Take.js';
import { Core_Array_Uint8_Take_End } from '../../Core_Array_Uint8_Take_End.js';
import { Core_Array_Uint8_To_ASCII } from '../../Core_Array_Uint8_To_ASCII.js';
import { Core_Array_Uint8_To_Base64 } from '../../Core_Array_Uint8_To_Base64.js';
import { Core_Array_Uint8_To_Decimal } from '../../Core_Array_Uint8_To_Decimal.js';
import { Core_Array_Uint8_To_Hex } from '../../Core_Array_Uint8_To_Hex.js';
import { Core_Array_Uint8_To_Lines } from '../../Core_Array_Uint8_To_Lines.js';
import { Core_Array_Uint8_To_String } from '../../Core_Array_Uint8_To_String.js';
import { Core_Array_Zip_Generator } from '../../Core_Array_Zip_Generator.js';
import { Core_Assert_BigInt } from '../../Core_Assert_BigInt.js';
import { Core_Assert_Boolean } from '../../Core_Assert_Boolean.js';
import { Core_Assert_Equal } from '../../Core_Assert_Equal.js';
import { Core_Assert_Function } from '../../Core_Assert_Function.js';
import { Core_Assert_Not_Equal } from '../../Core_Assert_Not_Equal.js';
import { Core_Assert_Number } from '../../Core_Assert_Number.js';
import { Core_Assert_Object } from '../../Core_Assert_Object.js';
import { Core_Assert_String } from '../../Core_Assert_String.js';
import { Core_Assert_Symbol } from '../../Core_Assert_Symbol.js';
import { Core_Assert_Undefined } from '../../Core_Assert_Undefined.js';
import { Core_Console_Error } from '../../Core_Console_Error.js';
import { Core_Console_Error_With_Date } from '../../Core_Console_Error_With_Date.js';
import { Core_Console_Log } from '../../Core_Console_Log.js';
import { Core_Console_Log_With_Date } from '../../Core_Console_Log_With_Date.js';
import { Core_JSON_Analyze } from '../../Core_JSON_Analyze.js';
import { Core_JSON_Merge } from '../../Core_JSON_Merge.js';
import { Core_JSON_Parse_Raw_String } from '../../Core_JSON_Parse_Raw_String.js';
import { Async_Core_Map_Get_Or_Default, Core_Map_Get_Or_Default } from '../../Core_Map_Get_Or_Default.js';
import { Core_Math_Cartesian_Product_Generator } from '../../Core_Math_Cartesian_Product_Generator.js';
import { Core_Math_Factorial } from '../../Core_Math_Factorial.js';
import { Core_Math_N_Cartesian_Products_Generator } from '../../Core_Math_N_Cartesian_Products_Generator.js';
import { Core_Math_N_Choose_R_Combinations_Generator } from '../../Core_Math_N_Choose_R_Combinations_Generator.js';
import { Core_Math_N_Choose_R_Permutations_Generator } from '../../Core_Math_N_Choose_R_Permutations_Generator.js';
import { Core_Math_nCr } from '../../Core_Math_nCr.js';
import { Core_Math_nPr } from '../../Core_Math_nPr.js';
import { Async_Core_Promise_Call_And_Count_Fulfilled } from '../../Core_Promise_Call_And_Count_Fulfilled.js';
import { Async_Core_Promise_Call_And_Count_Rejected } from '../../Core_Promise_Call_And_Count_Rejected.js';
import { Core_Promise_Call_And_Orphan } from '../../Core_Promise_Call_And_Orphan.js';
import { Core_Promise_Deferred_Class } from '../../Core_Promise_Deferred_Class.js';
import { Core_Promise_Orphan } from '../../Core_Promise_Orphan.js';
import { Async_Core_Stream_Read_Chunks_Generator } from '../../Core_Stream_Read_Chunks_Generator.js';
import { Async_Core_Stream_Uint8_Compare } from '../../Core_Stream_Uint8_Compare.js';
import { Async_Core_Stream_Uint8_Read_All } from '../../Core_Stream_Uint8_Read_All.js';
import { Async_Core_Stream_Uint8_Read_Lines } from '../../Core_Stream_Uint8_Read_Lines.js';
import { Async_Core_Stream_Uint8_Read_Lines_Generator } from '../../Core_Stream_Uint8_Read_Lines_Generator.js';
import { Async_Core_Stream_Uint8_Read_Some } from '../../Core_Stream_Uint8_Read_Some.js';
import { Core_String_Get_Left_Margin_Size } from '../../Core_String_Get_Left_Margin_Size.js';
import { Core_String_Line_Is_Only_WhiteSpace } from '../../Core_String_Line_Is_Only_WhiteSpace.js';
import { Core_String_Remove_WhiteSpace_Only_Lines } from '../../Core_String_Remove_WhiteSpace_Only_Lines.js';
import { Core_String_Remove_WhiteSpace_Only_Lines_From_Top_And_Bottom } from '../../Core_String_Remove_WhiteSpace_Only_Lines_From_Top_And_Bottom.js';
import { Core_String_Split } from '../../Core_String_Split.js';
import { Core_String_Split_Lines } from '../../Core_String_Split_Lines.js';
import { Core_String_Split_Multiple_Spaces } from '../../Core_String_Split_Multiple_Spaces.js';
import { Core_String_Split_Multiple_WhiteSpace } from '../../Core_String_Split_Multiple_WhiteSpace.js';
import { Core_String_To_Snake_Case } from '../../Core_String_To_Snake_Case.js';
import { Core_String_Trim_Lines } from '../../Core_String_Trim_Lines.js';
import { Core_Utility_CRC32 } from '../../Core_Utility_CRC32.js';
import { Core_Utility_CRC32_Class } from '../../Core_Utility_CRC32_Class.js';
import { Core_Utility_Decode_Bytes } from '../../Core_Utility_Decode_Bytes.js';
import { Core_Utility_Encode_Text } from '../../Core_Utility_Encode_Text.js';
import { Async_Core_Utility_Sleep } from '../../Core_Utility_Sleep.js';

describe(Core_Array_Are_Equal.name, () => {
  const cases = [
    Uint8Array.from([]), //
    Uint8Array.from([1, 2]),
    Uint8Array.from([1, 2, 3, 4]),
    Uint8ClampedArray.from([]), //
    Uint8ClampedArray.from([1, 2]),
    Uint8ClampedArray.from([1, 2, 3, 4]),
    [],
    [1, 2],
    [1, 2, 3, 4],
    ['a'],
    ['a', 'b'],
    ['a', 'b', 'c'],
  ] as const;
  for (const input of cases) {
    test(input.toString(), () => {
      expect(Core_Array_Are_Equal(input, input)).toBe(true);
    });
  }
  test('Unequal Arrays Fail', () => {
    expect(Core_Array_Are_Equal([1], [1, 2])).toBe(false);
    expect(Core_Array_Are_Equal([1, 3], [1, 2])).toBe(false);
  });
});
describe(Core_Array_Binary_Search_Exact_Match.name, () => {
  describe('[0, 2, 4, 6, 8]', () => {
    const nums = [0, 2, 4, 6, 8];
    test(' 0', () => expect(Core_Array_Binary_Search_Exact_Match(nums, 0)).toBe(0));
    test(' 2', () => expect(Core_Array_Binary_Search_Exact_Match(nums, 2)).toBe(1));
    test(' 4', () => expect(Core_Array_Binary_Search_Exact_Match(nums, 4)).toBe(2));
    test(' 6', () => expect(Core_Array_Binary_Search_Exact_Match(nums, 6)).toBe(3));
    test(' 8', () => expect(Core_Array_Binary_Search_Exact_Match(nums, 8)).toBe(4));
    //
    test('-1', () => expect(Core_Array_Binary_Search_Exact_Match(nums, -1)).toBe(-1));
    test(' 1', () => expect(Core_Array_Binary_Search_Exact_Match(nums, 1)).toBe(-1));
    test(' 3', () => expect(Core_Array_Binary_Search_Exact_Match(nums, 3)).toBe(-1));
    test(' 5', () => expect(Core_Array_Binary_Search_Exact_Match(nums, 5)).toBe(-1));
    test(' 7', () => expect(Core_Array_Binary_Search_Exact_Match(nums, 7)).toBe(-1));
    test(' 9', () => expect(Core_Array_Binary_Search_Exact_Match(nums, 9)).toBe(-1));
  });
  describe('[3, 6, 9]', () => {
    const nums = [3, 6, 9];
    test('-3', () => expect(Core_Array_Binary_Search_Exact_Match(nums, -3)).toBe(-1));
    test('-2', () => expect(Core_Array_Binary_Search_Exact_Match(nums, -2)).toBe(-1));
    test('-1', () => expect(Core_Array_Binary_Search_Exact_Match(nums, -1)).toBe(-1));
    test(' 0', () => expect(Core_Array_Binary_Search_Exact_Match(nums, 0)).toBe(-1));
    test(' 1', () => expect(Core_Array_Binary_Search_Exact_Match(nums, 1)).toBe(-1));
    test(' 2', () => expect(Core_Array_Binary_Search_Exact_Match(nums, 2)).toBe(-1));
    // 3
    test(' 4', () => expect(Core_Array_Binary_Search_Exact_Match(nums, 4)).toBe(-1));
    test(' 5', () => expect(Core_Array_Binary_Search_Exact_Match(nums, 5)).toBe(-1));
    // 6
    test(' 7', () => expect(Core_Array_Binary_Search_Exact_Match(nums, 7)).toBe(-1));
    test(' 8', () => expect(Core_Array_Binary_Search_Exact_Match(nums, 8)).toBe(-1));
    // 9
    test('10', () => expect(Core_Array_Binary_Search_Exact_Match(nums, 10)).toBe(-1));
    test('11', () => expect(Core_Array_Binary_Search_Exact_Match(nums, 11)).toBe(-1));
    test('12', () => expect(Core_Array_Binary_Search_Exact_Match(nums, 12)).toBe(-1));
  });
});
describe(Core_Array_Binary_Search_Insertion_Index.name, () => {
  describe('[0, 2, 4, 6, 8]', () => {
    const nums = [0, 2, 4, 6, 8];
    test(' 0', () => expect(Core_Array_Binary_Search_Insertion_Index(nums, 0)).toBe(0));
    test(' 2', () => expect(Core_Array_Binary_Search_Insertion_Index(nums, 2)).toBe(1));
    test(' 4', () => expect(Core_Array_Binary_Search_Insertion_Index(nums, 4)).toBe(2));
    test(' 6', () => expect(Core_Array_Binary_Search_Insertion_Index(nums, 6)).toBe(3));
    test(' 8', () => expect(Core_Array_Binary_Search_Insertion_Index(nums, 8)).toBe(4));
    //
    test('-1', () => expect(Core_Array_Binary_Search_Insertion_Index(nums, -1)).toBe(-1));
    test(' 1', () => expect(Core_Array_Binary_Search_Insertion_Index(nums, 1)).toBe(0));
    test(' 3', () => expect(Core_Array_Binary_Search_Insertion_Index(nums, 3)).toBe(1));
    test(' 5', () => expect(Core_Array_Binary_Search_Insertion_Index(nums, 5)).toBe(2));
    test(' 7', () => expect(Core_Array_Binary_Search_Insertion_Index(nums, 7)).toBe(3));
    test(' 9', () => expect(Core_Array_Binary_Search_Insertion_Index(nums, 9)).toBe(4));
  });
  describe('[3, 6, 9]', () => {
    const nums = [3, 6, 9];
    test('-3', () => expect(Core_Array_Binary_Search_Insertion_Index(nums, -3)).toBe(-1));
    test('-2', () => expect(Core_Array_Binary_Search_Insertion_Index(nums, -2)).toBe(-1));
    test('-1', () => expect(Core_Array_Binary_Search_Insertion_Index(nums, -1)).toBe(-1));
    //
    test(' 0', () => expect(Core_Array_Binary_Search_Insertion_Index(nums, 0)).toBe(-1));
    test(' 1', () => expect(Core_Array_Binary_Search_Insertion_Index(nums, 1)).toBe(-1));
    test(' 2', () => expect(Core_Array_Binary_Search_Insertion_Index(nums, 2)).toBe(-1));
    // 3
    test(' 4', () => expect(Core_Array_Binary_Search_Insertion_Index(nums, 4)).toBe(0));
    test(' 5', () => expect(Core_Array_Binary_Search_Insertion_Index(nums, 5)).toBe(0));
    // 6
    test(' 7', () => expect(Core_Array_Binary_Search_Insertion_Index(nums, 7)).toBe(1));
    test(' 8', () => expect(Core_Array_Binary_Search_Insertion_Index(nums, 8)).toBe(1));
    // 9
    test('10', () => expect(Core_Array_Binary_Search_Insertion_Index(nums, 10)).toBe(2));
    test('11', () => expect(Core_Array_Binary_Search_Insertion_Index(nums, 11)).toBe(2));
    test('12', () => expect(Core_Array_Binary_Search_Insertion_Index(nums, 12)).toBe(2));
  });
});
describe(Core_Array_Buffer_To_Bytes_Generator.name, () => {
  test('[1, 2, 3, 4]', () => {
    expect([...Core_Array_Buffer_To_Bytes_Generator(Uint8Array.from([1, 2, 3, 4]).buffer)]).toEqual([1, 2, 3, 4]);
  });
  test('[0x12345678]', () => {
    // Does not adjust for endianness
    expect([...Core_Array_Buffer_To_Bytes_Generator(Uint32Array.from([0x12345678]).buffer)]).toEqual([0x78, 0x56, 0x34, 0x12]);
  });
  test('[0x78563412]', () => {
    expect([...Core_Array_Buffer_To_Bytes_Generator(Uint32Array.from([0x78563412]).buffer)]).toEqual([0x12, 0x34, 0x56, 0x78]);
  });
});
describe(Core_Array_Chunks_Generator.name, () => {
  test('[] returns []', () => {
    expect([...Core_Array_Chunks_Generator([], [].length)]).toEqual([{ begin: 0, end: 0, slice: [] }]);
  });
  test('count < 1 returns []', () => {
    for (const arr of [[], [1], [1, 2], [1, 2, 3], [1, 2, 3, 4]]) {
      expect([...Core_Array_Chunks_Generator(arr, 0)]).toEqual([{ begin: 0, end: 0, slice: [] }]);
    }
  });
  test('count >= length returns copy of array', () => {
    for (const arr of [[1], [1, 2], [1, 2, 3], [1, 2, 3, 4]]) {
      expect([...Core_Array_Chunks_Generator(arr, arr.length)]).toEqual([
        { begin: 0, end: arr.length, slice: arr }, //
      ]);
    }
    for (const arr of [[1], [1, 2], [1, 2, 3], [1, 2, 3, 4]]) {
      expect([...Core_Array_Chunks_Generator(arr, arr.length + 1)]).toEqual([
        { begin: 0, end: arr.length, slice: arr }, //
      ]);
    }
  });
  test('count evenly divides length, returns full chunks', () => {
    expect([...Core_Array_Chunks_Generator([1, 2, 3, 4], 1)]).toEqual([
      { begin: 0, end: 1, slice: [1] },
      { begin: 1, end: 2, slice: [2] },
      { begin: 2, end: 3, slice: [3] },
      { begin: 3, end: 4, slice: [4] },
    ]);
    expect([...Core_Array_Chunks_Generator([1, 2, 3, 4], 2)]).toEqual([
      { begin: 0, end: 2, slice: [1, 2] },
      { begin: 2, end: 4, slice: [3, 4] },
    ]);
    expect([...Core_Array_Chunks_Generator([1, 2, 3, 4, 5, 6], 2)]).toEqual([
      { begin: 0, end: 2, slice: [1, 2] },
      { begin: 2, end: 4, slice: [3, 4] },
      { begin: 4, end: 6, slice: [5, 6] },
    ]);
    expect([...Core_Array_Chunks_Generator([1, 2, 3, 4, 5, 6], 3)]).toEqual([
      { begin: 0, end: 3, slice: [1, 2, 3] },
      { begin: 3, end: 6, slice: [4, 5, 6] },
    ]);
  });
  test('count does not evenly divide length, returns partial chunk', () => {
    expect([...Core_Array_Chunks_Generator([1], 2)]).toEqual([
      { begin: 0, end: 1, slice: [1] }, //
    ]);
    expect([...Core_Array_Chunks_Generator([1, 2, 3], 2)]).toEqual([
      { begin: 0, end: 2, slice: [1, 2] },
      { begin: 2, end: 3, slice: [3] },
    ]);
    expect([...Core_Array_Chunks_Generator([1, 2, 3, 4, 5], 2)]).toEqual([
      { begin: 0, end: 2, slice: [1, 2] },
      { begin: 2, end: 4, slice: [3, 4] },
      { begin: 4, end: 5, slice: [5] },
    ]);
    expect([...Core_Array_Chunks_Generator([1], 3)]).toEqual([
      { begin: 0, end: 1, slice: [1] }, //
    ]);
    expect([...Core_Array_Chunks_Generator([1, 2], 3)]).toEqual([
      { begin: 0, end: 2, slice: [1, 2] }, //
    ]);
    expect([...Core_Array_Chunks_Generator([1, 2, 3, 4], 3)]).toEqual([
      { begin: 0, end: 3, slice: [1, 2, 3] },
      { begin: 3, end: 4, slice: [4] },
    ]);
  });
});
describe(Core_Array_Get_Endpoints.name, () => {
  test('[] returns [-1, -1]', () => {
    expect(Core_Array_Get_Endpoints([])).toEqual([-1, -1]);
  });
  test('returns [0, array length]', () => {
    expect(Core_Array_Get_Endpoints([1])).toEqual([0, 1]);
    expect(Core_Array_Get_Endpoints([1, 2])).toEqual([0, 2]);
    expect(Core_Array_Get_Endpoints([1, 2, 3])).toEqual([0, 3]);
  });
});
describe(Core_Array_Shuffle.name, () => {
  test('[]', () => {
    expect(Core_Array_Shuffle([])).toEqual([]);
  });
  test('[1]', () => {
    expect(Core_Array_Shuffle([1])).toEqual([1]);
  });
  test('[1, 2]', () => {
    const possible = [
      [1, 2],
      [2, 1],
    ];
    for (let i = 0; i < 10; i++) {
      expect(possible).toContainEqual(Core_Array_Shuffle([1, 2]));
    }
  });
  test('[1, 2, 3]', () => {
    const possible = [
      [1, 2, 3],
      [1, 3, 2],
      [2, 1, 3],
      [2, 3, 1],
      [3, 1, 2],
      [3, 2, 1],
    ];
    for (let i = 0; i < 20; i++) {
      expect(possible).toContainEqual(Core_Array_Shuffle([1, 2, 3]));
    }
  });
});
describe(Core_Array_Sliding_Window_Generator.name, () => {
  test('[] returns []', () => {
    expect([...Core_Array_Sliding_Window_Generator([], [].length)]).toEqual([]);
  });
  test('count < 1 returns []', () => {
    for (const arr of [[], [1], [1, 2], [1, 2, 3], [1, 2, 3, 4]]) {
      expect([...Core_Array_Sliding_Window_Generator(arr, 0)]).toEqual([]);
    }
  });
  test('count >= length returns copy of array', () => {
    for (const arr of [[1], [1, 2], [1, 2, 3], [1, 2, 3, 4]]) {
      expect([...Core_Array_Sliding_Window_Generator(arr, arr.length)]).toEqual([
        { begin: 0, end: arr.length, slice: arr }, //
      ]);
    }
    for (const arr of [[1], [1, 2], [1, 2, 3], [1, 2, 3, 4]]) {
      expect([...Core_Array_Sliding_Window_Generator(arr, arr.length + 1)]).toEqual([
        { begin: 0, end: arr.length, slice: arr }, //
      ]);
    }
  });
  test('count = 1 returns single item arrays', () => {
    expect([...Core_Array_Sliding_Window_Generator([1], 1)]).toEqual([
      { begin: 0, end: 1, slice: [1] }, //
    ]);
    expect([...Core_Array_Sliding_Window_Generator([1, 2, 3], 1)]).toEqual([
      { begin: 0, end: 1, slice: [1] },
      { begin: 1, end: 2, slice: [2] },
      { begin: 2, end: 3, slice: [3] },
    ]);
    expect([...Core_Array_Sliding_Window_Generator([1, 2, 3, 4, 5], 1)]).toEqual([
      { begin: 0, end: 1, slice: [1] },
      { begin: 1, end: 2, slice: [2] },
      { begin: 2, end: 3, slice: [3] },
      { begin: 3, end: 4, slice: [4] },
      { begin: 4, end: 5, slice: [5] },
    ]);
  });
  test('count = 2 returns arrays of 2', () => {
    expect([...Core_Array_Sliding_Window_Generator([1, 2, 3, 4], 2)]).toEqual([
      { begin: 0, end: 2, slice: [1, 2] },
      { begin: 1, end: 3, slice: [2, 3] },
      { begin: 2, end: 4, slice: [3, 4] },
    ]);
    expect([...Core_Array_Sliding_Window_Generator([1, 2, 3, 4, 5], 2)]).toEqual([
      { begin: 0, end: 2, slice: [1, 2] },
      { begin: 1, end: 3, slice: [2, 3] },
      { begin: 2, end: 4, slice: [3, 4] },
      { begin: 3, end: 5, slice: [4, 5] },
    ]);
  });
  test('count = 3 returns arrays of 3', () => {
    expect([...Core_Array_Sliding_Window_Generator([1, 2, 3, 4], 3)]).toEqual([
      { begin: 0, end: 3, slice: [1, 2, 3] },
      { begin: 1, end: 4, slice: [2, 3, 4] },
    ]);
    expect([...Core_Array_Sliding_Window_Generator([1, 2, 3, 4, 5], 3)]).toEqual([
      { begin: 0, end: 3, slice: [1, 2, 3] },
      { begin: 1, end: 4, slice: [2, 3, 4] },
      { begin: 2, end: 5, slice: [3, 4, 5] },
    ]);
  });
});
describe(Core_Array_Split.name, () => {
  test('[]', () => {
    expect(Core_Array_Split([], -1)).toEqual([[]]);
    expect(Core_Array_Split([], 0)).toEqual([[]]);
    expect(Core_Array_Split([], 1)).toEqual([[]]);
  });
  test('[1]', () => {
    expect(Core_Array_Split([1], -1)).toEqual([[]]);
    expect(Core_Array_Split([1], 0)).toEqual([[]]);
    expect(Core_Array_Split([1], 1)).toEqual([[1]]);
  });
  test('[1, 2]', () => {
    expect(Core_Array_Split([1, 2], -1)).toEqual([[]]);
    expect(Core_Array_Split([1, 2], 0)).toEqual([[]]);
    expect(Core_Array_Split([1, 2], 1)).toEqual([[1], [2]]);
  });
  test('[1, 2, 3] split 1', () => {
    expect(Core_Array_Split([1, 2, 3], 1)).toEqual([[1], [2], [3]]);
  });
  test('[1, 2] split 2', () => {
    expect(Core_Array_Split([1, 2], 2)).toEqual([[1, 2]]);
  });
  test('[1, 2, 3, 4] split 2', () => {
    expect(Core_Array_Split([1, 2, 3, 4], 2)).toEqual([
      [1, 2],
      [3, 4],
    ]);
  });
  test('[1, 2, 3, 4, 5, 6] split 2', () => {
    expect(Core_Array_Split([1, 2, 3, 4, 5, 6], 2)).toEqual([
      [1, 2],
      [3, 4],
      [5, 6],
    ]);
  });
  test('[1, 2, 3, 4] split 6', () => {
    expect(Core_Array_Split([1, 2, 3, 4], 6)).toEqual([[1, 2, 3, 4]]);
  });
  test('[] split 1', () => {
    expect(Core_Array_Split([], 1)).toEqual([[]]);
  });
});
describe(Core_Array_Uint32_To_Hex.name, () => {
  const cases = [
    [0x00000000, '00 00 00 00'],
    [0x414fa339, '41 4f a3 39'],
    [0x9bd366ae, '9b d3 66 ae'],
    [0x0c877f61, '0c 87 7f 61'],
  ] as const;
  for (const [input, expected] of cases) {
    test(expected, () => {
      expect(Core_Array_Uint32_To_Hex(input).join(' ')).toEqual(expected);
    });
  }
});
describe(Core_Array_Uint8_Concat.name, () => {
  const cases = [
    [[Uint8Array.from([])], Uint8Array.from([])],
    [[Uint8Array.from([1, 2])], Uint8Array.from([1, 2])],
    [[Uint8Array.from([1, 2]), Uint8Array.from([3, 4])], Uint8Array.from([1, 2, 3, 4])],
  ] as const;
  for (const [input, expected] of cases) {
    test(Core_Array_Uint8_To_Hex(expected).join(' '), () => {
      expect(Core_Array_Uint8_Concat(input)).toEqual(expected);
    });
  }
});
describe(Core_Array_Uint8_Copy.name, () => {
  function fn(bytes: Uint8Array, size: number, offset: number, expected: Uint8Array) {
    test(`[${Core_Array_Uint8_To_Hex(bytes).toString()}] ${size}:${offset}`, () => {
      expect(Core_Array_Uint8_Copy(bytes, size, offset)).toEqual(expected);
    });
  }
  fn(Uint8Array.from([]), 4, 0, Uint8Array.from([]));
  fn(Uint8Array.from([]), 4, 4, Uint8Array.from([]));
  fn(Uint8Array.from([1, 2, 3, 4, 5, 6, 7, 8]), 4, 0, Uint8Array.from([1, 2, 3, 4]));
  fn(Uint8Array.from([1, 2, 3, 4, 5, 6, 7, 8]), 4, 4, Uint8Array.from([5, 6, 7, 8]));
  fn(Uint8Array.from([1, 2, 3, 4, 5, 6, 7, 8]), 4, 8, Uint8Array.from([]));
});
describe(Core_Array_Uint8_From_Base64.name, () => {
  const cases = [
    ['', ''],
    ['Zg==', 'f'],
    ['Zm8=', 'fo'],
    ['Zm9v', 'foo'],
    ['Zm9vYg==', 'foob'],
    ['Zm9vYmE=', 'fooba'],
    ['Zm9vYmFy', 'foobar'],
  ] as const;
  for (const [input, expected] of cases) {
    test(input, () => {
      expect(Core_Array_Uint8_From_Base64(input)).toEqual(Core_Array_Uint8_From_String(expected));
    });
  }
  expect(Core_Array_Uint8_From_Base64('123')).toEqual(Uint8Array.from([]));
});
describe(Core_Array_Uint8_From_String.name, () => {
  const cases = [
    ['123', Uint8Array.from([49, 50, 51])],
    ['abc', Uint8Array.from([97, 98, 99])],
    ['ABC', Uint8Array.from([65, 66, 67])],
    ['IDAT', Uint8Array.from([0x49, 0x44, 0x41, 0x54])],
  ] as const;
  for (const [input, expected] of cases) {
    test(input, () => {
      expect(Core_Array_Uint8_From_String(input)).toEqual(expected);
    });
  }
});
describe(Core_Array_Uint8_From_Uint32.name, () => {
  const cases = [
    [0x00000000, Uint8Array.from([0x00, 0x00, 0x00, 0x00])],
    [0x414fa339, Uint8Array.from([0x41, 0x4f, 0xa3, 0x39])],
    [0x9bd366ae, Uint8Array.from([0x9b, 0xd3, 0x66, 0xae])],
    [0x0c877f61, Uint8Array.from([0x0c, 0x87, 0x7f, 0x61])],
  ] as const;
  for (const [input, expected] of cases) {
    test(`0x${input.toString(16).padStart(8, '0')}`, () => {
      expect(Core_Array_Uint8_From_Uint32(input)).toEqual(expected);
    });
  }
});
describe(Core_Array_Uint8_Group_Class.name, () => {
  test('[]', () => {
    const group = Core_Array_Uint8_Group_Class();
    group.add(ARRAY__UINT8__EMPTY);
    expect(group.arrays).toEqual([ARRAY__UINT8__EMPTY]);
    expect(group.byteLength).toBe(0);
  });

  const group012345 = Core_Array_Uint8_Group_Class();
  group012345.add(Uint8Array.from([0]));
  group012345.add(Uint8Array.from([1, 2]));
  group012345.add(Uint8Array.from([3, 4, 5]));
  test('group012345.byteLength', () => {
    expect(group012345.byteLength).toBe(6);
  });
  test('group012345.get(0)', () => {
    expect(group012345.get(0)).toEqual(ARRAY__UINT8__EMPTY);
  });
  test('group012345.get(1)', () => {
    expect(group012345.get(1)).toEqual(new Uint8Array([0]));
    expect(group012345.get(1, 1)).toEqual(new Uint8Array([1]));
    expect(group012345.get(1, 2)).toEqual(new Uint8Array([2]));
    expect(group012345.get(1, 3)).toEqual(new Uint8Array([3]));
    expect(group012345.get(1, 4)).toEqual(new Uint8Array([4]));
    expect(group012345.get(1, 5)).toEqual(new Uint8Array([5]));
  });
  test('group012345.get(2)', () => {
    expect(group012345.get(2)).toEqual(new Uint8Array([0, 1]));
    expect(group012345.get(2, 1)).toEqual(new Uint8Array([1, 2]));
    expect(group012345.get(2, 2)).toEqual(new Uint8Array([2, 3]));
    expect(group012345.get(2, 3)).toEqual(new Uint8Array([3, 4]));
    expect(group012345.get(2, 4)).toEqual(new Uint8Array([4, 5]));
  });
  test('group012345.get(3)', () => {
    expect(group012345.get(3)).toEqual(new Uint8Array([0, 1, 2]));
    expect(group012345.get(3, 1)).toEqual(new Uint8Array([1, 2, 3]));
    expect(group012345.get(3, 2)).toEqual(new Uint8Array([2, 3, 4]));
    expect(group012345.get(3, 3)).toEqual(new Uint8Array([3, 4, 5]));
  });
  test('group012345.get(4)', () => {
    expect(group012345.get(4)).toEqual(new Uint8Array([0, 1, 2, 3]));
    expect(group012345.get(4, 1)).toEqual(new Uint8Array([1, 2, 3, 4]));
    expect(group012345.get(4, 2)).toEqual(new Uint8Array([2, 3, 4, 5]));
  });
  test('group012345.get(5)', () => {
    expect(group012345.get(5)).toEqual(new Uint8Array([0, 1, 2, 3, 4]));
    expect(group012345.get(5, 1)).toEqual(new Uint8Array([1, 2, 3, 4, 5]));
  });
  test('group012345.get(6)', () => {
    expect(group012345.get(6)).toEqual(new Uint8Array([0, 1, 2, 3, 4, 5]));
  });
  test('group012345.get(6,-1)', () => {
    expect(group012345.get(6, -1)).toEqual(new Uint8Array([0, 1, 2, 3, 4, 5]));
  });
  test('group012345.get(6,6)', () => {
    expect(group012345.get(6, 6)).toEqual(new Uint8Array([0, 0, 0, 0, 0, 0]));
  });
  test('group012345.get(12)', () => {
    expect(group012345.get(12)).toEqual(new Uint8Array([0, 1, 2, 3, 4, 5, 0, 0, 0, 0, 0, 0]));
  });

  test('[0x0f, 0xff0f, 0xffff0f, 0xffffff0f]', () => {
    const group = Core_Array_Uint8_Group_Class();
    group.add(Uint8Array.from([0x0f, 0xff0f, 0xffff0f, 0xffffff0f]));
    expect(group.get(group.byteLength)).toEqual(new Uint8Array([0x0f, 0x0f, 0x0f, 0x0f]));
  });
  test('[0xff, 0xffff, 0xffffff, 0xffffffff]', () => {
    const group = Core_Array_Uint8_Group_Class();
    group.add(Uint8Array.from([0xff, 0xffff, 0xffffff, 0xffffffff]));
    expect(group.get(group.byteLength)).toEqual(new Uint8Array([0xff, 0xff, 0xff, 0xff]));
  });
});
describe(Core_Array_Uint8_Split.name, () => {
  test('[]', () => {
    expect(Core_Array_Uint8_Split(Uint8Array.from([]), -1)).toEqual([Uint8Array.from([])]);
    expect(Core_Array_Uint8_Split(Uint8Array.from([]), 0)).toEqual([Uint8Array.from([])]);
    expect(Core_Array_Uint8_Split(Uint8Array.from([]), 1)).toEqual([Uint8Array.from([])]);
  });
  test('[1]', () => {
    expect(Core_Array_Uint8_Split(Uint8Array.from([1]), -1)).toEqual([Uint8Array.from([1])]);
    expect(Core_Array_Uint8_Split(Uint8Array.from([1]), 0)).toEqual([Uint8Array.from([1])]);
    expect(Core_Array_Uint8_Split(Uint8Array.from([1]), 1)).toEqual([Uint8Array.from([1])]);
  });
  test('[1, 2]', () => {
    expect(Core_Array_Uint8_Split(Uint8Array.from([1, 2]), -1)).toEqual([Uint8Array.from([1, 2])]);
    expect(Core_Array_Uint8_Split(Uint8Array.from([1, 2]), 0)).toEqual([Uint8Array.from([1, 2])]);
    expect(Core_Array_Uint8_Split(Uint8Array.from([1, 2]), 1)).toEqual([Uint8Array.from([1]), Uint8Array.from([2])]);
  });
  test('[1, 2, 3] split 1', () => {
    expect(Core_Array_Uint8_Split(Uint8Array.from([1, 2, 3]), 1)).toEqual([Uint8Array.from([1]), Uint8Array.from([2]), Uint8Array.from([3])]);
  });
  test('[1, 2] split 2', () => {
    expect(Core_Array_Uint8_Split(Uint8Array.from([1, 2]), 2)).toEqual([Uint8Array.from([1, 2])]);
  });
  test('[1, 2, 3, 4] split 2', () => {
    expect(Core_Array_Uint8_Split(Uint8Array.from([1, 2, 3, 4]), 2)).toEqual([Uint8Array.from([1, 2]), Uint8Array.from([3, 4])]);
  });
  test('[1, 2, 3, 4, 5, 6] split 2', () => {
    expect(Core_Array_Uint8_Split(Uint8Array.from([1, 2, 3, 4, 5, 6]), 2)).toEqual([Uint8Array.from([1, 2]), Uint8Array.from([3, 4]), Uint8Array.from([5, 6])]);
  });
  test('[1, 2, 3, 4] split 6', () => {
    expect(Core_Array_Uint8_Split(Uint8Array.from([1, 2, 3, 4]), 6)).toEqual([Uint8Array.from([1, 2, 3, 4])]);
  });
  test('[] split 1', () => {
    expect(Core_Array_Uint8_Split(Uint8Array.from([]), 1)).toEqual([Uint8Array.from([])]);
  });
  test('Underlying Buffers are Different', () => {
    const original = Uint8Array.from([1, 2, 3, 4, 5, 6]);
    const u8s = Core_Array_Uint8_Split(original, 2);
    for (const u8 of u8s) {
      expect(u8.buffer).not.toBe(original.buffer);
    }
  });
});
describe(Core_Array_Uint8_Take.name, () => {
  test('[]', () => {
    expect(Core_Array_Uint8_Take(Uint8Array.from([]), -1)).toEqual([Uint8Array.from([]), Uint8Array.from([])]);
    expect(Core_Array_Uint8_Take(Uint8Array.from([]), 0)).toEqual([Uint8Array.from([]), Uint8Array.from([])]);
    expect(Core_Array_Uint8_Take(Uint8Array.from([]), 1)).toEqual([Uint8Array.from([]), Uint8Array.from([])]);
  });
  test('[1]', () => {
    expect(Core_Array_Uint8_Take(Uint8Array.from([1]), -1)).toEqual([Uint8Array.from([]), Uint8Array.from([1])]);
    expect(Core_Array_Uint8_Take(Uint8Array.from([1]), 0)).toEqual([Uint8Array.from([]), Uint8Array.from([1])]);
    expect(Core_Array_Uint8_Take(Uint8Array.from([1]), 1)).toEqual([Uint8Array.from([1]), Uint8Array.from([])]);
  });
  test('[1, 2]', () => {
    expect(Core_Array_Uint8_Take(Uint8Array.from([1, 2]), -1)).toEqual([Uint8Array.from([]), Uint8Array.from([1, 2])]);
    expect(Core_Array_Uint8_Take(Uint8Array.from([1, 2]), 0)).toEqual([Uint8Array.from([]), Uint8Array.from([1, 2])]);
    expect(Core_Array_Uint8_Take(Uint8Array.from([1, 2]), 1)).toEqual([Uint8Array.from([1]), Uint8Array.from([2])]);
  });
  test('[1, 2] take 2', () => {
    expect(Core_Array_Uint8_Take(Uint8Array.from([1, 2]), 2)).toEqual([Uint8Array.from([1, 2]), Uint8Array.from([])]);
  });
  test('[1, 2, 3, 4] take 2', () => {
    expect(Core_Array_Uint8_Take(Uint8Array.from([1, 2, 3, 4]), 2)).toEqual([Uint8Array.from([1, 2]), Uint8Array.from([3, 4])]);
  });
  test('[1, 2, 3, 4] take 6', () => {
    expect(Core_Array_Uint8_Take(Uint8Array.from([1, 2, 3, 4]), 6)).toEqual([Uint8Array.from([1, 2, 3, 4]), Uint8Array.from([])]);
  });
});
describe(Core_Array_Uint8_Take_End.name, () => {
  test('[]', () => {
    expect(Core_Array_Uint8_Take_End(Uint8Array.from([]), -1)).toEqual([Uint8Array.from([]), Uint8Array.from([])]);
    expect(Core_Array_Uint8_Take_End(Uint8Array.from([]), 0)).toEqual([Uint8Array.from([]), Uint8Array.from([])]);
    expect(Core_Array_Uint8_Take_End(Uint8Array.from([]), 1)).toEqual([Uint8Array.from([]), Uint8Array.from([])]);
  });
  test('[1]', () => {
    expect(Core_Array_Uint8_Take_End(Uint8Array.from([1]), -1)).toEqual([Uint8Array.from([]), Uint8Array.from([1])]);
    expect(Core_Array_Uint8_Take_End(Uint8Array.from([1]), 0)).toEqual([Uint8Array.from([]), Uint8Array.from([1])]);
    expect(Core_Array_Uint8_Take_End(Uint8Array.from([1]), 1)).toEqual([Uint8Array.from([1]), Uint8Array.from([])]);
  });
  test('[1, 2]', () => {
    expect(Core_Array_Uint8_Take_End(Uint8Array.from([1, 2]), -1)).toEqual([Uint8Array.from([]), Uint8Array.from([1, 2])]);
    expect(Core_Array_Uint8_Take_End(Uint8Array.from([1, 2]), 0)).toEqual([Uint8Array.from([]), Uint8Array.from([1, 2])]);
    expect(Core_Array_Uint8_Take_End(Uint8Array.from([1, 2]), 1)).toEqual([Uint8Array.from([2]), Uint8Array.from([1])]);
  });
  test('[1, 2] take 2', () => {
    expect(Core_Array_Uint8_Take_End(Uint8Array.from([1, 2]), 2)).toEqual([Uint8Array.from([1, 2]), Uint8Array.from([])]);
  });
  test('[1, 2, 3, 4] take 2', () => {
    expect(Core_Array_Uint8_Take_End(Uint8Array.from([1, 2, 3, 4]), 2)).toEqual([Uint8Array.from([3, 4]), Uint8Array.from([1, 2])]);
  });
  test('[1, 2, 3, 4] take 6', () => {
    expect(Core_Array_Uint8_Take_End(Uint8Array.from([1, 2, 3, 4]), 6)).toEqual([Uint8Array.from([1, 2, 3, 4]), Uint8Array.from([])]);
  });
  test('[] take 1', () => {
    expect(Core_Array_Uint8_Take_End(Uint8Array.from([]), 1)).toEqual([Uint8Array.from([]), Uint8Array.from([])]);
  });
});
describe(Core_Array_Uint8_To_ASCII.name, () => {
  const cases = [
    [Uint8Array.from([49, 50, 51]), '123'],
    [Uint8Array.from([97, 98, 99]), 'abc'],
    [Uint8Array.from([65, 66, 67]), 'ABC'],
    [Uint8Array.from([0x49, 0x44, 0x41, 0x54]), 'IDAT'],
  ] as const;
  for (const [input, expected] of cases) {
    test(expected, () => {
      expect(Core_Array_Uint8_To_ASCII(input)).toEqual(expected);
    });
  }
});
describe(Core_Array_Uint8_To_Base64.name, () => {
  const cases = [
    ['', ''],
    ['f', 'Zg=='],
    ['fo', 'Zm8='],
    ['foo', 'Zm9v'],
    ['foob', 'Zm9vYg=='],
    ['fooba', 'Zm9vYmE='],
    ['foobar', 'Zm9vYmFy'],
  ] as const;
  for (const [input, expected] of cases) {
    test(input, () => {
      expect(Core_Array_Uint8_To_Base64(Core_Array_Uint8_From_String(input))).toEqual(expected);
    });
  }
});
describe(Core_Array_Uint8_To_Decimal.name, () => {
  const cases = [
    [0x00000000, '0 0 0 0'],
    [0x414fa339, '65 79 163 57'],
    [0x9bd366ae, '155 211 102 174'],
    [0x0c877f61, '12 135 127 97'],
  ] as const;
  for (const [input, expected] of cases) {
    test(expected, () => {
      expect(Core_Array_Uint8_To_Decimal(Core_Array_Uint8_From_Uint32(input)).join(' ')).toEqual(expected);
    });
  }
});
describe(Core_Array_Uint8_To_Hex.name, () => {
  const cases = [
    [0x00000000, '00 00 00 00'],
    [0x414fa339, '41 4f a3 39'],
    [0x9bd366ae, '9b d3 66 ae'],
    [0x0c877f61, '0c 87 7f 61'],
  ] as const;
  for (const [input, expected] of cases) {
    test(expected, () => {
      expect(Core_Array_Uint8_To_Hex(Core_Array_Uint8_From_Uint32(input)).join(' ')).toEqual(expected);
    });
  }
});
describe(Core_Array_Uint8_To_Lines.name, () => {
  test('123\\n456\\n789', () => {
    expect(Core_Array_Uint8_To_Lines(Core_Array_Uint8_From_String('123\n456\n789'))).toEqual(['123', '456', '789']);
  });
});
describe(Core_Array_Uint8_To_String.name, () => {
  const cases = [
    [Uint8Array.from([49, 50, 51]), '123'],
    [Uint8Array.from([97, 98, 99]), 'abc'],
    [Uint8Array.from([65, 66, 67]), 'ABC'],
    [Uint8Array.from([0x49, 0x44, 0x41, 0x54]), 'IDAT'],
  ] as const;
  for (const [input, expected] of cases) {
    test(expected, () => {
      expect(Core_Array_Uint8_To_String(input)).toEqual(expected);
    });
  }
});
describe(Core_Array_Zip_Generator.name, () => {
  test('[1,2,3] [a,b,c]', () => {
    expect(Array.from(Core_Array_Zip_Generator([1, 2, 3], ['a', 'b', 'c']))).toEqual([
      [1, 'a'],
      [2, 'b'],
      [3, 'c'],
    ]);
  });
  test('[1,2,3] [a]', () => {
    expect(Array.from(Core_Array_Zip_Generator([1, 2, 3], ['a']))).toEqual([
      [1, 'a'],
      [2, undefined],
      [3, undefined],
    ]);
  });
  test('[1] [a,b,c]', () => {
    expect(Array.from(Core_Array_Zip_Generator([1], ['a', 'b', 'c']))).toEqual([
      [1, 'a'],
      [undefined, 'b'],
      [undefined, 'c'],
    ]);
  });
  test('[1,2,3] 0', () => {
    expect(Array.from(Core_Array_Zip_Generator([1, 2, 3], 0 as unknown as Array<string>))).toEqual([
      [1, undefined],
      [2, undefined],
      [3, undefined],
    ]);
  });
  test('[1,2,3], 0, [a,b,c]', () => {
    expect(Array.from(Core_Array_Zip_Generator([1, 2, 3], 0 as unknown as Array<undefined>, ['a', 'b', 'c']))).toEqual([
      [1, undefined, 'a'],
      [2, undefined, 'b'],
      [3, undefined, 'c'],
    ]);
  });
});

test(Core_Assert_BigInt.name, () => {
  expect(Core_Assert_BigInt(BigInt(64))).toBeTrue();
  expect(() => Core_Assert_BigInt('64')).toThrow();
  expect(() => Core_Assert_BigInt({})).toThrow();
  expect(() => Core_Assert_BigInt(64)).toThrow();
  // expect(() => Core_Assert_BigInt(BigInt(64))).toThrow();
  expect(() => Core_Assert_BigInt(null)).toThrow();
  expect(() => Core_Assert_BigInt(Symbol('64'))).toThrow();
  expect(() => Core_Assert_BigInt(true)).toThrow();
  expect(() => Core_Assert_BigInt(undefined)).toThrow();
});
test(Core_Assert_Boolean.name, () => {
  expect(Core_Assert_Boolean(true)).toBeTrue();
  expect(Core_Assert_Boolean(false)).toBeTrue();
  expect(() => Core_Assert_Boolean('64')).toThrow();
  expect(() => Core_Assert_Boolean({})).toThrow();
  expect(() => Core_Assert_Boolean(64)).toThrow();
  expect(() => Core_Assert_Boolean(BigInt(64))).toThrow();
  expect(() => Core_Assert_Boolean(null)).toThrow();
  expect(() => Core_Assert_Boolean(Symbol('64'))).toThrow();
  expect(() => Core_Assert_Boolean(undefined)).toThrow();
});
test(Core_Assert_Equal.name, () => {
  expect(Core_Assert_Equal(true, true)).toBeTrue();
  expect(() => Core_Assert_Equal(true, false)).toThrow();
});
test(Core_Assert_Function.name, () => {
  expect(Core_Assert_Function(() => {})).toBeTrue();
  expect(() => Core_Assert_Function('64')).toThrow();
  expect(() => Core_Assert_Function({})).toThrow();
  expect(() => Core_Assert_Function(64)).toThrow();
  expect(() => Core_Assert_Function(BigInt(64))).toThrow();
  expect(() => Core_Assert_Function(null)).toThrow();
  expect(() => Core_Assert_Function(Symbol('64'))).toThrow();
  expect(() => Core_Assert_Function(true)).toThrow();
  expect(() => Core_Assert_Function(undefined)).toThrow();
});
test(Core_Assert_Not_Equal.name, () => {
  expect(Core_Assert_Not_Equal(true, false)).toBeTrue();
  expect(() => Core_Assert_Not_Equal(true, true)).toThrow();
});
test(Core_Assert_Number.name, () => {
  expect(Core_Assert_Number(64)).toBeTrue();
  expect(() => Core_Assert_Number('64')).toThrow();
  expect(() => Core_Assert_Number({})).toThrow();
  // expect(() => Core_Assert_Number(64)).toThrow();
  expect(() => Core_Assert_Number(BigInt(64))).toThrow();
  expect(() => Core_Assert_Number(null)).toThrow();
  expect(() => Core_Assert_Number(Symbol('64'))).toThrow();
  expect(() => Core_Assert_Number(true)).toThrow();
  expect(() => Core_Assert_Number(undefined)).toThrow();
});
test(Core_Assert_Object.name, () => {
  expect(Core_Assert_Object({})).toBeTrue();
  expect(() => Core_Assert_Object('64')).toThrow();
  // expect(() => Core_Assert_Object({})).toThrow();
  expect(() => Core_Assert_Object(64)).toThrow();
  expect(() => Core_Assert_Object(BigInt(64))).toThrow();
  // expect(() => Core_Assert_Object(null)).toThrow(); // null is actually considered an object
  expect(() => Core_Assert_Object(Symbol('64'))).toThrow();
  expect(() => Core_Assert_Object(true)).toThrow();
  expect(() => Core_Assert_Object(undefined)).toThrow();
});
test(Core_Assert_String.name, () => {
  expect(Core_Assert_String('64')).toBeTrue();
  // expect(() => Core_Assert_String('64')).toThrow();
  expect(() => Core_Assert_String({})).toThrow();
  expect(() => Core_Assert_String(64)).toThrow();
  expect(() => Core_Assert_String(BigInt(64))).toThrow();
  expect(() => Core_Assert_String(null)).toThrow();
  expect(() => Core_Assert_String(Symbol('64'))).toThrow();
  expect(() => Core_Assert_String(true)).toThrow();
  expect(() => Core_Assert_String(undefined)).toThrow();
});
test(Core_Assert_Symbol.name, () => {
  expect(Core_Assert_Symbol(Symbol('64'))).toBeTrue();
  expect(() => Core_Assert_Symbol('64')).toThrow();
  expect(() => Core_Assert_Symbol({})).toThrow();
  expect(() => Core_Assert_Symbol(64)).toThrow();
  expect(() => Core_Assert_Symbol(BigInt(64))).toThrow();
  expect(() => Core_Assert_Symbol(null)).toThrow();
  // expect(() => Core_Assert_Symbol(Symbol('64'))).toThrow();
  expect(() => Core_Assert_Symbol(true)).toThrow();
  expect(() => Core_Assert_Symbol(undefined)).toThrow();
});
test(Core_Assert_Undefined.name, () => {
  expect(Core_Assert_Undefined(undefined)).toBeTrue();
  expect(() => Core_Assert_Undefined('64')).toThrow();
  expect(() => Core_Assert_Undefined({})).toThrow();
  expect(() => Core_Assert_Undefined(64)).toThrow();
  expect(() => Core_Assert_Undefined(BigInt(64))).toThrow();
  expect(() => Core_Assert_Undefined(null)).toThrow();
  expect(() => Core_Assert_Undefined(Symbol('64'))).toThrow();
  expect(() => Core_Assert_Undefined(true)).toThrow();
  // expect(() => Core_Assert_Undefined(undefined)).toThrow();
});

test(Core_Console_Error.name, () => {
  expect(Core_Console_Error('Test Error')).toBeEmpty();
});
test(Core_Console_Error_With_Date.name, () => {
  expect(Core_Console_Error_With_Date('Test ErrorWithDate')).toBeEmpty();
});
test(Core_Console_Log.name, () => {
  expect(Core_Console_Log('Test Log')).toBeEmpty();
});
test(Core_Console_Log_With_Date.name, () => {
  expect(Core_Console_Log_With_Date('Test LogWithDate')).toBeEmpty();
});

describe(Core_JSON_Analyze.name, () => {
  test('Primitives', () => {
    expect(Core_JSON_Analyze(null)).toEqual({ source: null, type: 'primitive' });
    expect(Core_JSON_Analyze(true)).toEqual({ source: true, type: 'primitive' });
    expect(Core_JSON_Analyze(false)).toEqual({ source: false, type: 'primitive' });
    expect(Core_JSON_Analyze(1)).toEqual({ source: 1, type: 'primitive' });
    expect(Core_JSON_Analyze('a')).toEqual({ source: 'a', type: 'primitive' });
  });
  test('Invalid primitives throw.', () => {
    expect(() => Core_JSON_Analyze(() => {})).toThrow();
    expect(() => Core_JSON_Analyze(BigInt(0))).toThrow();
    expect(() => Core_JSON_Analyze(Symbol('foo'))).toThrow();
    expect(() => Core_JSON_Analyze(undefined)).toThrow();
  });
  test('Arrays', () => {
    expect(Core_JSON_Analyze([])).toEqual({ source: [], type: 'array' });
    expect(Core_JSON_Analyze([null])).toEqual({ source: [null], type: 'array' });
    expect(Core_JSON_Analyze([1, 2, 3])).toEqual({ source: [1, 2, 3], type: 'array' });
    expect(Core_JSON_Analyze(['a', 'b', 'c'])).toEqual({ source: ['a', 'b', 'c'], type: 'array' });
  });
  test('Arrays containing invalid primitives throw.', () => {
    expect(() => Core_JSON_Analyze([() => {}])).toThrow();
    expect(() => Core_JSON_Analyze([BigInt(0)])).toThrow();
    expect(() => Core_JSON_Analyze([Symbol('foo')])).toThrow();
    expect(() => Core_JSON_Analyze([undefined])).toThrow();
  });
  test('Arrays containing nested arrays containing invalid primitives throw.', () => {
    expect(() => Core_JSON_Analyze([[() => {}]])).toThrow();
    expect(() => Core_JSON_Analyze([[BigInt(0)]])).toThrow();
    expect(() => Core_JSON_Analyze([[Symbol('foo')]])).toThrow();
    expect(() => Core_JSON_Analyze([[undefined]])).toThrow();
  });
  test('Arrays containing objects containing invalid primitives throw.', () => {
    expect(() => Core_JSON_Analyze([{ a: () => {} }])).toThrow();
    expect(() => Core_JSON_Analyze([{ a: BigInt(0) }])).toThrow();
    expect(() => Core_JSON_Analyze([{ a: Symbol('foo') }])).toThrow();
    expect(() => Core_JSON_Analyze([{ a: undefined }])).toThrow();
  });
  describe('Objects', () => {
    expect(Core_JSON_Analyze({ a: 1, b: 2 })).toEqual({ source: { a: 1, b: 2 }, type: 'object' });
    expect(Core_JSON_Analyze({ val: 1, arr: [1, 2, 3], obj: { val: 1, arr: [1, 2, 3] } })).toEqual({ source: { val: 1, arr: [1, 2, 3], obj: { val: 1, arr: [1, 2, 3] } }, type: 'object' });
  });
  test('Objects containing invalid primitives throw.', () => {
    expect(() => Core_JSON_Analyze({ a: () => {} })).toThrow();
    expect(() => Core_JSON_Analyze({ a: BigInt(0) })).toThrow();
    expect(() => Core_JSON_Analyze({ a: Symbol('foo') })).toThrow();
    expect(() => Core_JSON_Analyze({ a: undefined })).toThrow();
  });
  test('Objects containing objects containing invalid primitives throw.', () => {
    expect(() => Core_JSON_Analyze({ a: { a: () => {} } })).toThrow();
    expect(() => Core_JSON_Analyze({ a: { a: BigInt(0) } })).toThrow();
    expect(() => Core_JSON_Analyze({ a: { a: Symbol('foo') } })).toThrow();
    expect(() => Core_JSON_Analyze({ a: { a: undefined } })).toThrow();
  });
  test('Recursive invalid primitive test.', () => {
    expect(() => Core_JSON_Analyze({ a: [{ a: () => {} }] })).toThrow();
    expect(() => Core_JSON_Analyze({ a: [{ a: [BigInt(0)] }] })).toThrow();
    expect(() => Core_JSON_Analyze({ a: [{ a: { a: Symbol('foo') } }] })).toThrow();
    expect(() => Core_JSON_Analyze({ a: [{ a: undefined }] })).toThrow();
    expect(() => Core_JSON_Analyze([{ a: () => {} }])).toThrow();
    expect(() => Core_JSON_Analyze([{ a: [BigInt(0)] }])).toThrow();
    expect(() => Core_JSON_Analyze([{ a: { a: Symbol('foo') } }])).toThrow();
    expect(() => Core_JSON_Analyze([{ a: undefined }])).toThrow();
  });
});
describe(Core_JSON_Merge.name, () => {
  describe('Primitives', () => {
    test('Returns final primitive argument.', () => {
      expect(Core_JSON_Merge(1, 2, 3, 'a', 'b', 'c')).toBe('c');
    });
  });
  describe('Arrays', () => {
    test('Returns concatenation of arrays.', () => {
      const a = [1, 2, 3];
      const b = ['a', 'b', 'c'];
      expect(Core_JSON_Merge(a, b)).toEqual([1, 2, 3, 'a', 'b', 'c']);
      expect(Core_JSON_Merge(a)).toEqual([1, 2, 3]);
      expect(Core_JSON_Merge(b)).toEqual(['a', 'b', 'c']);
    });
  });
  describe('Objects', () => {
    test('Returns a deep merge of each object.', () => {
      const a = { a: 1, b: 2 };
      const b = { c: 3 };
      expect(Core_JSON_Merge(a, b)).toEqual({ a: 1, b: 2, c: 3 });
      expect(Core_JSON_Merge(a)).toEqual({ a: 1, b: 2 });
      expect(Core_JSON_Merge(b)).toEqual({ c: 3 });
    });
    test('Newer primitive values overwrite the older primitive.', () => {
      const a = { a: 1, b: 2 };
      const b = { a: 3, c: 3 };
      expect(Core_JSON_Merge(a, b)).toEqual({ a: 3, b: 2, c: 3 });
      expect(Core_JSON_Merge(a)).toEqual({ a: 1, b: 2 });
      expect(Core_JSON_Merge(b)).toEqual({ a: 3, c: 3 });
    });
    test('Array values are concatenated.', () => {
      const a = { a: [1, 2, 3] };
      const b = { a: ['a', 'b', 'c'] };
      expect(Core_JSON_Merge(a, b)).toEqual({ a: [1, 2, 3, 'a', 'b', 'c'] });
      expect(Core_JSON_Merge(a)).toEqual({ a: [1, 2, 3] });
      expect(Core_JSON_Merge(b)).toEqual({ a: ['a', 'b', 'c'] });
    });
    test('Object values are recursively merged.', () => {
      const a = {
        val: 1,
        arr: [1, 2, 3],
        obj: {
          val: 1,
          arr: [1, 2, 3],
        },
      };
      const b = {
        val: 'a',
        arr: ['a', 'b', 'c'],
        obj: {
          val: 'a',
          arr: ['a', 'b', 'c'],
        },
      };
      expect(Core_JSON_Merge(a, b)).toEqual({
        val: 'a',
        arr: [1, 2, 3, 'a', 'b', 'c'],
        obj: {
          val: 'a',
          arr: [1, 2, 3, 'a', 'b', 'c'],
        },
      });
      expect(a).toEqual({
        val: 1,
        arr: [1, 2, 3],
        obj: {
          val: 1,
          arr: [1, 2, 3],
        },
      });
      expect(b).toEqual({
        val: 'a',
        arr: ['a', 'b', 'c'],
        obj: {
          val: 'a',
          arr: ['a', 'b', 'c'],
        },
      });
    });
  });
  test("Empty objects don't affect merging.", () => {
    expect(Core_JSON_Merge({}, { a: 1, b: 2 }, { c: 3 })).toEqual({ a: 1, b: 2, c: 3 });
    expect(Core_JSON_Merge({ a: 1, b: 2 }, {}, { a: 3, c: 3 })).toEqual({ a: 3, b: 2, c: 3 });
    expect(Core_JSON_Merge({ a: [1, 2, 3] }, { a: ['a', 'b', 'c'] }, {})).toEqual({ a: [1, 2, 3, 'a', 'b', 'c'] });
    expect(Core_JSON_Merge({}, {}, {}, {}, { val: 1, arr: [1, 2, 3], obj: { val: 1, arr: [1, 2, 3] } }, {}, {}, {}, {}, { val: 'a', arr: ['a', 'b', 'c'], obj: { val: 'a', arr: ['a', 'b', 'c'] } }, {}, {}, {}, {})).toEqual({ val: 'a', arr: [1, 2, 3, 'a', 'b', 'c'], obj: { val: 'a', arr: [1, 2, 3, 'a', 'b', 'c'] } });
  });
  test('JSON strings of different types throw error', () => {
    expect(() => Core_JSON_Merge([1], { a: 1 })).toThrowError(TypeError);
    expect(() => Core_JSON_Merge([1], 1)).toThrowError(TypeError);
    expect(() => Core_JSON_Merge({ a: 1 }, [1])).toThrowError(TypeError);
    expect(() => Core_JSON_Merge({ a: 1 }, 1)).toThrowError(TypeError);
    expect(() => Core_JSON_Merge(1, [1])).toThrowError(TypeError);
    expect(() => Core_JSON_Merge(1, { a: 1 })).toThrowError(TypeError);
  });
});
describe(Core_JSON_Parse_Raw_String.name, () => {
  test('returns exact same string', () => {
    expect(Core_JSON_Parse_Raw_String(String.raw`abc`)).toBe('abc');
  });
});

describe(Core_Map_Get_Or_Default.name, () => {
  test('set and return default value if key not in map, get value if key in map', () => {
    const map = new Map<number, string>();
    expect(Core_Map_Get_Or_Default(map, 0, () => 'a')).toBe('a');
    expect(Core_Map_Get_Or_Default(map, 0, () => 'a')).toBe('a');
  });
});

describe(Async_Core_Map_Get_Or_Default.name, () => {
  test('set and return default value if key not in map, get value if key in map', async () => {
    const map = new Map<number, string>();
    expect(
      await Async_Core_Map_Get_Or_Default(map, 0, async () => {
        await Async_Core_Utility_Sleep(0);
        return 'a';
      }),
    ).toBe('a');
    expect(
      await Async_Core_Map_Get_Or_Default(map, 0, async () => {
        await Async_Core_Utility_Sleep(0);
        return 'a';
      }),
    ).toBe('a');
  });
});

describe(Core_Math_Cartesian_Product_Generator.name, () => {
  describe('homogeneous & same type', () => {
    test('[1], [2]', () => {
      expect(Array.from(Core_Math_Cartesian_Product_Generator([1], [2]))).toEqual([[1, 2]]);
    });
    test('[1, 2], [3]', () => {
      expect(Array.from(Core_Math_Cartesian_Product_Generator([1, 2], [3]))).toEqual([
        [1, 3],
        [2, 3],
      ]);
    });
    test('[1], [2, 3]', () => {
      expect(Array.from(Core_Math_Cartesian_Product_Generator([1], [2, 3]))).toEqual([
        [1, 2],
        [1, 3],
      ]);
    });
    test('[1, 2], [3, 4]', () => {
      expect(Array.from(Core_Math_Cartesian_Product_Generator([1, 2], [3, 4]))).toEqual([
        [1, 3],
        [1, 4],
        [2, 3],
        [2, 4],
      ]);
    });
    test('[1, 2, 3], [4, 5]', () => {
      expect(Array.from(Core_Math_Cartesian_Product_Generator([1, 2, 3], [4, 5]))).toEqual([
        [1, 4],
        [1, 5],
        [2, 4],
        [2, 5],
        [3, 4],
        [3, 5],
      ]);
    });
    test('[1, 2], [3, 4, 5]', () => {
      expect(Array.from(Core_Math_Cartesian_Product_Generator([1, 2], [3, 4, 5]))).toEqual([
        [1, 3],
        [1, 4],
        [1, 5],
        [2, 3],
        [2, 4],
        [2, 5],
      ]);
    });
    test('[1, 2, 3], [4, 5, 6]', () => {
      expect(Array.from(Core_Math_Cartesian_Product_Generator([1, 2, 3], [4, 5, 6]))).toEqual([
        [1, 4],
        [1, 5],
        [1, 6],
        [2, 4],
        [2, 5],
        [2, 6],
        [3, 4],
        [3, 5],
        [3, 6],
      ]);
    });
  });
  describe('homogeneous & different types', () => {
    test("[1], ['a']", () => {
      expect(Array.from(Core_Math_Cartesian_Product_Generator([1], ['a']))).toEqual([[1, 'a']]);
    });
    test("[1, 2], ['a']", () => {
      expect(Array.from(Core_Math_Cartesian_Product_Generator([1, 2], ['a']))).toEqual([
        [1, 'a'],
        [2, 'a'],
      ]);
    });
    test("[1], ['a', 'b']", () => {
      expect(Array.from(Core_Math_Cartesian_Product_Generator([1], ['a', 'b']))).toEqual([
        [1, 'a'],
        [1, 'b'],
      ]);
    });
    test("[1, 2], ['a', 'b']", () => {
      expect(Array.from(Core_Math_Cartesian_Product_Generator([1, 2], ['a', 'b']))).toEqual([
        [1, 'a'],
        [1, 'b'],
        [2, 'a'],
        [2, 'b'],
      ]);
    });
    test("[1, 2, 3], ['a', 'b']", () => {
      expect(Array.from(Core_Math_Cartesian_Product_Generator([1, 2, 3], ['a', 'b']))).toEqual([
        [1, 'a'],
        [1, 'b'],
        [2, 'a'],
        [2, 'b'],
        [3, 'a'],
        [3, 'b'],
      ]);
    });
    test("[1, 2], ['a', 'b', 'c']", () => {
      expect(Array.from(Core_Math_Cartesian_Product_Generator([1, 2], ['a', 'b', 'c']))).toEqual([
        [1, 'a'],
        [1, 'b'],
        [1, 'c'],
        [2, 'a'],
        [2, 'b'],
        [2, 'c'],
      ]);
    });
    test("[1, 2, 3], ['a', 'b', 'c']", () => {
      expect(Array.from(Core_Math_Cartesian_Product_Generator([1, 2, 3], ['a', 'b', 'c']))).toEqual([
        [1, 'a'],
        [1, 'b'],
        [1, 'c'],
        [2, 'a'],
        [2, 'b'],
        [2, 'c'],
        [3, 'a'],
        [3, 'b'],
        [3, 'c'],
      ]);
    });
  });
  describe('heterogeneous', () => {
    test("[1, 'a'], [2]", () => {
      expect(Array.from(Core_Math_Cartesian_Product_Generator([1, 'a'], [2]))).toEqual([
        [1, 2],
        ['a', 2],
      ]);
    });
    test("[1], ['a', 2]", () => {
      expect(Array.from(Core_Math_Cartesian_Product_Generator([1], ['a', 2]))).toEqual([
        [1, 'a'],
        [1, 2],
      ]);
    });
    test("[1, 'a'], [2, 'b']", () => {
      expect(Array.from(Core_Math_Cartesian_Product_Generator([1, 'a'], [2, 'b']))).toEqual([
        [1, 2],
        [1, 'b'],
        ['a', 2],
        ['a', 'b'],
      ]);
    });
    test("[1, 'a', 3], ['b', 2]", () => {
      expect(Array.from(Core_Math_Cartesian_Product_Generator([1, 'a', 3], ['b', 2]))).toEqual([
        [1, 'b'],
        [1, 2],
        ['a', 'b'],
        ['a', 2],
        [3, 'b'],
        [3, 2],
      ]);
    });
    test("[1, 'b'], ['a', 2, 'c']", () => {
      expect(Array.from(Core_Math_Cartesian_Product_Generator([1, 'b'], ['a', 2, 'c']))).toEqual([
        [1, 'a'],
        [1, 2],
        [1, 'c'],
        ['b', 'a'],
        ['b', 2],
        ['b', 'c'],
      ]);
    });
    test("[1, 'b', 3], ['a', 2, 'c']", () => {
      expect(Array.from(Core_Math_Cartesian_Product_Generator([1, 'b', 3], ['a', 2, 'c']))).toEqual([
        [1, 'a'],
        [1, 2],
        [1, 'c'],
        ['b', 'a'],
        ['b', 2],
        ['b', 'c'],
        [3, 'a'],
        [3, 2],
        [3, 'c'],
      ]);
    });
  });
});
describe(Core_Math_Factorial.name, () => {
  const tests: [string, () => void][] = [
    ['0', () => expect(Core_Math_Factorial(0)).toBe(1n)],
    ['1', () => expect(Core_Math_Factorial(1)).toBe(1n)],
    ['2', () => expect(Core_Math_Factorial(2)).toBe(2n)],
    ['3', () => expect(Core_Math_Factorial(3)).toBe(6n)],
    ['4', () => expect(Core_Math_Factorial(4)).toBe(24n)],
    ['5', () => expect(Core_Math_Factorial(5)).toBe(120n)],
    ['6', () => expect(Core_Math_Factorial(6)).toBe(720n)],
    ['7', () => expect(Core_Math_Factorial(7)).toBe(5040n)],
    ['8', () => expect(Core_Math_Factorial(8)).toBe(40320n)],
    ['9', () => expect(Core_Math_Factorial(9)).toBe(362880n)],
    ['10', () => expect(Core_Math_Factorial(10)).toBe(3628800n)],
    ['11', () => expect(Core_Math_Factorial(11)).toBe(39916800n)],
    ['12', () => expect(Core_Math_Factorial(12)).toBe(479001600n)],
    ['13', () => expect(Core_Math_Factorial(13)).toBe(6227020800n)],
    ['14', () => expect(Core_Math_Factorial(14)).toBe(87178291200n)],
    ['15', () => expect(Core_Math_Factorial(15)).toBe(1307674368000n)],
    ['16', () => expect(Core_Math_Factorial(16)).toBe(20922789888000n)],
    ['17', () => expect(Core_Math_Factorial(17)).toBe(355687428096000n)],
    ['18', () => expect(Core_Math_Factorial(18)).toBe(6402373705728000n)],
    ['19', () => expect(Core_Math_Factorial(19)).toBe(121645100408832000n)],
    ['20', () => expect(Core_Math_Factorial(20)).toBe(2432902008176640000n)],
    ['21', () => expect(Core_Math_Factorial(21)).toBe(51090942171709440000n)],
    ['22', () => expect(Core_Math_Factorial(22)).toBe(1124000727777607680000n)],
    ['23', () => expect(Core_Math_Factorial(23)).toBe(25852016738884976640000n)],
    ['24', () => expect(Core_Math_Factorial(24)).toBe(620448401733239439360000n)],
    ['25', () => expect(Core_Math_Factorial(25)).toBe(15511210043330985984000000n)],
    ['26', () => expect(Core_Math_Factorial(26)).toBe(403291461126605635584000000n)],
    ['27', () => expect(Core_Math_Factorial(27)).toBe(10888869450418352160768000000n)],
    ['28', () => expect(Core_Math_Factorial(28)).toBe(304888344611713860501504000000n)],
    ['29', () => expect(Core_Math_Factorial(29)).toBe(8841761993739701954543616000000n)],
    ['30', () => expect(Core_Math_Factorial(30)).toBe(265252859812191058636308480000000n)],
    ['31', () => expect(Core_Math_Factorial(31)).toBe(8222838654177922817725562880000000n)],
    ['32', () => expect(Core_Math_Factorial(32)).toBe(263130836933693530167218012160000000n)],
    ['33', () => expect(Core_Math_Factorial(33)).toBe(8683317618811886495518194401280000000n)],
    ['34', () => expect(Core_Math_Factorial(34)).toBe(295232799039604140847618609643520000000n)],
    ['35', () => expect(Core_Math_Factorial(35)).toBe(10333147966386144929666651337523200000000n)],
    ['36', () => expect(Core_Math_Factorial(36)).toBe(371993326789901217467999448150835200000000n)],
    ['37', () => expect(Core_Math_Factorial(37)).toBe(13763753091226345046315979581580902400000000n)],
    ['38', () => expect(Core_Math_Factorial(38)).toBe(523022617466601111760007224100074291200000000n)],
    ['39', () => expect(Core_Math_Factorial(39)).toBe(20397882081197443358640281739902897356800000000n)],
    ['40', () => expect(Core_Math_Factorial(40)).toBe(815915283247897734345611269596115894272000000000n)],
    ['41', () => expect(Core_Math_Factorial(41)).toBe(33452526613163807108170062053440751665152000000000n)],
    ['42', () => expect(Core_Math_Factorial(42)).toBe(1405006117752879898543142606244511569936384000000000n)],
    ['43', () => expect(Core_Math_Factorial(43)).toBe(60415263063373835637355132068513997507264512000000000n)],
    ['44', () => expect(Core_Math_Factorial(44)).toBe(2658271574788448768043625811014615890319638528000000000n)],
    ['45', () => expect(Core_Math_Factorial(45)).toBe(119622220865480194561963161495657715064383733760000000000n)],
    ['46', () => expect(Core_Math_Factorial(46)).toBe(5502622159812088949850305428800254892961651752960000000000n)],
    ['47', () => expect(Core_Math_Factorial(47)).toBe(258623241511168180642964355153611979969197632389120000000000n)],
    ['48', () => expect(Core_Math_Factorial(48)).toBe(12413915592536072670862289047373375038521486354677760000000000n)],
    ['49', () => expect(Core_Math_Factorial(49)).toBe(608281864034267560872252163321295376887552831379210240000000000n)],
    ['50', () => expect(Core_Math_Factorial(50)).toBe(30414093201713378043612608166064768844377641568960512000000000000n)],
    ['51', () => expect(Core_Math_Factorial(51)).toBe(1551118753287382280224243016469303211063259720016986112000000000000n)],
    ['52', () => expect(Core_Math_Factorial(52)).toBe(80658175170943878571660636856403766975289505440883277824000000000000n)],
    ['53', () => expect(Core_Math_Factorial(53)).toBe(4274883284060025564298013753389399649690343788366813724672000000000000n)],
    ['54', () => expect(Core_Math_Factorial(54)).toBe(230843697339241380472092742683027581083278564571807941132288000000000000n)],
    ['55', () => expect(Core_Math_Factorial(55)).toBe(12696403353658275925965100847566516959580321051449436762275840000000000000n)],
    ['56', () => expect(Core_Math_Factorial(56)).toBe(710998587804863451854045647463724949736497978881168458687447040000000000000n)],
    ['57', () => expect(Core_Math_Factorial(57)).toBe(40526919504877216755680601905432322134980384796226602145184481280000000000000n)],
    ['58', () => expect(Core_Math_Factorial(58)).toBe(2350561331282878571829474910515074683828862318181142924420699914240000000000000n)],
    ['59', () => expect(Core_Math_Factorial(59)).toBe(138683118545689835737939019720389406345902876772687432540821294940160000000000000n)],
    ['60', () => expect(Core_Math_Factorial(60)).toBe(8320987112741390144276341183223364380754172606361245952449277696409600000000000000n)],
    ['61', () => expect(Core_Math_Factorial(61)).toBe(507580213877224798800856812176625227226004528988036003099405939480985600000000000000n)],
    ['62', () => expect(Core_Math_Factorial(62)).toBe(31469973260387937525653122354950764088012280797258232192163168247821107200000000000000n)],
    ['63', () => expect(Core_Math_Factorial(63)).toBe(1982608315404440064116146708361898137544773690227268628106279599612729753600000000000000n)],
    ['64', () => expect(Core_Math_Factorial(64)).toBe(126886932185884164103433389335161480802865516174545192198801894375214704230400000000000000n)],
    ['65', () => expect(Core_Math_Factorial(65)).toBe(8247650592082470666723170306785496252186258551345437492922123134388955774976000000000000000n)],
    ['66', () => expect(Core_Math_Factorial(66)).toBe(544344939077443064003729240247842752644293064388798874532860126869671081148416000000000000000n)],
    ['67', () => expect(Core_Math_Factorial(67)).toBe(36471110918188685288249859096605464427167635314049524593701628500267962436943872000000000000000n)],
    ['68', () => expect(Core_Math_Factorial(68)).toBe(2480035542436830599600990418569171581047399201355367672371710738018221445712183296000000000000000n)],
    ['69', () => expect(Core_Math_Factorial(69)).toBe(171122452428141311372468338881272839092270544893520369393648040923257279754140647424000000000000000n)],
    ['70', () => expect(Core_Math_Factorial(70)).toBe(11978571669969891796072783721689098736458938142546425857555362864628009582789845319680000000000000000n)],
    ['71', () => expect(Core_Math_Factorial(71)).toBe(850478588567862317521167644239926010288584608120796235886430763388588680378079017697280000000000000000n)],
    ['72', () => expect(Core_Math_Factorial(72)).toBe(61234458376886086861524070385274672740778091784697328983823014963978384987221689274204160000000000000000n)],
    ['73', () => expect(Core_Math_Factorial(73)).toBe(4470115461512684340891257138125051110076800700282905015819080092370422104067183317016903680000000000000000n)],
    ['74', () => expect(Core_Math_Factorial(74)).toBe(330788544151938641225953028221253782145683251820934971170611926835411235700971565459250872320000000000000000n)],
    ['75', () => expect(Core_Math_Factorial(75)).toBe(24809140811395398091946477116594033660926243886570122837795894512655842677572867409443815424000000000000000000n)],
    ['76', () => expect(Core_Math_Factorial(76)).toBe(1885494701666050254987932260861146558230394535379329335672487982961844043495537923117729972224000000000000000000n)],
    ['77', () => expect(Core_Math_Factorial(77)).toBe(145183092028285869634070784086308284983740379224208358846781574688061991349156420080065207861248000000000000000000n)],
    ['78', () => expect(Core_Math_Factorial(78)).toBe(11324281178206297831457521158732046228731749579488251990048962825668835325234200766245086213177344000000000000000000n)],
    ['79', () => expect(Core_Math_Factorial(79)).toBe(894618213078297528685144171539831652069808216779571907213868063227837990693501860533361810841010176000000000000000000n)],
    ['80', () => expect(Core_Math_Factorial(80)).toBe(71569457046263802294811533723186532165584657342365752577109445058227039255480148842668944867280814080000000000000000000n)],
    ['81', () => expect(Core_Math_Factorial(81)).toBe(5797126020747367985879734231578109105412357244731625958745865049716390179693892056256184534249745940480000000000000000000n)],
    ['82', () => expect(Core_Math_Factorial(82)).toBe(475364333701284174842138206989404946643813294067993328617160934076743994734899148613007131808479167119360000000000000000000n)],
    ['83', () => expect(Core_Math_Factorial(83)).toBe(39455239697206586511897471180120610571436503407643446275224357528369751562996629334879591940103770870906880000000000000000000n)],
    ['84', () => expect(Core_Math_Factorial(84)).toBe(3314240134565353266999387579130131288000666286242049487118846032383059131291716864129885722968716753156177920000000000000000000n)],
    ['85', () => expect(Core_Math_Factorial(85)).toBe(281710411438055027694947944226061159480056634330574206405101912752560026159795933451040286452340924018275123200000000000000000000n)],
    ['86', () => expect(Core_Math_Factorial(86)).toBe(24227095383672732381765523203441259715284870552429381750838764496720162249742450276789464634901319465571660595200000000000000000000n)],
    ['87', () => expect(Core_Math_Factorial(87)).toBe(2107757298379527717213600518699389595229783738061356212322972511214654115727593174080683423236414793504734471782400000000000000000000n)],
    ['88', () => expect(Core_Math_Factorial(88)).toBe(185482642257398439114796845645546284380220968949399346684421580986889562184028199319100141244804501828416633516851200000000000000000000n)],
    ['89', () => expect(Core_Math_Factorial(89)).toBe(16507955160908461081216919262453619309839666236496541854913520707833171034378509739399912570787600662729080382999756800000000000000000000n)],
    ['90', () => expect(Core_Math_Factorial(90)).toBe(1485715964481761497309522733620825737885569961284688766942216863704985393094065876545992131370884059645617234469978112000000000000000000000n)],
    ['91', () => expect(Core_Math_Factorial(91)).toBe(135200152767840296255166568759495142147586866476906677791741734597153670771559994765685283954750449427751168336768008192000000000000000000000n)],
    ['92', () => expect(Core_Math_Factorial(92)).toBe(12438414054641307255475324325873553077577991715875414356840239582938137710983519518443046123837041347353107486982656753664000000000000000000000n)],
    ['93', () => expect(Core_Math_Factorial(93)).toBe(1156772507081641574759205162306240436214753229576413535186142281213246807121467315215203289516844845303838996289387078090752000000000000000000000n)],
    ['94', () => expect(Core_Math_Factorial(94)).toBe(108736615665674308027365285256786601004186803580182872307497374434045199869417927630229109214583415458560865651202385340530688000000000000000000000n)],
    ['95', () => expect(Core_Math_Factorial(95)).toBe(10329978488239059262599702099394727095397746340117372869212250571234293987594703124871765375385424468563282236864226607350415360000000000000000000000n)],
    ['96', () => expect(Core_Math_Factorial(96)).toBe(991677934870949689209571401541893801158183648651267795444376054838492222809091499987689476037000748982075094738965754305639874560000000000000000000000n)],
    ['97', () => expect(Core_Math_Factorial(97)).toBe(96192759682482119853328425949563698712343813919172976158104477319333745612481875498805879175589072651261284189679678167647067832320000000000000000000000n)],
    ['98', () => expect(Core_Math_Factorial(98)).toBe(9426890448883247745626185743057242473809693764078951663494238777294707070023223798882976159207729119823605850588608460429412647567360000000000000000000000n)],
    ['99', () => expect(Core_Math_Factorial(99)).toBe(933262154439441526816992388562667004907159682643816214685929638952175999932299156089414639761565182862536979208272237582511852109168640000000000000000000000n)],
    ['100', () => expect(Core_Math_Factorial(100)).toBe(93326215443944152681699238856266700490715968264381621468592963895217599993229915608941463976156518286253697920827223758251185210916864000000000000000000000000n)],
  ];
  for (const [n, fn] of Core_Array_Shuffle(tests)) {
    test(n, fn);
  }
});
describe(Core_Math_N_Cartesian_Products_Generator.name, () => {
  describe('homogeneous & same type', () => {
    test('[1], [2], [3]', () => {
      expect(Array.from(Core_Math_N_Cartesian_Products_Generator([1], [2], [3]))).toEqual([[1, 2, 3]]);
    });
    test('[1, 2], [3], [4]', () => {
      expect(Array.from(Core_Math_N_Cartesian_Products_Generator([1, 2], [3], [4]))).toEqual([
        [1, 3, 4],
        [2, 3, 4],
      ]);
    });
    test('[1], [2, 3], [4]', () => {
      expect(Array.from(Core_Math_N_Cartesian_Products_Generator([1], [2, 3], [4]))).toEqual([
        [1, 2, 4],
        [1, 3, 4],
      ]);
    });
    test('[1], [2], [3, 4]', () => {
      expect(Array.from(Core_Math_N_Cartesian_Products_Generator([1], [2], [3, 4]))).toEqual([
        [1, 2, 3],
        [1, 2, 4],
      ]);
    });
    test('[1, 2], [3, 4], [5]', () => {
      expect(Array.from(Core_Math_N_Cartesian_Products_Generator([1, 2], [3, 4], [5]))).toEqual([
        [1, 3, 5],
        [1, 4, 5],
        [2, 3, 5],
        [2, 4, 5],
      ]);
    });
    test('[1, 2], [3, 4], [5, 6]', () => {
      expect(Array.from(Core_Math_N_Cartesian_Products_Generator([1, 2], [3, 4], [5, 6]))).toEqual([
        [1, 3, 5],
        [1, 3, 6],
        [1, 4, 5],
        [1, 4, 6],
        [2, 3, 5],
        [2, 3, 6],
        [2, 4, 5],
        [2, 4, 6],
      ]);
    });
    test('[1, 2, 3], [4, 5], [6]', () => {
      expect(Array.from(Core_Math_N_Cartesian_Products_Generator([1, 2, 3], [4, 5], [6]))).toEqual([
        [1, 4, 6],
        [1, 5, 6],
        [2, 4, 6],
        [2, 5, 6],
        [3, 4, 6],
        [3, 5, 6],
      ]);
    });
    test('[1, 2, 3], [4, 5], [6, 7]', () => {
      expect(Array.from(Core_Math_N_Cartesian_Products_Generator([1, 2, 3], [4, 5], [6, 7]))).toEqual([
        [1, 4, 6],
        [1, 4, 7],
        [1, 5, 6],
        [1, 5, 7],
        [2, 4, 6],
        [2, 4, 7],
        [2, 5, 6],
        [2, 5, 7],
        [3, 4, 6],
        [3, 4, 7],
        [3, 5, 6],
        [3, 5, 7],
      ]);
    });
    test('[1, 2, 3], [4, 5], [6, 7, 8]', () => {
      expect(Array.from(Core_Math_N_Cartesian_Products_Generator([1, 2, 3], [4, 5], [6, 7, 8]))).toEqual([
        [1, 4, 6],
        [1, 4, 7],
        [1, 4, 8],
        [1, 5, 6],
        [1, 5, 7],
        [1, 5, 8],
        [2, 4, 6],
        [2, 4, 7],
        [2, 4, 8],
        [2, 5, 6],
        [2, 5, 7],
        [2, 5, 8],
        [3, 4, 6],
        [3, 4, 7],
        [3, 4, 8],
        [3, 5, 6],
        [3, 5, 7],
        [3, 5, 8],
      ]);
    });
    test('[1, 2, 3, 4], [5, 6, 7], [8, 9], [10]', () => {
      expect(Array.from(Core_Math_N_Cartesian_Products_Generator([1, 2, 3, 4], [5, 6, 7], [8, 9], [10]))).toEqual([
        [1, 5, 8, 10],
        [1, 5, 9, 10],
        [1, 6, 8, 10],
        [1, 6, 9, 10],
        [1, 7, 8, 10],
        [1, 7, 9, 10],
        [2, 5, 8, 10],
        [2, 5, 9, 10],
        [2, 6, 8, 10],
        [2, 6, 9, 10],
        [2, 7, 8, 10],
        [2, 7, 9, 10],
        [3, 5, 8, 10],
        [3, 5, 9, 10],
        [3, 6, 8, 10],
        [3, 6, 9, 10],
        [3, 7, 8, 10],
        [3, 7, 9, 10],
        [4, 5, 8, 10],
        [4, 5, 9, 10],
        [4, 6, 8, 10],
        [4, 6, 9, 10],
        [4, 7, 8, 10],
        [4, 7, 9, 10],
      ]);
    });
  });
  describe('homogeneous & different types', () => {
    test("[1], ['a'], [3n]", () => {
      expect(Array.from(Core_Math_N_Cartesian_Products_Generator([1], ['a'], [3n]))).toEqual([[1, 'a', 3n]]);
    });
    test("[1, 2], ['a'], [4n]", () => {
      expect(Array.from(Core_Math_N_Cartesian_Products_Generator([1, 2], ['a'], [4n]))).toEqual([
        [1, 'a', 4n],
        [2, 'a', 4n],
      ]);
    });
    test("[1n], ['a', 'b'], [4]", () => {
      expect(Array.from(Core_Math_N_Cartesian_Products_Generator([1n], ['a', 'b'], [4]))).toEqual([
        [1n, 'a', 4],
        [1n, 'b', 4],
      ]);
    });
    test("['a', 'b', 'c'], [4, 5], [6n, 7n, 8n]", () => {
      expect(Array.from(Core_Math_N_Cartesian_Products_Generator(['a', 'b', 'c'], [4, 5], [6n, 7n, 8n]))).toEqual([
        ['a', 4, 6n],
        ['a', 4, 7n],
        ['a', 4, 8n],
        ['a', 5, 6n],
        ['a', 5, 7n],
        ['a', 5, 8n],
        ['b', 4, 6n],
        ['b', 4, 7n],
        ['b', 4, 8n],
        ['b', 5, 6n],
        ['b', 5, 7n],
        ['b', 5, 8n],
        ['c', 4, 6n],
        ['c', 4, 7n],
        ['c', 4, 8n],
        ['c', 5, 6n],
        ['c', 5, 7n],
        ['c', 5, 8n],
      ]);
    });
  });
  describe('heterogeneous', () => {
    test("[1, 'a'], [2], [3n, 4n]", () => {
      expect(Array.from(Core_Math_N_Cartesian_Products_Generator([1, 'a'], [2], [3n, 4n]))).toEqual([
        [1, 2, 3n],
        [1, 2, 4n],
        ['a', 2, 3n],
        ['a', 2, 4n],
      ]);
    });
    test("[1, 'b', 3n], ['a', 2n, 3], [1n, 2, 'c']", () => {
      expect(Array.from(Core_Math_N_Cartesian_Products_Generator([1, 'b', 3n], ['a', 2n, 3], [1n, 2, 'c']))).toEqual([
        [1, 'a', 1n],
        [1, 'a', 2],
        [1, 'a', 'c'],
        [1, 2n, 1n],
        [1, 2n, 2],
        [1, 2n, 'c'],
        [1, 3, 1n],
        [1, 3, 2],
        [1, 3, 'c'],
        ['b', 'a', 1n],
        ['b', 'a', 2],
        ['b', 'a', 'c'],
        ['b', 2n, 1n],
        ['b', 2n, 2],
        ['b', 2n, 'c'],
        ['b', 3, 1n],
        ['b', 3, 2],
        ['b', 3, 'c'],
        [3n, 'a', 1n],
        [3n, 'a', 2],
        [3n, 'a', 'c'],
        [3n, 2n, 1n],
        [3n, 2n, 2],
        [3n, 2n, 'c'],
        [3n, 3, 1n],
        [3n, 3, 2],
        [3n, 3, 'c'],
      ]);
    });
  });
});
describe(Core_Math_N_Choose_R_Combinations_Generator.name, () => {
  describe('without repetitions', () => {
    test('nCr(5, 1)', () => {
      expect(Core_Math_nCr(5, 1)).toBe(5n);
    });
    test('5 choose 1 combinations', () => {
      expect([...Core_Math_N_Choose_R_Combinations_Generator(['a', 'b', 'c', 'd', 'e'], 1)]).toStrictEqual([['a'], ['b'], ['c'], ['d'], ['e']]);
    });
    test('nCr(5, 2)', () => {
      expect(Core_Math_nCr(5, 2)).toBe(10n);
    });
    test('5 choose 2 combinations', () => {
      expect([...Core_Math_N_Choose_R_Combinations_Generator(['a', 'b', 'c', 'd', 'e'], 2)]).toStrictEqual([
        ['a', 'b'],
        ['a', 'c'],
        ['a', 'd'],
        ['a', 'e'],
        ['b', 'c'],
        ['b', 'd'],
        ['b', 'e'],
        ['c', 'd'],
        ['c', 'e'],
        ['d', 'e'],
      ]);
    });
    test('nCr(5, 3)', () => {
      expect(Core_Math_nCr(5, 3)).toBe(10n);
    });
    test('5 choose 3 combinations', () => {
      expect([...Core_Math_N_Choose_R_Combinations_Generator(['a', 'b', 'c', 'd', 'e'], 3)]).toStrictEqual([
        ['a', 'b', 'c'],
        ['a', 'b', 'd'],
        ['a', 'b', 'e'],
        ['a', 'c', 'd'],
        ['a', 'c', 'e'],
        ['a', 'd', 'e'],
        ['b', 'c', 'd'],
        ['b', 'c', 'e'],
        ['b', 'd', 'e'],
        ['c', 'd', 'e'],
      ]);
    });
  });
  describe('with repetitions', () => {
    test('nCr(5, 1, true)', () => {
      expect(Core_Math_nCr(5, 1, true)).toBe(5n);
    });
    test('5 choose 1 combinations', () => {
      expect([...Core_Math_N_Choose_R_Combinations_Generator(['a', 'b', 'c', 'd', 'e'], 1, true)]).toStrictEqual([['a'], ['b'], ['c'], ['d'], ['e']]);
    });
    test('nCr(5, 2, true)', () => {
      expect(Core_Math_nCr(5, 2, true)).toBe(15n);
    });
    test('5 choose 2 combinations', () => {
      expect([...Core_Math_N_Choose_R_Combinations_Generator(['a', 'b', 'c', 'd', 'e'], 2, true)]).toStrictEqual([
        ['a', 'a'],
        ['a', 'b'],
        ['a', 'c'],
        ['a', 'd'],
        ['a', 'e'],
        ['b', 'b'],
        ['b', 'c'],
        ['b', 'd'],
        ['b', 'e'],
        ['c', 'c'],
        ['c', 'd'],
        ['c', 'e'],
        ['d', 'd'],
        ['d', 'e'],
        ['e', 'e'],
      ]);
    });
    test('nCr(5, 3, true)', () => {
      expect(Core_Math_nCr(5, 3, true)).toBe(35n);
    });
    test('5 choose 3 combinations', () => {
      expect([...Core_Math_N_Choose_R_Combinations_Generator(['a', 'b', 'c', 'd', 'e'], 3, true)]).toStrictEqual([
        ['a', 'a', 'a'],
        ['a', 'a', 'b'],
        ['a', 'a', 'c'],
        ['a', 'a', 'd'],
        ['a', 'a', 'e'],
        ['a', 'b', 'b'],
        ['a', 'b', 'c'],
        ['a', 'b', 'd'],
        ['a', 'b', 'e'],
        ['a', 'c', 'c'],
        ['a', 'c', 'd'],
        ['a', 'c', 'e'],
        ['a', 'd', 'd'],
        ['a', 'd', 'e'],
        ['a', 'e', 'e'],
        ['b', 'b', 'b'],
        ['b', 'b', 'c'],
        ['b', 'b', 'd'],
        ['b', 'b', 'e'],
        ['b', 'c', 'c'],
        ['b', 'c', 'd'],
        ['b', 'c', 'e'],
        ['b', 'd', 'd'],
        ['b', 'd', 'e'],
        ['b', 'e', 'e'],
        ['c', 'c', 'c'],
        ['c', 'c', 'd'],
        ['c', 'c', 'e'],
        ['c', 'd', 'd'],
        ['c', 'd', 'e'],
        ['c', 'e', 'e'],
        ['d', 'd', 'd'],
        ['d', 'd', 'e'],
        ['d', 'e', 'e'],
        ['e', 'e', 'e'],
      ]);
    });
  });
  // The 2-Combination is what I formerly referred as the SelfCartesianProduct:
  // export function* SelfCartesianProduct<T extends readonly unknown[]>(array: T): Generator<[T[number], T[number]], void, unknown> {
  //   for (let i = 0; i < array.length; i++) {
  //     for (let j = i + 1; j < array.length; j++) {
  //       yield [array[i], array[j]];
  //     }
  //   }
  // }
  describe('homogeneous', () => {
    test('[1, 2]', () => {
      expect([...Core_Math_N_Choose_R_Combinations_Generator([1, 2], 2)]).toEqual([[1, 2]]);
    });
    test('[1, 2, 3]', () => {
      expect([...Core_Math_N_Choose_R_Combinations_Generator([1, 2, 3], 2)]).toEqual([
        [1, 2],
        [1, 3],
        [2, 3],
      ]);
    });
    test('[1, 2, 3, 4]', () => {
      expect([...Core_Math_N_Choose_R_Combinations_Generator([1, 2, 3, 4], 2)]).toEqual([
        [1, 2],
        [1, 3],
        [1, 4],
        [2, 3],
        [2, 4],
        [3, 4],
      ]);
    });
    test('[1, 2, 3, 4, 5]', () => {
      expect([...Core_Math_N_Choose_R_Combinations_Generator([1, 2, 3, 4, 5], 2)]).toEqual([
        [1, 2],
        [1, 3],
        [1, 4],
        [1, 5],
        [2, 3],
        [2, 4],
        [2, 5],
        [3, 4],
        [3, 5],
        [4, 5],
      ]);
    });
  });
  describe('heterogeneous', () => {
    test("[1, 'b']", () => {
      expect([...Core_Math_N_Choose_R_Combinations_Generator([1, 'b'], 2)]).toEqual([[1, 'b']]);
    });
    test("[1, 'b', 3]", () => {
      expect([...Core_Math_N_Choose_R_Combinations_Generator([1, 'b', 3], 2)]).toEqual([
        [1, 'b'],
        [1, 3],
        ['b', 3],
      ]);
    });
    test("[1, 'b', 3, 'd']", () => {
      expect([...Core_Math_N_Choose_R_Combinations_Generator([1, 'b', 3, 'd'], 2)]).toEqual([
        [1, 'b'],
        [1, 3],
        [1, 'd'],
        ['b', 3],
        ['b', 'd'],
        [3, 'd'],
      ]);
    });
    test("[1, 'b', 3, 'd', 5]", () => {
      expect([...Core_Math_N_Choose_R_Combinations_Generator([1, 'b', 3, 'd', 5], 2)]).toEqual([
        [1, 'b'],
        [1, 3],
        [1, 'd'],
        [1, 5],
        ['b', 3],
        ['b', 'd'],
        ['b', 5],
        [3, 'd'],
        [3, 5],
        ['d', 5],
      ]);
    });
  });
});
describe(Core_Math_N_Choose_R_Permutations_Generator.name, () => {
  describe('without repetitions', () => {
    test('nPr(5, 1)', () => {
      expect(Core_Math_nPr(5, 1)).toBe(5n);
    });
    test('5 choose 1 permutations', () => {
      expect([...Core_Math_N_Choose_R_Permutations_Generator(['a', 'b', 'c', 'd', 'e'], 1)]).toStrictEqual([['a'], ['b'], ['c'], ['d'], ['e']]);
    });
    test('nPr(5, 2)', () => {
      expect(Core_Math_nPr(5, 2)).toBe(20n);
    });
    test('5 choose 2 permutations', () => {
      expect([...Core_Math_N_Choose_R_Permutations_Generator(['a', 'b', 'c', 'd', 'e'], 2)]).toStrictEqual([
        ['a', 'b'],
        ['a', 'c'],
        ['a', 'd'],
        ['a', 'e'],
        ['b', 'a'],
        ['b', 'c'],
        ['b', 'd'],
        ['b', 'e'],
        ['c', 'a'],
        ['c', 'b'],
        ['c', 'd'],
        ['c', 'e'],
        ['d', 'a'],
        ['d', 'b'],
        ['d', 'c'],
        ['d', 'e'],
        ['e', 'a'],
        ['e', 'b'],
        ['e', 'c'],
        ['e', 'd'],
      ]);
    });
    test('nPr(5, 3)', () => {
      expect(Core_Math_nPr(5, 3)).toBe(60n);
    });
    test('5 choose 3 permutations', () => {
      expect([...Core_Math_N_Choose_R_Permutations_Generator(['a', 'b', 'c', 'd', 'e'], 3)]).toStrictEqual([
        ['a', 'b', 'c'],
        ['a', 'b', 'd'],
        ['a', 'b', 'e'],
        ['a', 'c', 'b'],
        ['a', 'c', 'd'],
        ['a', 'c', 'e'],
        ['a', 'd', 'b'],
        ['a', 'd', 'c'],
        ['a', 'd', 'e'],
        ['a', 'e', 'b'],
        ['a', 'e', 'c'],
        ['a', 'e', 'd'],
        ['b', 'a', 'c'],
        ['b', 'a', 'd'],
        ['b', 'a', 'e'],
        ['b', 'c', 'a'],
        ['b', 'c', 'd'],
        ['b', 'c', 'e'],
        ['b', 'd', 'a'],
        ['b', 'd', 'c'],
        ['b', 'd', 'e'],
        ['b', 'e', 'a'],
        ['b', 'e', 'c'],
        ['b', 'e', 'd'],
        ['c', 'a', 'b'],
        ['c', 'a', 'd'],
        ['c', 'a', 'e'],
        ['c', 'b', 'a'],
        ['c', 'b', 'd'],
        ['c', 'b', 'e'],
        ['c', 'd', 'a'],
        ['c', 'd', 'b'],
        ['c', 'd', 'e'],
        ['c', 'e', 'a'],
        ['c', 'e', 'b'],
        ['c', 'e', 'd'],
        ['d', 'a', 'b'],
        ['d', 'a', 'c'],
        ['d', 'a', 'e'],
        ['d', 'b', 'a'],
        ['d', 'b', 'c'],
        ['d', 'b', 'e'],
        ['d', 'c', 'a'],
        ['d', 'c', 'b'],
        ['d', 'c', 'e'],
        ['d', 'e', 'a'],
        ['d', 'e', 'b'],
        ['d', 'e', 'c'],
        ['e', 'a', 'b'],
        ['e', 'a', 'c'],
        ['e', 'a', 'd'],
        ['e', 'b', 'a'],
        ['e', 'b', 'c'],
        ['e', 'b', 'd'],
        ['e', 'c', 'a'],
        ['e', 'c', 'b'],
        ['e', 'c', 'd'],
        ['e', 'd', 'a'],
        ['e', 'd', 'b'],
        ['e', 'd', 'c'],
      ]);
    });
  });
  describe('with repetitions', () => {
    test('nPr(5, 1, true)', () => {
      expect(Core_Math_nPr(5, 1, true)).toBe(5n);
    });
    test('5 choose 1 permutations', () => {
      expect([...Core_Math_N_Choose_R_Permutations_Generator(['a', 'b', 'c', 'd', 'e'], 1, true)]).toStrictEqual([['a'], ['b'], ['c'], ['d'], ['e']]);
    });
    test('nPr(5, 2, true)', () => {
      expect(Core_Math_nPr(5, 2, true)).toBe(25n);
    });
    test('5 choose 2 permutations', () => {
      expect([...Core_Math_N_Choose_R_Permutations_Generator(['a', 'b', 'c', 'd', 'e'], 2, true)]).toStrictEqual([
        ['a', 'a'],
        ['a', 'b'],
        ['a', 'c'],
        ['a', 'd'],
        ['a', 'e'],
        ['b', 'a'],
        ['b', 'b'],
        ['b', 'c'],
        ['b', 'd'],
        ['b', 'e'],
        ['c', 'a'],
        ['c', 'b'],
        ['c', 'c'],
        ['c', 'd'],
        ['c', 'e'],
        ['d', 'a'],
        ['d', 'b'],
        ['d', 'c'],
        ['d', 'd'],
        ['d', 'e'],
        ['e', 'a'],
        ['e', 'b'],
        ['e', 'c'],
        ['e', 'd'],
        ['e', 'e'],
      ]);
    });
    test('nPr(5, 3, true)', () => {
      expect(Core_Math_nPr(5, 3, true)).toBe(125n);
    });
    test('5 choose 3 permutations', () => {
      expect([...Core_Math_N_Choose_R_Permutations_Generator(['a', 'b', 'c', 'd', 'e'], 3, true)]).toStrictEqual([
        ['a', 'a', 'a'],
        ['a', 'a', 'b'],
        ['a', 'a', 'c'],
        ['a', 'a', 'd'],
        ['a', 'a', 'e'],
        ['a', 'b', 'a'],
        ['a', 'b', 'b'],
        ['a', 'b', 'c'],
        ['a', 'b', 'd'],
        ['a', 'b', 'e'],
        ['a', 'c', 'a'],
        ['a', 'c', 'b'],
        ['a', 'c', 'c'],
        ['a', 'c', 'd'],
        ['a', 'c', 'e'],
        ['a', 'd', 'a'],
        ['a', 'd', 'b'],
        ['a', 'd', 'c'],
        ['a', 'd', 'd'],
        ['a', 'd', 'e'],
        ['a', 'e', 'a'],
        ['a', 'e', 'b'],
        ['a', 'e', 'c'],
        ['a', 'e', 'd'],
        ['a', 'e', 'e'],
        ['b', 'a', 'a'],
        ['b', 'a', 'b'],
        ['b', 'a', 'c'],
        ['b', 'a', 'd'],
        ['b', 'a', 'e'],
        ['b', 'b', 'a'],
        ['b', 'b', 'b'],
        ['b', 'b', 'c'],
        ['b', 'b', 'd'],
        ['b', 'b', 'e'],
        ['b', 'c', 'a'],
        ['b', 'c', 'b'],
        ['b', 'c', 'c'],
        ['b', 'c', 'd'],
        ['b', 'c', 'e'],
        ['b', 'd', 'a'],
        ['b', 'd', 'b'],
        ['b', 'd', 'c'],
        ['b', 'd', 'd'],
        ['b', 'd', 'e'],
        ['b', 'e', 'a'],
        ['b', 'e', 'b'],
        ['b', 'e', 'c'],
        ['b', 'e', 'd'],
        ['b', 'e', 'e'],
        ['c', 'a', 'a'],
        ['c', 'a', 'b'],
        ['c', 'a', 'c'],
        ['c', 'a', 'd'],
        ['c', 'a', 'e'],
        ['c', 'b', 'a'],
        ['c', 'b', 'b'],
        ['c', 'b', 'c'],
        ['c', 'b', 'd'],
        ['c', 'b', 'e'],
        ['c', 'c', 'a'],
        ['c', 'c', 'b'],
        ['c', 'c', 'c'],
        ['c', 'c', 'd'],
        ['c', 'c', 'e'],
        ['c', 'd', 'a'],
        ['c', 'd', 'b'],
        ['c', 'd', 'c'],
        ['c', 'd', 'd'],
        ['c', 'd', 'e'],
        ['c', 'e', 'a'],
        ['c', 'e', 'b'],
        ['c', 'e', 'c'],
        ['c', 'e', 'd'],
        ['c', 'e', 'e'],
        ['d', 'a', 'a'],
        ['d', 'a', 'b'],
        ['d', 'a', 'c'],
        ['d', 'a', 'd'],
        ['d', 'a', 'e'],
        ['d', 'b', 'a'],
        ['d', 'b', 'b'],
        ['d', 'b', 'c'],
        ['d', 'b', 'd'],
        ['d', 'b', 'e'],
        ['d', 'c', 'a'],
        ['d', 'c', 'b'],
        ['d', 'c', 'c'],
        ['d', 'c', 'd'],
        ['d', 'c', 'e'],
        ['d', 'd', 'a'],
        ['d', 'd', 'b'],
        ['d', 'd', 'c'],
        ['d', 'd', 'd'],
        ['d', 'd', 'e'],
        ['d', 'e', 'a'],
        ['d', 'e', 'b'],
        ['d', 'e', 'c'],
        ['d', 'e', 'd'],
        ['d', 'e', 'e'],
        ['e', 'a', 'a'],
        ['e', 'a', 'b'],
        ['e', 'a', 'c'],
        ['e', 'a', 'd'],
        ['e', 'a', 'e'],
        ['e', 'b', 'a'],
        ['e', 'b', 'b'],
        ['e', 'b', 'c'],
        ['e', 'b', 'd'],
        ['e', 'b', 'e'],
        ['e', 'c', 'a'],
        ['e', 'c', 'b'],
        ['e', 'c', 'c'],
        ['e', 'c', 'd'],
        ['e', 'c', 'e'],
        ['e', 'd', 'a'],
        ['e', 'd', 'b'],
        ['e', 'd', 'c'],
        ['e', 'd', 'd'],
        ['e', 'd', 'e'],
        ['e', 'e', 'a'],
        ['e', 'e', 'b'],
        ['e', 'e', 'c'],
        ['e', 'e', 'd'],
        ['e', 'e', 'e'],
      ]);
    });
  });
});

test(Async_Core_Promise_Call_And_Count_Fulfilled.name, async () => {
  const count = await Async_Core_Promise_Call_And_Count_Fulfilled([
    Promise.resolve(1),
    Promise.resolve(2),
    Promise.resolve(3),
    Promise.reject(1),
    Promise.reject(2),
    Promise.reject(3),
    //
  ]);
  expect(count).toBe(3);
});
test(Async_Core_Promise_Call_And_Count_Rejected.name, async () => {
  const count = await Async_Core_Promise_Call_And_Count_Rejected([
    Promise.resolve(1),
    Promise.resolve(2),
    Promise.resolve(3),
    Promise.reject(1),
    Promise.reject(2),
    Promise.reject(3),
    //
  ]);
  expect(count).toBe(3);
});
test(Core_Promise_Call_And_Orphan.name, () => {
  expect(Core_Promise_Call_And_Orphan(async () => {})).toBeEmpty();
});
test(Core_Promise_Deferred_Class.name, async () => {
  const deferred = Core_Promise_Deferred_Class<number>();
  expect(deferred.promise).toBeInstanceOf(Promise);
  (async () => {
    expect(await deferred.promise).toBe(1);
  })();
  deferred.resolve(1);
});
test(Core_Promise_Orphan.name, () => {
  expect(Core_Promise_Orphan((async () => {})())).toBeEmpty();
});

describe(Async_Core_Stream_Read_Chunks_Generator.name, () => {
  test('123 456 789.', async () => {
    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        controller.enqueue(new Uint8Array([1, 2, 3]));
        await Async_Core_Utility_Sleep(0);
        controller.enqueue(new Uint8Array([4, 5, 6]));
        await Async_Core_Utility_Sleep(0);
        controller.enqueue(new Uint8Array([7, 8, 9]));
        await Async_Core_Utility_Sleep(0);
        controller.close();
      },
    });
    expect(await Array.fromAsync(Async_Core_Stream_Read_Chunks_Generator(stream))).toEqual([
      new Uint8Array([1, 2, 3]),
      new Uint8Array([4, 5, 6]),
      new Uint8Array([7, 8, 9]),
      //
    ]);
  });
});
describe(Async_Core_Stream_Uint8_Compare.name, () => {
  test('returns true for equal stream.', async () => {
    const stream1 = new ReadableStream({
      start(controller) {
        controller.enqueue(Uint8Array.from([1, 2, 3, 4]));
        controller.close();
      },
    });
    const stream2 = new ReadableStream({
      start(controller) {
        controller.enqueue(Uint8Array.from([1, 2, 3, 4]));
        controller.close();
      },
    });
    expect(await Async_Core_Stream_Uint8_Compare(stream1, stream2)).toBeTrue();
  });
  test('returns false for unequal lengths.', async () => {
    const stream1 = new ReadableStream({
      start(controller) {
        controller.enqueue(Uint8Array.from([1, 2, 3]));
        controller.close();
      },
    });
    const stream2 = new ReadableStream({
      start(controller) {
        controller.enqueue(Uint8Array.from([1, 2, 3, 4]));
        controller.close();
      },
    });
    expect(await Async_Core_Stream_Uint8_Compare(stream1, stream2)).toBeFalse();
  });
  test('returns false for unequal streams.', async () => {
    const stream1 = new ReadableStream({
      start(controller) {
        controller.enqueue(Uint8Array.from([1, 2, 3, 4]));
        controller.close();
      },
    });
    const stream2 = new ReadableStream({
      start(controller) {
        controller.enqueue(Uint8Array.from([2, 3, 4, 5]));
        controller.close();
      },
    });
    expect(await Async_Core_Stream_Uint8_Compare(stream1, stream2)).toBeFalse();
  });
});
describe(Async_Core_Stream_Uint8_Read_All.name, () => {
  test('[1, 2, 3, 4].', async () => {
    const bytes = Uint8Array.from([1, 2, 3, 4]);
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(bytes);
        controller.close();
      },
    });
    expect([...(await Async_Core_Stream_Uint8_Read_All(stream))]).toEqual([1, 2, 3, 4]);
  });
  test('10000 bytes.', async () => {
    const bytes = new Uint8Array(10000);
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = i;
    }
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(bytes);
        controller.close();
      },
    });
    expect((await Async_Core_Stream_Uint8_Read_All(stream)).byteLength).toBe(10000);
  });
});
describe(Async_Core_Stream_Uint8_Read_Lines.name, () => {
  test('[1, 2, 3, \\n, 4, 5, 6, \\n, 7, 8, 9].', async () => {
    const bytes = Core_Array_Uint8_From_String('123\n456\n789');
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(bytes);
        controller.close();
      },
    });
    const lines: string[] = [];
    await Async_Core_Stream_Uint8_Read_Lines(stream, (line: string) => {
      lines.push(line);
    });
    expect(lines).toEqual(['123', '456', '789']);
  });
  test('returning false to reader ends the call.', async () => {
    const bytes = Core_Array_Uint8_From_String('123\n456\n789');
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(bytes);
        controller.close();
      },
    });
    const lines: string[] = [];
    await Async_Core_Stream_Uint8_Read_Lines(stream, (line: string) => {
      lines.push(line);
      return false;
    });
    expect(lines).toEqual(['123']);
  });
});
describe(Async_Core_Stream_Uint8_Read_Lines_Generator.name, () => {
  test('[1, 2, 3, \\n, 4, 5, 6, \\n, 7, 8, 9].', async () => {
    const bytes = Core_Array_Uint8_From_String('123\n456\n789');
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(bytes);
        controller.close();
      },
    });
    expect((await Array.fromAsync(Async_Core_Stream_Uint8_Read_Lines_Generator(stream))).flat()).toEqual(['123', '456', '789']);
  });
  test('cancel', () => {});
});
describe(Async_Core_Stream_Uint8_Read_Some.name, () => {
  test('[1, 2, 3, 4], read 2.', async () => {
    const bytes = Uint8Array.from([1, 2, 3, 4]);
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(bytes);
        controller.close();
      },
    });
    expect([...(await Async_Core_Stream_Uint8_Read_Some(stream, 2))]).toEqual([1, 2]);
  });
  test('[1, 2, 3, 4], read 4.', async () => {
    const bytes = Uint8Array.from([1, 2, 3, 4]);
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(bytes);
        controller.close();
      },
    });
    expect([...(await Async_Core_Stream_Uint8_Read_Some(stream, 4))]).toEqual([1, 2, 3, 4]);
  });
  test('[1, 2, 3, 4], read 6.', async () => {
    const bytes = Uint8Array.from([1, 2, 3, 4]);
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(bytes);
        controller.close();
      },
    });
    expect([...(await Async_Core_Stream_Uint8_Read_Some(stream, 6))]).toEqual([1, 2, 3, 4]);
  });
  test('10000 bytes.', async () => {
    const bytes = new Uint8Array(10000);
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = i;
    }
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(bytes);
        controller.close();
      },
    });
    expect((await Async_Core_Stream_Uint8_Read_Some(stream, 1234)).byteLength).toBe(1234);
  });
  test('count < 1 returns empty array.', async () => {
    const bytes = Uint8Array.from([1, 2, 3, 4]);
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(bytes);
        controller.close();
      },
    });
    expect([...(await Async_Core_Stream_Uint8_Read_Some(stream, 0))]).toEqual([]);
  });
});

describe(Core_String_Get_Left_Margin_Size.name, () => {
  test('Empty', () => {
    expect(Core_String_Get_Left_Margin_Size('')).toBe(0);
  });
  test('0', () => {
    expect(Core_String_Get_Left_Margin_Size('0')).toBe(0);
  });
  test('1', () => {
    expect(Core_String_Get_Left_Margin_Size(' 1')).toBe(1);
  });
  test('2', () => {
    expect(Core_String_Get_Left_Margin_Size('  2')).toBe(2);
  });
  test('3', () => {
    expect(Core_String_Get_Left_Margin_Size('   3')).toBe(3);
  });
});
describe(Core_String_Line_Is_Only_WhiteSpace.name, () => {
  test('Empty', () => {
    expect(Core_String_Line_Is_Only_WhiteSpace('')).toBeTrue();
  });
  test('Space, Tab, Newline', () => {
    for (const ch of ' \t\n') {
      expect(Core_String_Line_Is_Only_WhiteSpace(ch)).toBeTrue();
    }
    for (const permu of [...Core_Math_N_Choose_R_Permutations_Generator([' ', '\t', '\n'], 2)]) {
      expect(Core_String_Line_Is_Only_WhiteSpace(permu.join(''))).toBeTrue();
    }
    for (const permu of [...Core_Math_N_Choose_R_Permutations_Generator([' ', '\t', '\n'], 3)]) {
      expect(Core_String_Line_Is_Only_WhiteSpace(permu.join(''))).toBeTrue();
    }
    for (const permu of [...Core_Math_N_Choose_R_Permutations_Generator([' ', '\t', '\n', ' ', '\t', '\n'], 3)]) {
      expect(Core_String_Line_Is_Only_WhiteSpace(permu.join(''))).toBeTrue();
    }
    for (const permu of [...Core_Math_N_Choose_R_Permutations_Generator([' ', '\t', '\n', ' ', '\t', '\n'], 6)]) {
      expect(Core_String_Line_Is_Only_WhiteSpace(permu.join(''))).toBeTrue();
    }
  });
  test('Characters', () => {
    for (const ch of `abc123,./<>?;':"[]{}\\|!@#$%^&*()-=_+\`~`) {
      expect(Core_String_Line_Is_Only_WhiteSpace(ch)).toBeFalse();
    }
  });
});
describe(Core_String_Remove_WhiteSpace_Only_Lines.name, () => {
  test('Empty', () => {
    expect(Core_String_Remove_WhiteSpace_Only_Lines('')).toEqual([]);
  });
  test('Whitespace only lines.', () => {
    for (const ch of ' \t\n') {
      expect(Core_String_Remove_WhiteSpace_Only_Lines(ch)).toEqual([]);
    }
    for (const permu of [...Core_Math_N_Choose_R_Permutations_Generator([' ', '\t', '\n'], 2)]) {
      expect(Core_String_Remove_WhiteSpace_Only_Lines(permu.join(''))).toEqual([]);
    }
    for (const permu of [...Core_Math_N_Choose_R_Permutations_Generator([' ', '\t', '\n'], 3)]) {
      expect(Core_String_Remove_WhiteSpace_Only_Lines(permu.join(''))).toEqual([]);
    }
    for (const permu of [...Core_Math_N_Choose_R_Permutations_Generator([' ', '\t', '\n', ' ', '\t', '\n'], 3)]) {
      expect(Core_String_Remove_WhiteSpace_Only_Lines(permu.join(''))).toEqual([]);
    }
    for (const permu of [...Core_Math_N_Choose_R_Permutations_Generator([' ', '\t', '\n', ' ', '\t', '\n'], 6)]) {
      expect(Core_String_Remove_WhiteSpace_Only_Lines(permu.join(''))).toEqual([]);
    }
    expect(Core_String_Remove_WhiteSpace_Only_Lines('\n\n\n')).toEqual([]);
    expect(Core_String_Remove_WhiteSpace_Only_Lines(' \n \n \n ')).toEqual([]);
    expect(Core_String_Remove_WhiteSpace_Only_Lines(' \t\n\t \t\n \n ')).toEqual([]);
  });
  test('Text surrounded with whitespace lines.', () => {
    expect(Core_String_Remove_WhiteSpace_Only_Lines('\nasdf\n')).toEqual(['asdf']);
    expect(Core_String_Remove_WhiteSpace_Only_Lines(' \nasdf\n ')).toEqual(['asdf']);
    expect(Core_String_Remove_WhiteSpace_Only_Lines('\t \nasdf\n \t')).toEqual(['asdf']);
    expect(Core_String_Remove_WhiteSpace_Only_Lines('\nas\ndf\n')).toEqual(['as', 'df']);
    expect(Core_String_Remove_WhiteSpace_Only_Lines(' \nas\n \ndf\n ')).toEqual(['as', 'df']);
    expect(Core_String_Remove_WhiteSpace_Only_Lines('\t \nas\n\t\ndf\n \t')).toEqual(['as', 'df']);
  });
});
describe(Core_String_Remove_WhiteSpace_Only_Lines_From_Top_And_Bottom.name, () => {
  test('Empty', () => {
    expect(Core_String_Remove_WhiteSpace_Only_Lines_From_Top_And_Bottom('')).toEqual([]);
  });
  test('Whitespace only lines.', () => {
    for (const ch of ' \t\n') {
      expect(Core_String_Remove_WhiteSpace_Only_Lines_From_Top_And_Bottom(ch)).toEqual([]);
    }
    for (const permu of [...Core_Math_N_Choose_R_Permutations_Generator([' ', '\t', '\n'], 2)]) {
      expect(Core_String_Remove_WhiteSpace_Only_Lines_From_Top_And_Bottom(permu.join(''))).toEqual([]);
    }
    for (const permu of [...Core_Math_N_Choose_R_Permutations_Generator([' ', '\t', '\n'], 3)]) {
      expect(Core_String_Remove_WhiteSpace_Only_Lines_From_Top_And_Bottom(permu.join(''))).toEqual([]);
    }
    for (const permu of [...Core_Math_N_Choose_R_Permutations_Generator([' ', '\t', '\n', ' ', '\t', '\n'], 3)]) {
      expect(Core_String_Remove_WhiteSpace_Only_Lines_From_Top_And_Bottom(permu.join(''))).toEqual([]);
    }
    for (const permu of [...Core_Math_N_Choose_R_Permutations_Generator([' ', '\t', '\n', ' ', '\t', '\n'], 6)]) {
      expect(Core_String_Remove_WhiteSpace_Only_Lines_From_Top_And_Bottom(permu.join(''))).toEqual([]);
    }
    expect(Core_String_Remove_WhiteSpace_Only_Lines_From_Top_And_Bottom('\n\n\n')).toEqual([]);
    expect(Core_String_Remove_WhiteSpace_Only_Lines_From_Top_And_Bottom(' \n \n \n ')).toEqual([]);
    expect(Core_String_Remove_WhiteSpace_Only_Lines_From_Top_And_Bottom(' \t\n\t \t\n \n ')).toEqual([]);
  });
  test('Text surrounded with whitespace lines.', () => {
    expect(Core_String_Remove_WhiteSpace_Only_Lines_From_Top_And_Bottom('\nasdf\n')).toEqual(['asdf']);
    expect(Core_String_Remove_WhiteSpace_Only_Lines_From_Top_And_Bottom(' \nasdf\n ')).toEqual(['asdf']);
    expect(Core_String_Remove_WhiteSpace_Only_Lines_From_Top_And_Bottom('\t \nasdf\n \t')).toEqual(['asdf']);
    expect(Core_String_Remove_WhiteSpace_Only_Lines_From_Top_And_Bottom('\nas\ndf\n')).toEqual(['as', 'df']);
    expect(Core_String_Remove_WhiteSpace_Only_Lines_From_Top_And_Bottom(' \nas\n \ndf\n ')).toEqual(['as', ' ', 'df']);
    expect(Core_String_Remove_WhiteSpace_Only_Lines_From_Top_And_Bottom('\t \nas\n\t\ndf\n \t')).toEqual(['as', '\t', 'df']);
  });
});
describe(Core_String_Split.name, () => {
  test('Empty', () => {
    expect(Core_String_Split('', '', true)).toEqual([]);
    expect(Core_String_Split('', '', false)).toEqual([]);
  });
  test('On nothing.', () => {
    expect(Core_String_Split('a b c', '', true)).toEqual(['a', ' ', 'b', ' ', 'c']);
    expect(Core_String_Split('a b c', '', false)).toEqual(['a', ' ', 'b', ' ', 'c']);
  });
  test('On spaces.', () => {
    expect(Core_String_Split('a b c', ' ', true)).toEqual(['a', 'b', 'c']);
    expect(Core_String_Split('a b c', ' ', false)).toEqual(['a', 'b', 'c']);
  });
  test('On consecutive spaces.', () => {
    expect(Core_String_Split('a  b  c', ' ', true)).toEqual(['a', 'b', 'c']);
    expect(Core_String_Split('a  b  c', ' ', false)).toEqual(['a', '', 'b', '', 'c']);
  });
  test('On newlines.', () => {
    expect(Core_String_Split('a\nb\nc', '\n', true)).toEqual(['a', 'b', 'c']);
    expect(Core_String_Split('a\nb\nc', '\n', false)).toEqual(['a', 'b', 'c']);
  });
  test('On consecutive newlines.', () => {
    expect(Core_String_Split('a\n\nb\n\nc', '\n', true)).toEqual(['a', 'b', 'c']);
    expect(Core_String_Split('a\n\nb\n\nc', '\n', false)).toEqual(['a', '', 'b', '', 'c']);
  });
  test('On comma.', () => {
    expect(Core_String_Split('a,b,c', ',', true)).toEqual(['a', 'b', 'c']);
    expect(Core_String_Split('a,b,c', ',', false)).toEqual(['a', 'b', 'c']);
  });
});
describe(Core_String_Split_Lines.name, () => {
  test('Empty', () => {
    expect(Core_String_Split_Lines('')).toEqual(['']);
  });
  test('No newlines.', () => {
    expect(Core_String_Split_Lines('abc')).toEqual(['abc']);
  });
  test('Only lines.', () => {
    expect(Core_String_Split_Lines('\n\n\n')).toEqual(['', '', '', '']);
    expect(Core_String_Split_Lines('\n\n\n', true)).toEqual([]);
  });
  test('a/b/c', () => {
    expect(Core_String_Split_Lines('a\nb\nc')).toEqual(['a', 'b', 'c']);
  });
});
describe(Core_String_Split_Multiple_Spaces.name, () => {
  test('Empty', () => {
    expect(Core_String_Split_Multiple_Spaces('')).toEqual(['']);
  });
  test('No spaces.', () => {
    expect(Core_String_Split_Multiple_Spaces('abc')).toEqual(['abc']);
  });
  test('Only spaces.', () => {
    expect(Core_String_Split_Multiple_Spaces('   ')).toEqual(['', '']);
    expect(Core_String_Split_Multiple_Spaces('   ', true)).toEqual([]);
  });
  test('a/b/c', () => {
    expect(Core_String_Split_Multiple_Spaces('a b c')).toEqual(['a', 'b', 'c']);
    expect(Core_String_Split_Multiple_Spaces('a  b  c')).toEqual(['a', 'b', 'c']);
    expect(Core_String_Split_Multiple_Spaces('a   b   c')).toEqual(['a', 'b', 'c']);
    expect(Core_String_Split_Multiple_Spaces(' a b c ')).toEqual(['', 'a', 'b', 'c', '']);
    expect(Core_String_Split_Multiple_Spaces(' a b c ', true)).toEqual(['a', 'b', 'c']);
  });
});
describe(Core_String_Split_Multiple_WhiteSpace.name, () => {
  test('Empty', () => {
    expect(Core_String_Split_Multiple_WhiteSpace('')).toEqual(['']);
  });
  test('No whitespace.', () => {
    expect(Core_String_Split_Multiple_WhiteSpace('abc')).toEqual(['abc']);
  });
  test('Only whitespace.', () => {
    expect(Core_String_Split_Multiple_WhiteSpace(' \t\n \t \n  ')).toEqual(['', '']);
    expect(Core_String_Split_Multiple_WhiteSpace(' \t\n \t \n  ', true)).toEqual([]);
  });
  test('a/b/c', () => {
    expect(Core_String_Split_Multiple_WhiteSpace('a \t b \n c')).toEqual(['a', 'b', 'c']);
    expect(Core_String_Split_Multiple_WhiteSpace(' \t a \t b \n c \n')).toEqual(['', 'a', 'b', 'c', '']);
    expect(Core_String_Split_Multiple_WhiteSpace(' \t a \t b \n c \n', true)).toEqual(['a', 'b', 'c']);
  });
});
describe(Core_String_To_Snake_Case.name, () => {
  test('Empty', () => {
    expect(Core_String_To_Snake_Case('')).toBe('');
  });
  test('lowercase word', () => {
    expect(Core_String_To_Snake_Case('word')).toBe('word');
  });
  test('Uppercase Word', () => {
    expect(Core_String_To_Snake_Case('Word')).toBe('word');
  });
  test('a sentence.', () => {
    expect(Core_String_To_Snake_Case('a sentence.')).toBe('a-sentence.');
  });
  test('A sentence.', () => {
    expect(Core_String_To_Snake_Case('A sentence.')).toBe('a-sentence.');
  });
});
describe(Core_String_Trim_Lines.name, () => {
  test('Empty array.', () => {
    expect(Core_String_Trim_Lines([])).toEqual([]);
  });
  test('Empty line.', () => {
    expect(Core_String_Trim_Lines([''])).toEqual(['']);
  });
  test('Empty lines.', () => {
    expect(Core_String_Trim_Lines(['', '', ''])).toEqual(['', '', '']);
  });
  test('No whitespace.', () => {
    expect(Core_String_Trim_Lines(['abc'])).toEqual(['abc']);
    expect(Core_String_Trim_Lines(['abc', 'abc', 'abc'])).toEqual(['abc', 'abc', 'abc']);
  });
  test('Only whitespace.', () => {
    expect(Core_String_Trim_Lines([' \t\n \t \n  ', ' \t\n \t \n  ', ' \t\n \t \n  '])).toEqual(['', '', '']);
  });
  test('a/b/c', () => {
    expect(Core_String_Trim_Lines(['a \t b \n c'])).toEqual(['a \t b \n c']);
    expect(Core_String_Trim_Lines([' \t a \t b \n c \n '])).toEqual(['a \t b \n c']);
  });
});

describe(Core_Utility_CRC32.name, () => {
  const cases = [
    // Trivial one.
    ['', 0x00000000], //
    // Source: https://rosettacode.org/wiki/CRC-32
    ['The quick brown fox jumps over the lazy dog', 0x414fa339],
    // Source: http://cryptomanager.com/tv.html
    ['various CRC algorithms input data', 0x9bd366ae],
    // Source: http://www.febooti.com/products/filetweak/members/hash-and-crc/test-vectors/
    ['Test vector from febooti.com', 0x0c877f61],
  ] as const;
  for (const [input, expected] of cases) {
    test(input, () => {
      expect(Core_Utility_CRC32(Core_Utility_Encode_Text(input))).toEqual(expected);
    });
  }
  test('123456789 => 0xCBF43926', () => {
    expect(Core_Utility_CRC32(Core_Utility_Encode_Text('123456789'))).toEqual(0xcbf43926);
  });
});
describe(Core_Utility_CRC32_Class.name, () => {
  test('123, 456, 789 => 0xCBF43926', () => {
    const crc = Core_Utility_CRC32_Class();
    crc.update(Core_Utility_Encode_Text('123'));
    crc.update(Core_Utility_Encode_Text('456'));
    crc.update(Core_Utility_Encode_Text('789'));
    expect(crc.value).toEqual(0xcbf43926);
  });
});
describe(Core_Utility_Decode_Bytes.name, () => {
  test('[49,50,51]', () => {
    expect(Core_Utility_Decode_Bytes(new Uint8Array([49, 50, 51]))).toBe('123');
  });
});
describe(Core_Utility_Encode_Text.name, () => {
  test('123', () => {
    expect(Core_Utility_Encode_Text('123')).toEqual(new Uint8Array([49, 50, 51]));
  });
});
