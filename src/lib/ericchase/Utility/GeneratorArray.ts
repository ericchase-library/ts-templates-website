export function GeneratorArray<T>(generator: Generator<T>): T[] {
  const array = new Array<T>();
  let done = false;
  return new Proxy(array, {
    get(_, prop) {
      if (typeof prop === 'string' && Number.isNaN(Number(prop)) === false) {
        const index = Number(prop);
        while (done !== true && index >= array.length) {
          try {
            const next = generator.next();
            if (next.done !== true) {
              array.push(next.value);
            } else {
              done = true;
            }
          } catch (error) {
            done = true;
            throw error;
          }
        }
        return array[index];
      }
      if (prop === Symbol.iterator) {
        return function* () {
          for (let i = 0; i < array.length; i++) {
            yield array[i];
          }
          while (done !== true) {
            try {
              const next = generator.next();
              if (next.done !== true) {
                array.push(next.value);
                yield next.value;
              } else {
                done = true;
              }
            } catch (error) {
              done = true;
              throw error;
            }
          }
        };
      }
      return Reflect.get(array, prop);
    },
  });
}
