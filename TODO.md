2025-05-04

- ~~there is a race condition between files in the same dependency graph~~
- ~~rewrite `runProcessorList` waitlist so that we can see exactly which files are being awaited, exactly when they are fullfilled, and print the contents of each file before the target file gets processed~~
- ~~hypothesis: when files are processed, their upstream can change, but the defer map does not get updated~~
- couldn't figure out why, decided to use while loop and continuously check if upstream files were finished
- will optimize this at a later date
