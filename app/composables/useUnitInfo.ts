import type { ApiResponse } from "@/types/api";
import { useUnitStore, type UnitInfo, SUPER_ADMIN_UNIT } from "../stores/unitStore";

type UnitInfoResponse = ApiResponse<UnitInfo | { unit?: UnitInfo }>;

const normalizeUnitInfo = (payload: unknown): UnitInfo | null => {
  if (!payload || typeof payload !== "object") return null;
  const unit = (payload as { unit?: UnitInfo }).unit ?? (payload as UnitInfo);
  return unit && typeof unit === "object" ? (unit as UnitInfo) : null;
};

export const useUnitInfo = () => {
  const { unitInfo } = useApi();
  const unitStore = useUnitStore();

  const loadUnitInfo = async (subdomain?: string): Promise<UnitInfo | null> => {
    const targetSubdomain = (subdomain ?? unitStore.subdomain ?? "").trim();
    if (!targetSubdomain) {
      console.warn("Thiếu subdomain khi gọi loadUnitInfo");
      unitStore.clearUnit();
      return null;
    }

    if (targetSubdomain === "sa") {
      unitStore.setSubdomain("sa");
      unitStore.setUnit(SUPER_ADMIN_UNIT);
      return SUPER_ADMIN_UNIT;
    }

    try {
      const { data, error } = await unitInfo.get({
        params: { subdomain: targetSubdomain },
      });

      if (error.value) throw error.value;

      const response = data.value as UnitInfoResponse | undefined;
      if (!response || response.status !== "success") {
        throw new Error(response?.message || "Không thể tải thông tin đơn vị");
      }

      const info = normalizeUnitInfo(response.data);
      if (!info) {
        unitStore.clearUnit();
        return null;
      }

      unitStore.setUnit(info);
      if (!unitStore.subdomain && info.subdomain) {
        unitStore.setSubdomain(info.subdomain);
      }

      return info;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("loadUnitInfo error:", message);
      unitStore.clearUnit();
      return null;
    }
  };

  return { loadUnitInfo };
};
