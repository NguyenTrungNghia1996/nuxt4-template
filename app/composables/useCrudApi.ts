import { Request } from "./useRequest";

type RequestOptions = {
  params?: Record<string, any>;
  body?: any;
  key?: string;
};

export const useCrudApi = (endpoint: string) => {
  const request = new Request();

  return {
    get(options?: RequestOptions) {
      return request.get(endpoint, options ?? {});
    },
    post(options?: RequestOptions) {
      return request.post(endpoint, options ?? {});
    },
    put(options?: RequestOptions) {
      return request.put(endpoint, options ?? {});
    },
    patch(options?: RequestOptions) {
      return request.patch(endpoint, options ?? {});
    },
    delete(options?: RequestOptions) {
      return request.delete(endpoint, options ?? {});
    },
  };
};
