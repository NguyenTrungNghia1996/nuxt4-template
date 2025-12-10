let ENDPOINTS = {
  LOGIN: "/api/users/login",
  S3: "/api/presigned_url",
};
import { useUserStore } from "@/stores/userStore";
import { useUnitStore } from "@/stores/unitStore";
class Request {
  constructor() {
    this.handler = {
      onRequest({ request, options }) {},
      onRequestError({ request, options, error }) {},
      onResponse({ request, response, options }) {
        return response._data;
      },
      async onResponseError({ request, response, options }) {
        if (response.status == 401) {
          message.info("Phiên Đăng Nhập Kết Thúc Vui Lòng Đăng Nhập Lại! ");
          const userStore = useUserStore();
          userStore.logout();
          return await navigateTo("/auth/login");
        }

        return response._data;
      },
    };
    const unitStore = useUnitStore();
    // this.base_url = useRuntimeConfig().public.baseURL;
    this.base_url = unitStore.baseUrl;
  }

  createHeaders() {
    const userStore = useUserStore();
    return {
      "Content-type": "application/json; charset=UTF-8",
      Authorization: `Bearer ${userStore.token}`,
    };
  }

  get(url, options) {
    return useFetch(url, {
      baseURL: this.base_url,
      method: "GET",
      headers: this.createHeaders(),
      ...options,
      ...this.handler,
    });
  }
  post(url, options) {
    return useFetch(url, {
      baseURL: this.base_url,
      method: "POST",
      headers: this.createHeaders(),
      ...options,
      ...this.handler,
    });
  }
  // POST multipart/form-data (for file uploads). Do not set Content-Type so browser sets boundary
  postForm(url, options) {
    const userStore = useUserStore();
    const headers = {
      Authorization: `Bearer ${userStore.token}`,
    };
    return useFetch(url, {
      baseURL: this.base_url,
      method: "POST",
      headers,
      ...options,
      ...this.handler,
    });
  }
  patch(url, options) {
    return useFetch(url, {
      baseURL: this.base_url,
      method: "PATCH",
      headers: this.createHeaders(),
      ...options,
      ...this.handler,
    });
  }
  put(url, options) {
    return useFetch(url, {
      baseURL: this.base_url,
      method: "PUT",
      headers: this.createHeaders(),
      ...options,
      ...this.handler,
    });
  }
  delete(url, options) {
    return useFetch(url, {
      baseURL: this.base_url,
      method: "DELETE",
      headers: this.createHeaders(),
      ...options,
      ...this.handler,
    });
  }

  download(url, options) {
    const { onRequest, onRequestError, onResponseError } = this.handler;
    return useFetch(url, {
      baseURL: this.base_url,
      method: "GET",
      headers: this.createHeaders(),
      responseType: "blob",
      onRequest,
      onRequestError,
      onResponseError,
      onResponse({ response }) {
        const headers = Object.fromEntries(response.headers);
        const blob = response._data instanceof Blob ? response._data : new Blob([response._data]);
        response._data = { blob, headers };
      },
      ...options,
    });
  }
}
class RestApi {
  constructor() {
    this.request = new Request();
    this.user = new User(this.request);
  }
  async get_url_upload(acl, content_encoding, content_type, key, platform) {
    let data = { acl, content_encoding, content_type, key, platform };
    return this.request.put(ENDPOINTS.S3, { body: data });
  }
  async upload_s3(
    key,
    data,
    { acl, encoding, content_type, bucket } = {
      acl: "public-read",
      encoding: "base64",
      content_type: "image/jpeg",
      bucket: "website",
    },
  ) {
    const { data: resp } = await this.get_url_upload(acl, encoding, content_type, key, bucket);
    const url = resp.value?.data.upload_url;
    const direct_url = resp.value?.data.direct_url;
    if (!url || !direct_url) throw Error("presigned error");
    let buf;
    switch (encoding) {
      case "base64":
        // buf = Buffer.from(data.replace(/^data:image\/\w+;base64,/, ""), "base64")
        buf = _base64ToArrayBuffer(data.replace(/^data:image\/\w+;base64,/, ""));
        break;
      case "blob":
        buf = data;
        break;
      default:
        throw new Error("Invalid encoding");
    }
    await useFetch(url, {
      method: "PUT",
      headers: {
        Authorization: "",
        "x-amz-acl": acl || "public-read",
        "Content-Encoding": encoding,
        "Content-Type": content_type,
        "Access-Control-Allow-Origin": "*",
      },
      body: buf,
    });
    return direct_url;
  }
}
export default () => {
  return { RestApi: new RestApi() };
};

class User {
  constructor() {
    this.request = new Request();
  }
  async login(data) {
    return await this.request.post(ENDPOINTS.LOGIN, data);
  }
}
