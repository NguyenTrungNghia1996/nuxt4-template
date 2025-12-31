// composables/useRequest.ts
import { useJwt } from "@vueuse/integrations/useJwt";
import type { FetchContext, FetchResponse } from "ofetch";
import type { UseFetchOptions } from "#app";
import type { ApiResponse } from "@/types/api";

export class Request {
  private baseURL: string;

  constructor() {
    const unitStore = useUnitStore();
    const config = useRuntimeConfig();

    this.baseURL = config.public.baseURL;
  }

  private isTokenValid(token: string) {
    const { payload } = useJwt(token);
    const exp = payload.value?.exp;
    const expTime = typeof exp === "string" ? Number(exp) : exp;

    return typeof expTime === "number" && Date.now() / 1000 < expTime;
  }

  // =========================
  // HANDLERS CHUNG
  // =========================
  private handlers() {
    const userStore = useUserStore();

    return {
      onRequest: (ctx: FetchContext) => {
        const token = userStore.token;

        if (!token) return;

        const isValid = this.isTokenValid(token);
        if (!isValid) {
          message.info("Phiên đăng nhập đã hết hạn");
          userStore.logout();
          navigateTo("/login");
          return;
        }

        const headers = new Headers(ctx.options.headers);
        headers.set("Authorization", `Bearer ${token}`);
        ctx.options.headers = headers;
      },

      onResponse(ctx: { response: FetchResponse<ApiResponse<any>> }) {
        return ctx.response._data;
      },

      async onResponseError(ctx: { response: FetchResponse<ApiResponse<any>> }) {
        if (ctx.response.status === 401) {
          message.info("Phiên đăng nhập đã hết hạn");
          userStore.logout();
          await navigateTo("/login");
        }

        return ctx.response._data;
      },
    };
  }

  // =========================
  // REQUEST GỐC (TYPED)
  // =========================
  request<T>(url: string, options: UseFetchOptions<ApiResponse<T>> = {}) {
    return useFetch<ApiResponse<T>>(url, {
      baseURL: this.baseURL,
      ...options,
      ...this.handlers(),
    });
  }

  // =========================
  // METHODS (FIXED METHOD TYPE)
  // =========================
  get<T>(url: string, options?: UseFetchOptions<ApiResponse<T>>) {
    return this.request<T>(url, {
      method: "GET",
      ...options,
    });
  }

  post<T>(url: string, options?: UseFetchOptions<ApiResponse<T>>) {
    return this.request<T>(url, {
      method: "POST",
      ...options,
    });
  }

  put<T>(url: string, options?: UseFetchOptions<ApiResponse<T>>) {
    return this.request<T>(url, {
      method: "PUT",
      ...options,
    });
  }

  patch<T>(url: string, options?: UseFetchOptions<ApiResponse<T>>) {
    return this.request<T>(url, {
      method: "PATCH",
      ...options,
    });
  }

  delete<T>(url: string, options?: UseFetchOptions<ApiResponse<T>>) {
    return this.request<T>(url, {
      method: "DELETE",
      ...options,
    });
  }
}
