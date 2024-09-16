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
