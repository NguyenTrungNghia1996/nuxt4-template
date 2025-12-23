import type { ApiResponse } from "@/types/api";
import { Request } from "./useRequest";

type PresignedPayload = {
  filename: string;
  filetype: string;
};

type PresignedData = {
  expires_in: number;
  headers: Record<string, string>;
  key: string;
  method: "PUT";
  public_url: string;
  url: string;
};

export const useS3Upload = (endpoint: string) => {
  const request = new Request();

  const getPresignedUrl = async (payload: PresignedPayload): Promise<PresignedData> => {
    const { data, error } = await request.put<PresignedData>(endpoint, {
      body: payload,
    });

    if (error.value) throw error.value;
    if (!data.value || data.value.status !== "success") {
      throw new Error(data.value?.message);
    }

    return data.value.data;
  };

  const upload = async (file: File): Promise<string> => {
    const presigned = await getPresignedUrl({
      filename: file.name,
      filetype: file.type,
    });

    await $fetch(presigned.url, {
      method: "PUT",
      // headers: presigned.headers,
      body: file,
    });

    return presigned.public_url;
  };

  return { upload };
};
