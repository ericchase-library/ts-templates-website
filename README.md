## About

https://github.com/ericchase-library/ts-templates-website

This project houses the base website template project that I use to create new website projects.

## TypeScript Library and Template Project

For information about my TypeScript library and template projects, please visit:

- https://github.com/ericchase-library/ts-library
- https://github.com/ericchase-library/ts-template

## Disclaimer

This template may be updated from time to time.

## Developer Environment Setup

I generally recommend VSCode for web development.

**Install the Bun runtime**

- https://bun.sh/

**Install npm dependencies**

```
bun install
```

**Build the project**

For continuous building as you work:

```
bun run dev
```

For final builds:

```
bun run build
```

## Project Structure

### ./src/

This folder should contain _all_ of the source files of your project.

- Also read `NOTES.md` under `./src/lib/components/`.

`./src/lib/`

- This folder should contain library files and modules that your main source code depend on.
  - Library files are not intended to be updated often.

`./src/lib/ericchase/`

- This folder contains the TypeScript library I continuously develop.
  - The build tools depend on modules from this library.
  - You may use this library in your project as well.

### ./tools/

This folder contains the actual build tools that build the project.

- To customize the build process, modify `./tools/build.ts` as you see fit.
  - You can write your own file Processors or build Steps if needed.
  - There are example files under `./tools/lib/examples/` to help get you started.

### ./out/

This folder is produced during the normal build process and will contain the final compiled/bundled source code.

- This project produces a vanilla HTML, CSS, and JavaScript website.
- _You may modify the contents of this folder for testing and debugging purposes, but keep in mind that these files are overwritten during each build._

### ./server/

A local server for testing and debugging the final project files. Visit the repository at https://github.com/ericchase/tool--basic-web-server for more information about the server.

- You don't have to use this server. There are plenty of alternatives to choose from: Vite, VSCode Live Server, Webpack DevServer, etc.

## Copyright & License

**TL;DR:**

> This code is truly free and open source, licensed under the Apache 2.0 License. If you make a copy, _I humbly ask_ that you include the text from the `NOTICE` file somewhere in your project. **_You are not required to!_** You are also not required to include the original `LICENSE-APACHE` or `NOTICE` files, and I would prefer just a copy of the `NOTICE` file text or a link to this repository instead. You can use and modify this code however you like, including using a proprietary license for your changes. The only restriction I maintain is under clause 3 of the Apache 2.0 License regarding patents. If you find any potential license violations within any of my projects, please contact me so that I may resolve them.

A longer explanation can be found in the `README.md` file at https://github.com/ericchase-library/ts-library.
