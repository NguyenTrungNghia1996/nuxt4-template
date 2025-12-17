import { customAlphabet } from "nanoid";

export default defineNuxtPlugin(NuxtApp => {
  const nanoid = customAlphabet("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ", 10);
  return {
    provide: {
      RANDOMID: () => nanoid(),
    },
  };
});
