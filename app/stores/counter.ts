import { defineStore } from "pinia";

export const useCounterStore = defineStore("counter", {
  state: () => ({
    count: 0,
    lastUpdated: "",
  }),
  getters: {
    doubleCount: (state) => state.count * 2,
  },
  actions: {
    setCount(value: number) {
      this.count = value;
      this.touch();
    },
    increment(step = 1) {
      this.count += step;
      this.touch();
    },
    decrement(step = 1) {
      this.count -= step;
      this.touch();
    },
    reset() {
      this.count = 0;
      this.lastUpdated = "";
    },
    touch() {
      this.lastUpdated = new Date().toISOString();
    },
  },
  persist: true,
});
