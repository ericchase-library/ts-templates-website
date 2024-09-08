## About

https://github.com/ericchase-library/ts-templates-website

This is a template for website projects. It is not fully complete, but it should be a good start (I am using and updating it myself).

It relies on the TypeScript library in this organization.

- https://github.com/ericchase-library/ts-library

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

For one off builds:

```
bun run build
```

**Format the source code**

```
bun run format
```

## Project Structure

### ./src/

This folder contains _all_ of the files that are needed to build the website.

`*.html`

- During builds, `*.html` files are processed to replace tags that look like custom elements from Web Components api by replacing them with the contents of files from `./src/components/` that have the same name. You can still use custom elements and Web Components; just don't reuse the same names.

`./src/lib/`

- This folder exclusively contains TypeScript libraries and modules. This folder is ignored during the copy stage of the build process, so don't bother adding anything other than `*.ts` files here.
- You could modify the build scripts `./tools/build.ts` to also handle `*.js` if you want, but there really isn't a reason to do so unless you want to make use of JavaScript libraries.

### ./build/

This folder is produced during the build process and contains the final compiled source code.

For this project, a final vanilla HTML, CSS, and JavaScript website is produced, along with a copy of any media files. _Any modification to the contents of this folder will be overwritten during the next build._

Since the files in this folder are vanilla, you can quickly make temporary modifications like _hotfixes_ to the website without having to rebuild the project. This folder is tracked by git by default and will be pushed to the remote repository. Any modications to the folder contents **will** be marked and included as a change when committing and pushing, so your repository will contain a history of temporary modifications for future reference.

If you do make any modifications to the contents of this folder, please make sure to apply those changes to the actual source files later.

### ./tools/

This folder contains the scripts we use to automate work flows, like:

- building source code into a website, browser extension, or command line application;
- performing some kind of maintenance on project files;
- and even other operations like:
  - opening all the source files in your project (`./tools/open-all-source-files.ts`);
  - re-installing all the npm packages in your package.json file (`./tools/re-install-packages.ts`)

You can literally do anything you want, which is the point of this library. These scripts should be easy to read, easy to write, and easy to modify. The goal isn't to produce a complete packaged build tool like Gulp, Grunt, Webpack, Makefile, etc. You can use those tools as well! The main idea here is to get away from writing clumsy npm scripts in package.json that rely on other packaged tools.

**Note:**

The scripts under `./tools/` also use modules from this library (from `./src/`). To reiterate, the goal of these scripts is not to produce a package; though, you can do that if you want to! For new projects, you would ideally copy the library files from `./src/` (or `./src-stripped` if you don't want the test files and example) into your project's `./src/lib/ericchase/` folder (you can use `ericchase` to distinguish that the folder is from this library, or choose whatever folder name you want), then update the import statements in your project's copy of `./tools/` to match the new location. This is already done for you in the various `ts-templates-` repositories.

### ./local_server/

A local web server for testing the website. It is configured to serve files from the `./build/` folder and works like a typical web server.

Generally, you would use the VSCode **Live Server** extension during development process, as it is able to refresh pages automatically. I haven't created a feature like this for the local server, and I'm not sure I will, since Live Server exists and works well for that use case.

- ritwickdey.LiveServer
  - https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer
- yandeu.five-server
  - https://marketplace.visualstudio.com/items?itemName=yandeu.five-server
  - I don't recommend using this similar extension. It is not a drop-in replacement for Live Server. To use it efficiently, you would need to write a configuration file for each project (as far as I can see).

### ./

I've modified these files to work well with website projects. Please read over them to familiarize yourself with the configurations.

- .gitignore
- .prettierignore
- .prettierrc
- package.json

## Copyright & License

**TL;DR:**

> This code is truly free and open source, licensed under the Apache 2.0 License. If you make a copy, **I humbly ask** that you include the text from the `NOTICE` file somewhere in your project. **_You are not required to!_** You are also not required to include the original `LICENSE-APACHE` or `NOTICE` files, and I would prefer just a copy of the `NOTICE` file text or a link to this repository instead. You can use and modify this code however you like, including using a proprietary license for your changes. The only restriction I maintain is under clause 3 of the Apache 2.0 License regarding patents. If you find any potential license violations, please contact me so that I may resolve them.

---

**Full Disclosure**

- _mission_

The code in this repository will always be truly free and open source (unless I myself have somehow violated an upstream copyright license, in which case I will gladly try to resolve any issues in a timely manner; please email me about any potential license violations you find).

- _please leave a trail_

When making a copy of this project, I _kindly ask_ that you include the text within the `NOTICE` file somewhere (perhaps in your own README.md or LICENSE or NOTICE file?) or a link to this repository so that other readers of your project may also be able to find this original template.

```
Typescript Template Website
https://github.com/ericchase-library/ts-templates-website

Copyright © 2024 ericchase

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
