// composables/useRequest.ts
import type { FetchContext, FetchResponse } from "ofetch";
import type { UseFetchOptions } from "#app";
import type { ApiResponse } from "@/types/api";

export class Request {
  private baseURL: string;

  constructor() {
    const unitStore = useUnitStore();
    const config = useRuntimeConfig();

    this.baseURL = unitStore.baseUrl || config.public.baseURL;
  }

  // =========================
  // HANDLERS CHUNG
  // =========================
  private handlers() {
    const userStore = useUserStore();

    return {
      onRequest(ctx: FetchContext) {
        if (userStore.token) {
          const headers = new Headers(ctx.options.headers);
          headers.set("Authorization", `Bearer ${userStore.token}`);
          ctx.options.headers = headers;
        }
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
