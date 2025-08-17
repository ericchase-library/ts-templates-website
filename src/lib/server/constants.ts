export const SERVERHOST = CheckENV() ?? CheckCurrentScript() ?? CheckMetaUrl() ?? CheckError() ?? window.location.host;

function CheckENV() {
  try {
    return process.env.SERVERHOST;
  } catch {}
}

function CheckCurrentScript() {
  try {
    // @ts-ignore
    return new URL(document.currentScript.src).host;
  } catch {}
}

function CheckMetaUrl() {
  try {
    /**
     * References to `import` are not allowed in non-module scripts. Doing so
     * is considered a syntax error and cannot be caught. The script will
     * indiscriminately be halted.
     *
     * For that reason, the `Processor_TypeScript_Generic_Bundler` processor
     * will replace `import.meta.url` with `undefined` during IIFE mode. All
     * other references to `import` will be left untouched, and will result in
     * the uncatchable syntax error, as expected. I've made this exception so
     * that scripts can semi-reliably determine their origin host at runtime.
     */
    return new URL(import.meta.url).host;
  } catch {}
}

function CheckError() {
  try {
    return new URL((new Error() as any).fileName).host;
  } catch {}
}
