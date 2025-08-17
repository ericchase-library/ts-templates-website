// src/node-jsonc-parser/src/impl/scanner.ts
function createScanner(text, ignoreTrivia = false) {
  const len = text.length;
  let pos = 0, value = "", tokenOffset = 0, token = 16 /* Unknown */, lineNumber = 0, lineStartOffset = 0, tokenLineStartOffset = 0, prevTokenLineStartOffset = 0, scanError = 0 /* None */;
  function scanHexDigits(count, exact) {
    let digits = 0;
    let value2 = 0;
    while (digits < count || !exact) {
      let ch = text.charCodeAt(pos);
      if (ch >= 48 /* _0 */ && ch <= 57 /* _9 */) {
        value2 = value2 * 16 + ch - 48 /* _0 */;
      } else if (ch >= 65 /* A */ && ch <= 70 /* F */) {
        value2 = value2 * 16 + ch - 65 /* A */ + 10;
      } else if (ch >= 97 /* a */ && ch <= 102 /* f */) {
        value2 = value2 * 16 + ch - 97 /* a */ + 10;
      } else {
        break;
      }
      pos++;
      digits++;
    }
    if (digits < count) {
      value2 = -1;
    }
    return value2;
  }
  function setPosition(newPosition) {
    pos = newPosition;
    value = "";
    tokenOffset = 0;
    token = 16 /* Unknown */;
    scanError = 0 /* None */;
  }
  function scanNumber() {
    let start = pos;
    if (text.charCodeAt(pos) === 48 /* _0 */) {
      pos++;
    } else {
      pos++;
      while (pos < text.length && isDigit(text.charCodeAt(pos))) {
        pos++;
      }
    }
    if (pos < text.length && text.charCodeAt(pos) === 46 /* dot */) {
      pos++;
      if (pos < text.length && isDigit(text.charCodeAt(pos))) {
        pos++;
        while (pos < text.length && isDigit(text.charCodeAt(pos))) {
          pos++;
        }
      } else {
        scanError = 3 /* UnexpectedEndOfNumber */;
        return text.substring(start, pos);
      }
    }
    let end = pos;
    if (pos < text.length && (text.charCodeAt(pos) === 69 /* E */ || text.charCodeAt(pos) === 101 /* e */)) {
      pos++;
      if (pos < text.length && text.charCodeAt(pos) === 43 /* plus */ || text.charCodeAt(pos) === 45 /* minus */) {
        pos++;
      }
      if (pos < text.length && isDigit(text.charCodeAt(pos))) {
        pos++;
        while (pos < text.length && isDigit(text.charCodeAt(pos))) {
          pos++;
        }
        end = pos;
      } else {
        scanError = 3 /* UnexpectedEndOfNumber */;
      }
    }
    return text.substring(start, end);
  }
  function scanString() {
    let result = "", start = pos;
    while (true) {
      if (pos >= len) {
        result += text.substring(start, pos);
        scanError = 2 /* UnexpectedEndOfString */;
        break;
      }
      const ch = text.charCodeAt(pos);
      if (ch === 34 /* doubleQuote */) {
        result += text.substring(start, pos);
        pos++;
        break;
      }
      if (ch === 92 /* backslash */) {
        result += text.substring(start, pos);
        pos++;
        if (pos >= len) {
          scanError = 2 /* UnexpectedEndOfString */;
          break;
        }
        const ch2 = text.charCodeAt(pos++);
        switch (ch2) {
          case 34 /* doubleQuote */:
            result += '"';
            break;
          case 92 /* backslash */:
            result += "\\";
            break;
          case 47 /* slash */:
            result += "/";
            break;
          case 98 /* b */:
            result += "\b";
            break;
          case 102 /* f */:
            result += "\f";
            break;
          case 110 /* n */:
            result += `
`;
            break;
          case 114 /* r */:
            result += "\r";
            break;
          case 116 /* t */:
            result += "\t";
            break;
          case 117 /* u */:
            {
              const ch3 = scanHexDigits(4, true);
              if (ch3 >= 0) {
                result += String.fromCharCode(ch3);
              } else {
                scanError = 4 /* InvalidUnicode */;
              }
            }
            break;
          default:
            scanError = 5 /* InvalidEscapeCharacter */;
        }
        start = pos;
        continue;
      }
      if (ch >= 0 && ch <= 31) {
        if (isLineBreak(ch)) {
          result += text.substring(start, pos);
          scanError = 2 /* UnexpectedEndOfString */;
          break;
        } else {
          scanError = 6 /* InvalidCharacter */;
        }
      }
      pos++;
    }
    return result;
  }
  function scanNext() {
    value = "";
    scanError = 0 /* None */;
    tokenOffset = pos;
    lineStartOffset = lineNumber;
    prevTokenLineStartOffset = tokenLineStartOffset;
    if (pos >= len) {
      tokenOffset = len;
      return token = 17 /* EOF */;
    }
    let code = text.charCodeAt(pos);
    if (isWhiteSpace(code)) {
      do {
        pos++;
        value += String.fromCharCode(code);
        code = text.charCodeAt(pos);
      } while (isWhiteSpace(code));
      return token = 15 /* Trivia */;
    }
    if (isLineBreak(code)) {
      pos++;
      value += String.fromCharCode(code);
      if (code === 13 /* carriageReturn */ && text.charCodeAt(pos) === 10 /* lineFeed */) {
        pos++;
        value += `
`;
      }
      lineNumber++;
      tokenLineStartOffset = pos;
      return token = 14 /* LineBreakTrivia */;
    }
    switch (code) {
      case 123 /* openBrace */:
        pos++;
        return token = 1 /* OpenBraceToken */;
      case 125 /* closeBrace */:
        pos++;
        return token = 2 /* CloseBraceToken */;
      case 91 /* openBracket */:
        pos++;
        return token = 3 /* OpenBracketToken */;
      case 93 /* closeBracket */:
        pos++;
        return token = 4 /* CloseBracketToken */;
      case 58 /* colon */:
        pos++;
        return token = 6 /* ColonToken */;
      case 44 /* comma */:
        pos++;
        return token = 5 /* CommaToken */;
      case 34 /* doubleQuote */:
        pos++;
        value = scanString();
        return token = 10 /* StringLiteral */;
      case 47 /* slash */: {
        const start = pos - 1;
        if (text.charCodeAt(pos + 1) === 47 /* slash */) {
          pos += 2;
          while (pos < len) {
            if (isLineBreak(text.charCodeAt(pos))) {
              break;
            }
            pos++;
          }
          value = text.substring(start, pos);
          return token = 12 /* LineCommentTrivia */;
        }
        if (text.charCodeAt(pos + 1) === 42 /* asterisk */) {
          pos += 2;
          const safeLength = len - 1;
          let commentClosed = false;
          while (pos < safeLength) {
            const ch = text.charCodeAt(pos);
            if (ch === 42 /* asterisk */ && text.charCodeAt(pos + 1) === 47 /* slash */) {
              pos += 2;
              commentClosed = true;
              break;
            }
            pos++;
            if (isLineBreak(ch)) {
              if (ch === 13 /* carriageReturn */ && text.charCodeAt(pos) === 10 /* lineFeed */) {
                pos++;
              }
              lineNumber++;
              tokenLineStartOffset = pos;
            }
          }
          if (!commentClosed) {
            pos++;
            scanError = 1 /* UnexpectedEndOfComment */;
          }
          value = text.substring(start, pos);
          return token = 13 /* BlockCommentTrivia */;
        }
        value += String.fromCharCode(code);
        pos++;
        return token = 16 /* Unknown */;
      }
      case 45 /* minus */:
        value += String.fromCharCode(code);
        pos++;
        if (pos === len || !isDigit(text.charCodeAt(pos))) {
          return token = 16 /* Unknown */;
        }
      case 48 /* _0 */:
      case 49 /* _1 */:
      case 50 /* _2 */:
      case 51 /* _3 */:
      case 52 /* _4 */:
      case 53 /* _5 */:
      case 54 /* _6 */:
      case 55 /* _7 */:
      case 56 /* _8 */:
      case 57 /* _9 */:
        value += scanNumber();
        return token = 11 /* NumericLiteral */;
      default:
        while (pos < len && isUnknownContentCharacter(code)) {
          pos++;
          code = text.charCodeAt(pos);
        }
        if (tokenOffset !== pos) {
          value = text.substring(tokenOffset, pos);
          switch (value) {
            case "true":
              return token = 8 /* TrueKeyword */;
            case "false":
              return token = 9 /* FalseKeyword */;
            case "null":
              return token = 7 /* NullKeyword */;
          }
          return token = 16 /* Unknown */;
        }
        value += String.fromCharCode(code);
        pos++;
        return token = 16 /* Unknown */;
    }
  }
  function isUnknownContentCharacter(code) {
    if (isWhiteSpace(code) || isLineBreak(code)) {
      return false;
    }
    switch (code) {
      case 125 /* closeBrace */:
      case 93 /* closeBracket */:
      case 123 /* openBrace */:
      case 91 /* openBracket */:
      case 34 /* doubleQuote */:
      case 58 /* colon */:
      case 44 /* comma */:
      case 47 /* slash */:
        return false;
    }
    return true;
  }
  function scanNextNonTrivia() {
    let result;
    do {
      result = scanNext();
    } while (result >= 12 /* LineCommentTrivia */ && result <= 15 /* Trivia */);
    return result;
  }
  return {
    setPosition,
    getPosition: () => pos,
    scan: ignoreTrivia ? scanNextNonTrivia : scanNext,
    getToken: () => token,
    getTokenValue: () => value,
    getTokenOffset: () => tokenOffset,
    getTokenLength: () => pos - tokenOffset,
    getTokenStartLine: () => lineStartOffset,
    getTokenStartCharacter: () => tokenOffset - prevTokenLineStartOffset,
    getTokenError: () => scanError
  };
}
function isWhiteSpace(ch) {
  return ch === 32 /* space */ || ch === 9 /* tab */;
}
function isLineBreak(ch) {
  return ch === 10 /* lineFeed */ || ch === 13 /* carriageReturn */;
}
function isDigit(ch) {
  return ch >= 48 /* _0 */ && ch <= 57 /* _9 */;
}

// src/node-jsonc-parser/src/impl/string-intern.ts
var cachedSpaces = new Array(20).fill(0).map((_, index) => {
  return " ".repeat(index);
});
var maxCachedValues = 200;
var cachedBreakLinesWithSpaces = {
  " ": {
    "\n": new Array(maxCachedValues).fill(0).map((_, index) => {
      return `
` + " ".repeat(index);
    }),
    "\r": new Array(maxCachedValues).fill(0).map((_, index) => {
      return "\r" + " ".repeat(index);
    }),
    "\r\n": new Array(maxCachedValues).fill(0).map((_, index) => {
      return `\r
` + " ".repeat(index);
    })
  },
  "\t": {
    "\n": new Array(maxCachedValues).fill(0).map((_, index) => {
      return `
` + "\t".repeat(index);
    }),
    "\r": new Array(maxCachedValues).fill(0).map((_, index) => {
      return "\r" + "\t".repeat(index);
    }),
    "\r\n": new Array(maxCachedValues).fill(0).map((_, index) => {
      return `\r
` + "\t".repeat(index);
    })
  }
};

// src/node-jsonc-parser/src/impl/parser.ts
var ParseOptionsConfigs;
((ParseOptionsConfigs) => {
  ParseOptionsConfigs.DEFAULT = {
    allowTrailingComma: false
  };
})(ParseOptionsConfigs ||= {});
function parse(text, errors = [], options = ParseOptionsConfigs.DEFAULT) {
  let currentProperty = null;
  let currentParent = [];
  const previousParents = [];
  function onValue(value) {
    if (Array.isArray(currentParent)) {
      currentParent.push(value);
    } else if (currentProperty !== null) {
      currentParent[currentProperty] = value;
    }
  }
  const visitor = {
    onObjectBegin: () => {
      const object = {};
      onValue(object);
      previousParents.push(currentParent);
      currentParent = object;
      currentProperty = null;
    },
    onObjectProperty: (name) => {
      currentProperty = name;
    },
    onObjectEnd: () => {
      currentParent = previousParents.pop();
    },
    onArrayBegin: () => {
      const array = [];
      onValue(array);
      previousParents.push(currentParent);
      currentParent = array;
      currentProperty = null;
    },
    onArrayEnd: () => {
      currentParent = previousParents.pop();
    },
    onLiteralValue: onValue,
    onError: (error, offset, length, startLine, startCharacter) => {
      errors.push({ error, offset, length, startLine, startCharacter });
    }
  };
  visit(text, visitor, options);
  return currentParent[0];
}
function visit(text, visitor, options = ParseOptionsConfigs.DEFAULT) {
  const _scanner = createScanner(text, false);
  const _jsonPath = [];
  let suppressedCallbacks = 0;
  function toNoArgVisit(visitFunction) {
    return visitFunction ? () => suppressedCallbacks === 0 && visitFunction(_scanner.getTokenOffset(), _scanner.getTokenLength(), _scanner.getTokenStartLine(), _scanner.getTokenStartCharacter()) : () => true;
  }
  function toOneArgVisit(visitFunction) {
    return visitFunction ? (arg) => suppressedCallbacks === 0 && visitFunction(arg, _scanner.getTokenOffset(), _scanner.getTokenLength(), _scanner.getTokenStartLine(), _scanner.getTokenStartCharacter()) : () => true;
  }
  function toOneArgVisitWithPath(visitFunction) {
    return visitFunction ? (arg) => suppressedCallbacks === 0 && visitFunction(arg, _scanner.getTokenOffset(), _scanner.getTokenLength(), _scanner.getTokenStartLine(), _scanner.getTokenStartCharacter(), () => _jsonPath.slice()) : () => true;
  }
  function toBeginVisit(visitFunction) {
    return visitFunction ? () => {
      if (suppressedCallbacks > 0) {
        suppressedCallbacks++;
      } else {
        let cbReturn = visitFunction(_scanner.getTokenOffset(), _scanner.getTokenLength(), _scanner.getTokenStartLine(), _scanner.getTokenStartCharacter(), () => _jsonPath.slice());
        if (cbReturn === false) {
          suppressedCallbacks = 1;
        }
      }
    } : () => true;
  }
  function toEndVisit(visitFunction) {
    return visitFunction ? () => {
      if (suppressedCallbacks > 0) {
        suppressedCallbacks--;
      }
      if (suppressedCallbacks === 0) {
        visitFunction(_scanner.getTokenOffset(), _scanner.getTokenLength(), _scanner.getTokenStartLine(), _scanner.getTokenStartCharacter());
      }
    } : () => true;
  }
  const onObjectBegin = toBeginVisit(visitor.onObjectBegin), onObjectProperty = toOneArgVisitWithPath(visitor.onObjectProperty), onObjectEnd = toEndVisit(visitor.onObjectEnd), onArrayBegin = toBeginVisit(visitor.onArrayBegin), onArrayEnd = toEndVisit(visitor.onArrayEnd), onLiteralValue = toOneArgVisitWithPath(visitor.onLiteralValue), onSeparator = toOneArgVisit(visitor.onSeparator), onComment = toNoArgVisit(visitor.onComment), onError = toOneArgVisit(visitor.onError);
  const disallowComments = options && options.disallowComments;
  const allowTrailingComma = options && options.allowTrailingComma;
  function scanNext() {
    while (true) {
      const token = _scanner.scan();
      switch (_scanner.getTokenError()) {
        case 4 /* InvalidUnicode */:
          handleError(14 /* InvalidUnicode */);
          break;
        case 5 /* InvalidEscapeCharacter */:
          handleError(15 /* InvalidEscapeCharacter */);
          break;
        case 3 /* UnexpectedEndOfNumber */:
          handleError(13 /* UnexpectedEndOfNumber */);
          break;
        case 1 /* UnexpectedEndOfComment */:
          if (!disallowComments) {
            handleError(11 /* UnexpectedEndOfComment */);
          }
          break;
        case 2 /* UnexpectedEndOfString */:
          handleError(12 /* UnexpectedEndOfString */);
          break;
        case 6 /* InvalidCharacter */:
          handleError(16 /* InvalidCharacter */);
          break;
      }
      switch (token) {
        case 12 /* LineCommentTrivia */:
        case 13 /* BlockCommentTrivia */:
          if (disallowComments) {
            handleError(10 /* InvalidCommentToken */);
          } else {
            onComment();
          }
          break;
        case 16 /* Unknown */:
          handleError(1 /* InvalidSymbol */);
          break;
        case 15 /* Trivia */:
        case 14 /* LineBreakTrivia */:
          break;
        default:
          return token;
      }
    }
  }
  function handleError(error, skipUntilAfter = [], skipUntil = []) {
    onError(error);
    if (skipUntilAfter.length + skipUntil.length > 0) {
      let token = _scanner.getToken();
      while (token !== 17 /* EOF */) {
        if (skipUntilAfter.indexOf(token) !== -1) {
          scanNext();
          break;
        } else if (skipUntil.indexOf(token) !== -1) {
          break;
        }
        token = scanNext();
      }
    }
  }
  function parseString(isValue) {
    const value = _scanner.getTokenValue();
    if (isValue) {
      onLiteralValue(value);
    } else {
      onObjectProperty(value);
      _jsonPath.push(value);
    }
    scanNext();
    return true;
  }
  function parseLiteral() {
    switch (_scanner.getToken()) {
      case 11 /* NumericLiteral */:
        {
          const tokenValue = _scanner.getTokenValue();
          let value = Number(tokenValue);
          if (isNaN(value)) {
            handleError(2 /* InvalidNumberFormat */);
            value = 0;
          }
          onLiteralValue(value);
        }
        break;
      case 7 /* NullKeyword */:
        onLiteralValue(null);
        break;
      case 8 /* TrueKeyword */:
        onLiteralValue(true);
        break;
      case 9 /* FalseKeyword */:
        onLiteralValue(false);
        break;
      default:
        return false;
    }
    scanNext();
    return true;
  }
  function parseProperty() {
    if (_scanner.getToken() !== 10 /* StringLiteral */) {
      handleError(3 /* PropertyNameExpected */, [], [2 /* CloseBraceToken */, 5 /* CommaToken */]);
      return false;
    }
    parseString(false);
    if (_scanner.getToken() === 6 /* ColonToken */) {
      onSeparator(":");
      scanNext();
      if (!parseValue()) {
        handleError(4 /* ValueExpected */, [], [2 /* CloseBraceToken */, 5 /* CommaToken */]);
      }
    } else {
      handleError(5 /* ColonExpected */, [], [2 /* CloseBraceToken */, 5 /* CommaToken */]);
    }
    _jsonPath.pop();
    return true;
  }
  function parseObject() {
    onObjectBegin();
    scanNext();
    let needsComma = false;
    while (_scanner.getToken() !== 2 /* CloseBraceToken */ && _scanner.getToken() !== 17 /* EOF */) {
      if (_scanner.getToken() === 5 /* CommaToken */) {
        if (!needsComma) {
          handleError(4 /* ValueExpected */, [], []);
        }
        onSeparator(",");
        scanNext();
        if (_scanner.getToken() === 2 /* CloseBraceToken */ && allowTrailingComma) {
          break;
        }
      } else if (needsComma) {
        handleError(6 /* CommaExpected */, [], []);
      }
      if (!parseProperty()) {
        handleError(4 /* ValueExpected */, [], [2 /* CloseBraceToken */, 5 /* CommaToken */]);
      }
      needsComma = true;
    }
    onObjectEnd();
    if (_scanner.getToken() !== 2 /* CloseBraceToken */) {
      handleError(7 /* CloseBraceExpected */, [2 /* CloseBraceToken */], []);
    } else {
      scanNext();
    }
    return true;
  }
  function parseArray() {
    onArrayBegin();
    scanNext();
    let isFirstElement = true;
    let needsComma = false;
    while (_scanner.getToken() !== 4 /* CloseBracketToken */ && _scanner.getToken() !== 17 /* EOF */) {
      if (_scanner.getToken() === 5 /* CommaToken */) {
        if (!needsComma) {
          handleError(4 /* ValueExpected */, [], []);
        }
        onSeparator(",");
        scanNext();
        if (_scanner.getToken() === 4 /* CloseBracketToken */ && allowTrailingComma) {
          break;
        }
      } else if (needsComma) {
        handleError(6 /* CommaExpected */, [], []);
      }
      if (isFirstElement) {
        _jsonPath.push(0);
        isFirstElement = false;
      } else {
        _jsonPath[_jsonPath.length - 1]++;
      }
      if (!parseValue()) {
        handleError(4 /* ValueExpected */, [], [4 /* CloseBracketToken */, 5 /* CommaToken */]);
      }
      needsComma = true;
    }
    onArrayEnd();
    if (!isFirstElement) {
      _jsonPath.pop();
    }
    if (_scanner.getToken() !== 4 /* CloseBracketToken */) {
      handleError(8 /* CloseBracketExpected */, [4 /* CloseBracketToken */], []);
    } else {
      scanNext();
    }
    return true;
  }
  function parseValue() {
    switch (_scanner.getToken()) {
      case 3 /* OpenBracketToken */:
        return parseArray();
      case 1 /* OpenBraceToken */:
        return parseObject();
      case 10 /* StringLiteral */:
        return parseString(true);
      default:
        return parseLiteral();
    }
  }
  scanNext();
  if (_scanner.getToken() === 17 /* EOF */) {
    if (options.allowEmptyContent) {
      return true;
    }
    handleError(4 /* ValueExpected */, [], []);
    return false;
  }
  if (!parseValue()) {
    handleError(4 /* ValueExpected */, [], []);
    return false;
  }
  if (_scanner.getToken() !== 17 /* EOF */) {
    handleError(9 /* EndOfFileExpected */, [], []);
  }
  return true;
}

// src/node-jsonc-parser/src/main.ts
var parse2 = parse;

// src/parse.ts
function JSONC_Parse(text) {
  return parse2(text);
}
export {
  JSONC_Parse
};
