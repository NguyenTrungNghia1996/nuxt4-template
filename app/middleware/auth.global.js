function getHostname() {
  const url = useRequestURL();
  const headers = useRequestHeaders() || {};
  const raw = headers["host"] || url.host || "";
  return (raw.split(",")[0] || "").trim().split(":")[0] || "";
}
export default defineNuxtRouteMiddleware(async to => {
  const userStore = useUserStore();
  const unitStore = useUnitStore();
  const hostname = getHostname();
  const sub = hostname.split(".")[0];
  unitStore.setSubdomain(sub);
  if (to.path === "/" || to.path === "/login" || to.path.startsWith("/test/")) return;
  // console.log(">>>>>>>>>>>>", userStore);
  // if (!userStore.token) {
  // }
  // return navigateTo("/login");
  return;
});
