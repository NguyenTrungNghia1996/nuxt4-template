// import { defineStore } from "pinia";
// export const useUserStore = defineStore(
//   "user",
//   {
//     state: () => ({
//       user: {},
//     }),
//     actions: {
//       setUser(value) {
//         this.user = value;
//       },
//       logout() {
//         this.user = {};
//       },
//     },
//     getters: {
//       token: state => {
//         return state.user?.token || null;
//       },
//       name: state => {
//         return state.user?.item?.hoten || null;
//       },
//       role: state => {
//         return state.user?.item?.username || null;
//       },
//     },
//     persist: {
//       // storage: piniaPluginPersistedstate.localStorage(),
//       storage: piniaPluginPersistedstate.cookies(),
//     },
//   },
//   {
//     persist: true,
//   },
// );
// stores/user.ts
export const useUserStore = defineStore(
  "user",
  () => {
    const user = ref<any>({});

    const setUser = (value: any) => {
      user.value = value;
    };

    const logout = () => {
      user.value = {};
    };

    const token = computed(() => user.value?.token || null);
    const name = computed(() => user.value?.item?.hoten || null);
    const role = computed(() => user.value?.item?.username || null);

    return {
      user,
      token,
      name,
      role,
      setUser,
      logout,
    };
  },
  {
    persist: {
      storage: piniaPluginPersistedstate.cookies(),
    },
  },
);
