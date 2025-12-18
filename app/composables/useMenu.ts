const ROOT_PARENT_ID = "000000000000000000000000";

type RawMenuItem = {
  id?: string | number;
  _id?: string | number;
  title?: string;
  key?: string;
  url?: string;
  icon?: string;
  permission?: number | string;
  permissionBit?: number | string;
  stt?: number | string;
  parent_id?: string | number | null;
  parentId?: string | number | null;
  parent_Id?: string | number | null;
};

type MenuListResponse = {
  items?: RawMenuItem[];
  page?: number;
  limit?: number;
  total?: number;
};

type NormalizedMenuItem = {
  id: string;
  title: string;
  key: string;
  url: string;
  icon: string;
  permissionBit: number;
  stt: number;
  parent_Id: string | null;
};

export type MenuTreeItem = {
  title: string;
  key: string;
  url: string;
  icon: string;
  permissionBit: number;
  children: MenuTreeItem[];
  stt?: number;
};

const normalizeParentId = (parentId: unknown): string | null => {
  if (parentId === undefined || parentId === null || parentId === "" || parentId === ROOT_PARENT_ID) {
    return null;
  }
  return String(parentId);
};

const normalizeMenuItems = (items?: RawMenuItem[] | null): NormalizedMenuItem[] => {
  if (!Array.isArray(items)) return [];

  return items
    .map(item => {
      const permissionBit = Number(item?.permission ?? item?.permissionBit ?? 0);
      const stt = Number(item?.stt ?? 0);
      const id = item?.id ?? item?._id;
      if (!id) return null;

      return {
        id: String(id),
        title: item?.title || "",
        key: item?.key || "",
        url: item?.url || "",
        icon: item?.icon || "",
        permissionBit: Number.isFinite(permissionBit) ? permissionBit : 0,
        stt: Number.isFinite(stt) ? stt : 0,
        parent_Id: normalizeParentId(item?.parent_id ?? item?.parentId ?? item?.parent_Id),
      };
    })
    .filter(Boolean) as NormalizedMenuItem[];
};

export const useMenu = () => {
  const { superAdminMenu } = useApi();
  const settingStore = useSettingStore();

  const permissionMap = computed<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    for (const { key, permissionValue } of settingStore.menuPermissions) {
      map[key] = permissionValue;
    }
    return map;
  });

  const buildTree = (items: NormalizedMenuItem[]): MenuTreeItem[] => {
    if (!items.length) return [];

    const map = new Map<string, MenuTreeItem>();

    items.forEach(item => {
      map.set(item.id, {
        title: item.title,
        key: item.key,
        url: item.url,
        icon: item.icon,
        permissionBit: item.permissionBit,
        stt: item.stt ?? 0,
        children: [],
      });
    });

    items.forEach(item => {
      const parent = item.parent_Id ? map.get(item.parent_Id) : undefined;
      if (parent) {
        const current = map.get(item.id);
        if (current) parent.children.push(current);
      }
    });

    const sortTree = (nodes: MenuTreeItem[]) => {
      nodes.sort((a, b) => (a.stt ?? 0) - (b.stt ?? 0));
      nodes.forEach(n => sortTree(n.children));
    };

    const roots = items.filter(i => i.parent_Id === null).map(i => map.get(i.id)).filter(Boolean) as MenuTreeItem[];
    sortTree(roots);

    const stripStt = (nodes: MenuTreeItem[]) => {
      nodes.forEach(n => {
        delete n.stt;
        if (n.children.length) stripStt(n.children);
      });
    };
    stripStt(roots);
    return roots;
  };

  const filterMenu = (nodes: MenuTreeItem[], parentKey = "menu"): MenuTreeItem[] => {
    return nodes
      .map(node => {
        const permVal = permissionMap.value[parentKey] ?? 0;
        const permission = (permVal >> node.permissionBit) & 0b11;
        const children = node.children ? filterMenu(node.children, node.key) : [];
        if (permission > 0 || children.length > 0) {
          return { ...node, children };
        }
        return null;
      })
      .filter(Boolean) as MenuTreeItem[];
  };

  const loadMenu = async (): Promise<MenuTreeItem[]> => {
    try {
      const { data, error } = await superAdminMenu.get<MenuListResponse>({
        params: { page: 1, limit: 0, sort_order: "asc" },
      });

      if (error.value) throw error.value;
      if (data.value?.status !== "success") {
        throw new Error(data.value?.message || "Không thể tải menu");
      }

      const items = normalizeMenuItems(data.value?.data?.items);
      const tree = buildTree(items);
      settingStore.setMenu(tree);

      if (!items.length) {
        console.warn("Không có dữ liệu menu trả về");
      }

      return tree;
    } catch (e) {
      console.error("Failed to load menu", e);
      settingStore.setMenu([]);
      return [];
    }
  };

  const visibleMenu = computed<MenuTreeItem[]>(() => {
    const currentMenu = Array.isArray(settingStore.menu) ? (settingStore.menu as MenuTreeItem[]) : [];
    return filterMenu(currentMenu);
  });

  return { loadMenu, visibleMenu };
};
