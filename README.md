## About

https://github.com/ericchase-library/ts-templates-website

This is a template for website projects. Please check out https://github.com/ericchase-library/ts-library for other information.

## Build Tools V2

This template project uses the new 2.0 version of my build tools and library modules. Read more about that in the ts-library repo.

## Disclaimer

This template might be updated from time to time. If/when that happens, I will try to maintain a changelog.

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

**Lint the source code**

```
bun run lint
```

## Project Structure

### ./src/

This folder contains _all_ of the files that are needed to build the website.

`*.html`

- During builds, `*.html` files are processed to replace tags that look like custom elements from Web Components api by replacing them with the contents of files from `./src/lib/components/` that have a filename matching the tag name. You can still use custom elements and Web Components.

`./src/lib/`

- This folder should contain library files and modules that your main source code depend on.
  - If you use the HTMLCustomComponent processor, component files should be placed under `./src/lib/components`.

`./src/lib/ericchase/`

- This folder contains my TypeScript library files and modules, which are used by the build tools. You can make use of these files for your project, as well.

### ./tools/

This folder contains the build tool files and scripts.

- To build or modify a project, update the `./tools/build.ts` file as you see fit.

### ./out/

This folder is produced during the normal build process and will contain the final compiled/bundled source code.

For this project, a final vanilla HTML, CSS, and JavaScript website is produced, along with a copy of any media files. _Any modification to the contents of this folder will be overwritten during the next build._

### ./server/

A local dev server for testing various kinds of projects that utilize a server. The server folder is a separate project with its own repository (https://github.com/ericchase/tool--basic-web-server) that I maintain and update. You could use a different dev server provided by another tool like Vite, or even the VSCode Live Server extension. I prefer writing the server myself, so that's why I include it.

## Copyright & License

**TL;DR:**

> This code is truly free and open source, licensed under the Apache 2.0 License. If you make a copy, **I humbly ask** that you include the text from the `NOTICE` file somewhere in your project. **_You are not required to!_** You are also not required to include the original `LICENSE-APACHE` or `NOTICE` files, and I would prefer just a copy of the `NOTICE` file text or a link to this repository instead. You can use and modify this code however you like, including using a proprietary license for your changes. The only restriction I maintain is under clause 3 of the Apache 2.0 License regarding patents. If you find any potential license violations, please contact me so that I may resolve them.

---

**Full Disclosure**

- _mission_

The code in this repository will always be truly free and open source (unless I myself have somehow violated an upstream copyright license, in which case I will gladly try to resolve any issues in a timely manner; please email me about any potential license violations you find).

- _please leave a trail_

When making a copy of this project, I _kindly ask_ that you include the text within the `NOTICE` file somewhere (perhaps in your own README.md or LICENSE or NOTICE file?) or a link to this repository so that other users of your project may also be able to find this original template.

```
Typescript Library
https://github.com/ericchase-library/ts-library

Copyright © 2025 ericchase

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```

- _your usage of this source code_

That said, this license and copyright notice **DOES NOT** restrict your usage of this template in any way, except for the terms and conditions under clause 3 of the Apache 2.0 License regarding patents: `3. Grant of Patent License.` As you may or may not know, every piece of work is automatically protected and restricted by **copyright** law. The purpose of a **license** is to "unrestrict" the copyright owner's protections under that law, granting others access to use their work. The **patent system**, on the other hand, is a system for **applying restrictions** to the implementation of ideas. Specifically:

> A patent is a type of intellectual property that gives its owner the legal right to exclude others from making, using, or selling an invention for a limited period of time in exchange for publishing an enabling disclosure of the invention. - https://en.wikipedia.org/wiki/Patent

- _patent law_

I don't know enough about patent law to know if this could ever become an issue, but I would rather be safe than sorry. What I do know is that copyright law and patent law are completely separate issues, and copyright law does not protect your work from patents (AFAIK). The Apache 2.0 License does its best to provide some protections from patents of derivative works, which is why I use it for my projects.

- _other terms and conditions_

To reiterate, I hereby informally waive the other terms and conditions under the Apache 2.0 License. You are not required to include the original `LICENSE-APACHE` or `NOTICE` files or text in your derivative work.

- _your derivative works_

As for your own projects, any new additions and/or modifications you make **ARE NOT** subject to my license and copyright notice. You do not need to mention additions and/or modifications to the original source code. You will need to apply your own license and copyright notices if you wish to make your project code open source. If you wish to keep your source code private, you may do so. You may use a proprietary and/or closed source license if you wish. All of this is entirely up to you.

_This is what it means to be truly free and open source._
