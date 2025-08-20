/**
 * Attempts to determine the actual server host that a script has been served
 * from. This works for both modules and classic scripts when processed with my
 * build tools. Generally, only scripts that are actively served from a running
 * server will be able to determine the server host. If the script is not
 * actively being served, the return value will likely be the host of the
 * current page
 */
export function SERVERHOST() {
  const CheckENV = () => {
    try {
      return process.env.SERVERHOST;
    } catch {}
  };
  const CheckCurrentScript = () => {
    try {
      // @ts-ignore
      return new URL(document.currentScript.src).host;
    } catch {}
  };
  const CheckMetaUrl = () => {
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
  };
  const CheckError = () => {
    try {
      return new URL((new Error() as any).fileName).host;
    } catch {}
  };
  return CheckENV() ?? CheckCurrentScript() ?? CheckMetaUrl() ?? CheckError() ?? window.location.host;
}
