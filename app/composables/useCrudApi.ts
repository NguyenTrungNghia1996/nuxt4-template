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
    getByRest(id: string | number, options?: RequestOptions) {
      return request.get(`${endpoint}/${id}`, options ?? {});
    },
    post(options?: RequestOptions) {
      return request.post(endpoint, options ?? {});
    },
    postByRest(id: string | number, options?: RequestOptions) {
      return request.post(`${endpoint}/${id}`, options ?? {});
    },
    put(options?: RequestOptions) {
      return request.put(endpoint, options ?? {});
    },
    putByRest(id: string | number, options?: RequestOptions) {
      return request.put(`${endpoint}/${id}`, options ?? {});
    },
    patch(options?: RequestOptions) {
      return request.patch(endpoint, options ?? {});
    },
    patchByRest(id: string | number, options?: RequestOptions) {
      return request.patch(`${endpoint}/${id}`, options ?? {});
    },
    delete(options?: RequestOptions) {
      return request.delete(endpoint, options ?? {});
    },
    deleteByRest(id: string | number, options?: RequestOptions) {
      return request.delete(`${endpoint}/${id}`, options ?? {});
    },
  };
};
