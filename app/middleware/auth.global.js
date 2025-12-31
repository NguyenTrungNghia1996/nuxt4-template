import { useJwt } from "@vueuse/integrations/useJwt";
import { getRequestDomainInfo } from "@/utils/domain";

export default defineNuxtRouteMiddleware(async to => {
  const isPublicRoute = to.path === "/login" || to.path.startsWith("/test/");
  const userStore = useUserStore();
  const unitStore = useUnitStore();
  const settingStore = useSettingStore();
  const { loadMenu } = useMenu();
  const { loadPermissions, setPermissions } = usePermissions();
  const { loadUnitInfo } = useUnitInfo();

  const { subdomain } = getRequestDomainInfo();
  unitStore.setSubdomain(subdomain);
  loadUnitInfo();
  const token = userStore.token;
  if (!token) {
    if (!isPublicRoute) return navigateTo("/login");
    return;
  }
  try {
    const { payload } = useJwt(token);
    const exp = payload.value && payload.value.exp;
    const isTokenValid = typeof exp === "number" && Date.now() / 1000 < exp;
    if (!isTokenValid) {
      userStore.logout();
      if (!isPublicRoute) return navigateTo("/login");
      return;
    }
    const tasks = [];
    if (!settingStore.menu?.length) tasks.push(loadMenu());
    if (!settingStore.menuPermissions?.length) tasks.push(loadPermissions());
    if (tasks.length) await Promise.all(tasks);

    if (typeof setPermissions === "function" && settingStore.menuPermissions?.length) {
      setPermissions(settingStore.menuPermissions);
    }
  } catch (e) {
    const message = e?.message || e?.data?.message || e?.toString();
    console.error("[auth.middleware] unexpected error:", message);
  }
  if (to.path === "/" || to.path === "/login" || to.path.startsWith("/test/")) return;
  // console.log(">>>>>>>>>>>>", userStore);
  // if (!userStore.token) {
  // }
  // return navigateTo("/login");
  return;
});
