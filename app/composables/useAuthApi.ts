import { Request } from "./useRequest";
export const useAuthApi = (endpoint: string) => {
  const request = new Request();

  type RequestOptions = {
    params?: Record<string, any>;
    body?: any;
    key?: string;
  };
  return {
    login(options?: RequestOptions) {
      return request.post(endpoint, options ?? {});
    },
  };
};
