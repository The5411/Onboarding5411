// Arma el árbol de navegación (tracks + items, anidados por parent_id) leyendo
// Supabase, y le mezcla encima los SPECIAL_ITEMS hardcodeados (hoy solo
// "Empleados", el Google Sheet). El resto de la app consume `useContentTree()`
// sin necesidad de saber qué parte vino de la base y qué parte es especial.
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import {
  ICON_MAP,
  SPECIAL_ITEMS,
  type ChecklistItem,
  type DirectoryColumn,
  type DirectoryDataSource,
  type DocSection,
  type FaqItem,
  type NavItem,
  type StageContent,
  type Track,
} from "@/lib/onboarding/nav-tree";

type DbView = "doc" | "directory" | "checklist" | "flow" | "stage";

// Unión de todas las formas posibles de `content` según `view` — un solo
// tipo compartido entre lo que llega de la base y lo que mandan los editores
// (updateNavItemContent), en vez de repetir la lista en los dos lugares.
export type NavItemContent = Partial<StageContent> & {
  sections?: DocSection[];
  dataSource?: DirectoryDataSource;
  items?: ChecklistItem[];
  intro?: DocSection[];
  faqs?: FaqItem[];
};

type DbNavItem = {
  id: string;
  track_id: string;
  parent_id: string | null;
  label: string;
  icon_name: string;
  view: DbView;
  layout: "flat" | "accordion" | null;
  content: NavItemContent;
  position: number;
};

type DbTrack = {
  id: string;
  label: string;
  icon_name: string;
  default_open: boolean;
  position: number;
};

function toNavItem(row: DbNavItem): NavItem {
  const icon = ICON_MAP[row.icon_name] ?? ICON_MAP.FileText;
  const base = { id: row.id, label: row.label, icon };

  if (row.view === "doc") {
    return {
      ...base,
      view: "doc",
      sections: row.content.sections ?? [],
      layout: row.layout ?? undefined,
    };
  }
  if (row.view === "directory") {
    return {
      ...base,
      view: "directory",
      dataSource: row.content.dataSource ?? { type: "static", columns: [], rows: [] },
    };
  }
  if (row.view === "flow") {
    return {
      ...base,
      view: "flow",
      intro: row.content.intro ?? [],
      faqs: row.content.faqs ?? [],
    };
  }
  if (row.view === "stage") {
    return {
      ...base,
      view: "stage",
      short: row.content.short ?? "",
      phaseVar: row.content.phaseVar ?? "--phase-1",
      objective: row.content.objective ?? "",
      responsible: row.content.responsible ?? "",
      adminSections: row.content.adminSections ?? [],
      warehouseSections: row.content.warehouseSections ?? [],
    };
  }
  return { ...base, view: "checklist", items: row.content.items ?? [] };
}

// Anida las filas de un track bajo su `parent_id` — un item con hijos gana
// `children`; sin hijos, queda igual que antes. Recursivo por si algún día
// hay más de un nivel, aunque hoy solo se usa uno (sección → subsección).
function buildItemTree(rows: DbNavItem[], parentId: string | null): NavItem[] {
  return rows
    .filter((row) => (row.parent_id ?? null) === parentId)
    .sort((a, b) => a.position - b.position)
    .map((row) => {
      const item = toNavItem(row);
      const children = buildItemTree(rows, row.id);
      return children.length > 0 ? { ...item, children } : item;
    });
}

async function fetchContentTree(): Promise<Track[]> {
  const [{ data: dbTracks, error: tracksError }, { data: dbItems, error: itemsError }] =
    await Promise.all([
      supabase.from("tracks").select("*").order("position"),
      supabase.from("nav_items").select("*").order("position"),
    ]);

  if (tracksError) throw tracksError;
  if (itemsError) throw itemsError;

  const allItems = (dbItems ?? []) as DbNavItem[];

  return (dbTracks ?? []).map((track: DbTrack) => {
    const trackRows = allItems.filter((row) => row.track_id === track.id);
    const topLevel = buildItemTree(trackRows, null).map((item) => ({
      position: trackRows.find((row) => row.id === item.id)!.position,
      item,
    }));

    const specials = SPECIAL_ITEMS.filter((special) => special.trackId === track.id);

    const items = [...topLevel, ...specials]
      .sort((a, b) => a.position - b.position)
      .map((entry) => entry.item);

    return {
      id: track.id,
      label: track.label,
      icon: ICON_MAP[track.icon_name] ?? ICON_MAP.FileText,
      defaultOpen: track.default_open,
      items,
    };
  });
}

export function useContentTree() {
  const query = useQuery({
    queryKey: ["content-tree"],
    queryFn: fetchContentTree,
  });

  return {
    tracks: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
  };
}

export function findNavItem(
  tracks: Track[],
  itemId: string,
): { track: Track; item: NavItem } | null {
  function search(items: NavItem[]): NavItem | null {
    for (const item of items) {
      if (item.id === itemId) return item;
      const found = item.children && search(item.children);
      if (found) return found;
    }
    return null;
  }
  for (const track of tracks) {
    const item = search(track.items);
    if (item) return { track, item };
  }
  return null;
}

// Solo para el panel de Editor. Las tablas tipo "sheet" (Google Sheets) no
// viven en la base, así que no aparecen para editar acá.
export function isEditableItem(item: NavItem): boolean {
  if (item.view === "directory" && item.dataSource.type === "sheet") return false;
  return true;
}

export async function updateNavItemContent(itemId: string, content: NavItemContent) {
  const { error } = await supabase.from("nav_items").update({ content }).eq("id", itemId);
  if (error) throw error;
}

// ── Estructura (crear/renombrar/borrar/reordenar secciones y subsecciones) ──
// Usado por NavStructureEditor. Es intencionalmente independiente del árbol
// anidado de arriba: acá se necesita el `position`/`parent_id` crudo de cada
// fila para poder reordenar, algo que NavItem no expone al resto de la app.

export type RawNavItem = {
  id: string;
  trackId: string;
  parentId: string | null;
  label: string;
  iconName: string;
  view: DbView;
  position: number;
};

type DbNavItemMeta = Pick<
  DbNavItem,
  "id" | "track_id" | "parent_id" | "label" | "icon_name" | "view" | "position"
>;

async function fetchRawNavItems(): Promise<RawNavItem[]> {
  const { data, error } = await supabase
    .from("nav_items")
    .select("id, track_id, parent_id, label, icon_name, view, position")
    .order("position");
  if (error) throw error;
  return (data ?? []).map((row: DbNavItemMeta) => ({
    id: row.id,
    trackId: row.track_id,
    parentId: row.parent_id,
    label: row.label,
    iconName: row.icon_name,
    view: row.view,
    position: row.position,
  }));
}

export function useNavStructure() {
  const query = useQuery({ queryKey: ["nav-items-raw"], queryFn: fetchRawNavItems });
  return { items: query.data ?? [], isLoading: query.isLoading };
}

// Tipos creables desde /admin. "flow" queda afuera a propósito — es
// específico de "Flujo operativo" (mapa + intro + FAQ), no un tipo genérico.
export type CreatableView = "doc" | "directory" | "checklist" | "stage";

export function defaultNavItemContent(
  view: CreatableView,
  directoryColumns: DirectoryColumn[] = [],
): NavItemContent {
  if (view === "doc") return { sections: [] };
  if (view === "checklist") return { items: [] };
  if (view === "stage") {
    return {
      short: "",
      phaseVar: "--phase-1",
      objective: "",
      responsible: "",
      adminSections: [],
      warehouseSections: [],
    };
  }
  return { dataSource: { type: "static", columns: directoryColumns, rows: [] } };
}

export async function createNavItem(input: {
  id: string;
  trackId: string;
  parentId: string | null;
  label: string;
  iconName: string;
  view: CreatableView;
  content: NavItemContent;
  position: number;
}) {
  const { error } = await supabase.from("nav_items").insert({
    id: input.id,
    track_id: input.trackId,
    parent_id: input.parentId,
    label: input.label,
    icon_name: input.iconName,
    view: input.view,
    content: input.content,
    position: input.position,
  });
  if (error) throw error;
}

export async function updateNavItemMeta(
  itemId: string,
  patch: { label?: string; iconName?: string },
) {
  const update: Record<string, string> = {};
  if (patch.label !== undefined) update.label = patch.label;
  if (patch.iconName !== undefined) update.icon_name = patch.iconName;
  const { error } = await supabase.from("nav_items").update(update).eq("id", itemId);
  if (error) throw error;
}

export async function deleteNavItem(itemId: string) {
  // El cascade de la FK parent_id se lleva las subsecciones de este item.
  const { error } = await supabase.from("nav_items").delete().eq("id", itemId);
  if (error) throw error;
}

export async function swapNavItemPositions(
  a: { id: string; position: number },
  b: { id: string; position: number },
) {
  const { error: errorA } = await supabase
    .from("nav_items")
    .update({ position: b.position })
    .eq("id", a.id);
  if (errorA) throw errorA;
  const { error: errorB } = await supabase
    .from("nav_items")
    .update({ position: a.position })
    .eq("id", b.id);
  if (errorB) throw errorB;
}
