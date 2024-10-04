## 2024-10-04

**src/lib/ericchase**

- add more test cases
- add tests for public and private apis of library
- add new utility classes and functions
- replace Debouncer class with Debounce functions

**tools**

- update tools to use new Debounce functions
- rename hot_reload.ts to hotreload.ts

> **all module changes**

```
= Platform/Node/Path.ts
  - SanitizePath
  + SanitizeFileName

+ Utility/Assert.ts
  + AssertBigint
  + AssertBoolean
  + AssertFunction
  + AssertNumber
  + AssertObject
  + AssertString
  + AssertSymbol
  + AssertUndefined

= Utility/Console.ts
  - GetConsoleMark
  + GetConsoleMarker

= Utility/Debounce.ts
  - Debouncer
  + Debounce
  + ImmediateDebounce
  + LeadingEdgeDebounce

+ Utility/Defer.ts
  + Defer

+ Utility/HelpMessage.ts
  + HelpMessage

= Utility/TextCodec.ts
  - DecodeText
  + DecodeBytes

+ Utility/UpdateMarker.ts
  + UpdateMarker
  + UpdateMarkerManager
```

## 2024-10-02

- minor changes to template

**src/lib/ericchase**

- modify modules to utilize Path and PathGroup classes over strings
  - src/lib/ericchase/Platform/Bun/Fs.ts
  - src/lib/ericchase/Platform/Bun/Glob.ts
  - src/lib/ericchase/Platform/Node/HTML Processor/TemplateProcessor.ts
  - src/lib/ericchase/Platform/Node/Fs.ts
  - src/lib/ericchase/Platform/Node/Path.ts
  - src/lib/ericchase/Platform/Node/Watch.ts

**tools**

- modify tools to utilize Path and PathGroup classes over strings
- move `format.ts` script into `tools/lib`

> **all module changes**

```
+ Utility/Console.ts
  + ConsoleErrorWithDate
  + ConsoleLogWithDate
```

## 2024-09-30

**src/lib/ericchase**

- add more utilities
  - JSON utility functions
  - new Handler class
  - file running functions (needs better api)
  - stdin readers
  - menu and shell menu classes
  - PrepareHelpMessage function
  - assertion functions
  - string manipulation functions
  - console utility functions
  - GeneratorArray class

**tools**

- complete overhaul of the dev system
  - fix handling of the file modification cache
  - add locking system to prevent running different build scripts at the same time
  - add capability to interact with dev script, (`q` to quit and `r` to restart watcher, `b` for full rebuild)
  - many bug fixes

## 2024-09-19

- update packages

**dev_server**

- insignificant file movement
- update packages

**src**

- rename `server` to `dev_server` as `server` is a special api path for the actual dev server
- rename `server/server.ts` to `dev_server/server-data.ts`
- add `dev_server/hotreload.bundle.ts` to completely isolate hot reloading logic
- add script tag for `hotreload.bundle.ts` in `index.html`
- commented out database code for `index.bundle.ts`

**src/lib/ericchase**

- separate Glob (Bun) and Path (Node) utility into own files and into proper directories
  - Platform/Bun/Glob.ts
  - Platform/Node/Path.ts

**tools**

- update scripts to use new Glob and Path utility logic
- rewrite `build.ts` to use a step system for more control
- rename the html processor files
- add a file to isolate hot reloading logic
- update `dev.ts` to use new build step system and add logic for listening to keypresses

## 2024-09-16

- add specific versions for some packages
  - biome, node-html-parser, prettier

**src**

- move database drivers to lib
  - /lib/database-drivers/dbdriver-localhost.ts
- move database functions to own folder
  - /database/queries.module.ts

**tools**

- add prettier back in for formatting html/md files
  - /format.ts

## 2024-09-14

- switch from Prettier to Biome as formatter and linter
  - https://biomejs.dev/
- apply linter fixes everywhere
- update .gitignore and package.json

**src/lib/ericchase**

- fix PriorityQueue and BinaryHeap implementations with testing
  - /Abstract Data Type/
  - /Data Structure/
- remove DOM utility files around HTMLElements in favor of Node_Utility.ts
  - /Platform/Web/DOM/Element/\*
  - /Web API/Node_Utility.ts

**src**

- move server.ts to own folder
- move hot reloading code into own function

## 2024-09-13

**dev_server**

- add basic hot reloading!
- minor updates to route handlers

**src/lib/ericchase**

- fix potential bug with releasing stream locks
  - /Algorithm/Stream/
- add AsyncReader classes for ReadableStreams
  - /Algorithm/Stream/AsyncReader.ts
- add PathManager class for working with paths
  - /Platform/Bun/Path.ts
- rework PathGroup class to better handle extensions
- add tests for PathGroup and PathManager

**tools**

- add file cache to support incremental builds!
- add BuildRunner class for better bundling with Bun
- update html preprocessor system to use classes
- add new html preprocessor to change script tag src extensions
- rework build and dev scripts for cleaner more efficient flow
- change default sourcemap mode from inline to linked

will update this later if i missed anything

## 2024-09-11

**dev_database**

- add local developer database
- update server and website to use it

**src/lib/ericchase**

- add some utility for handling browser api compatability
  - /Web API/
- add utility for superior handling of dom nodes
  - /Web API/Node_Utility.ts
- rework the Store modules a bit
  - /Design Pattern/Observer/Store.ts>)

**tools**

- update debouncing module for better `bun run dev` experience
