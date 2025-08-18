declare const enum ParseErrorCode {
  InvalidSymbol = 1,
  InvalidNumberFormat = 2,
  PropertyNameExpected = 3,
  ValueExpected = 4,
  ColonExpected = 5,
  CommaExpected = 6,
  CloseBraceExpected = 7,
  CloseBracketExpected = 8,
  EndOfFileExpected = 9,
  InvalidCommentToken = 10,
  UnexpectedEndOfComment = 11,
  UnexpectedEndOfString = 12,
  UnexpectedEndOfNumber = 13,
  InvalidUnicode = 14,
  InvalidEscapeCharacter = 15,
  InvalidCharacter = 16,
}
export declare namespace JSONC {
  interface ParseError {
    error: ParseErrorCode;
    offset: number;
    length: number;
    startLine: number;
    startCharacter: number;
  }
  interface ParseOptions {
    disallowComments?: boolean;
    allowTrailingComma?: boolean;
    allowEmptyContent?: boolean;
  }
  function parse(jsonc: string, errors?: JSONC.ParseError[], options?: JSONC.ParseOptions): any;
}
export {};
