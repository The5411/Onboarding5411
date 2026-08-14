// Arma el árbol de navegación (tracks + items) leyendo Supabase, y le mezcla
// encima los SPECIAL_ITEMS hardcodeados (hoy solo "Empleados", el Google
// Sheet). El resto de la app consume `useContentTree()` sin necesidad de
// saber qué parte vino de la base y qué parte es especial.
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import {
  ICON_MAP,
  SPECIAL_ITEMS,
  type ChecklistItem,
  type DirectoryDataSource,
  type DocSection,
  type FaqItem,
  type FlowStage,
  type NavItem,
  type Track,
} from "@/lib/onboarding/nav-tree";

type DbTrack = {
  id: string;
  label: string;
  icon_name: string;
  default_open: boolean;
  position: number;
};

type DbNavItem = {
  id: string;
  track_id: string;
  label: string;
  icon_name: string;
  view: "doc" | "directory" | "checklist" | "flow";
  layout: "flat" | "accordion" | null;
  content: {
    sections?: DocSection[];
    dataSource?: DirectoryDataSource;
    items?: ChecklistItem[];
    stages?: FlowStage[];
    faqs?: FaqItem[];
  };
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
      stages: row.content.stages ?? [],
      faqs: row.content.faqs ?? [],
    };
  }
  return { ...base, view: "checklist", items: row.content.items ?? [] };
}

async function fetchContentTree(): Promise<Track[]> {
  const [{ data: dbTracks, error: tracksError }, { data: dbItems, error: itemsError }] =
    await Promise.all([
      supabase.from("tracks").select("*").order("position"),
      supabase.from("nav_items").select("*").order("position"),
    ]);

  if (tracksError) throw tracksError;
  if (itemsError) throw itemsError;

  return (dbTracks ?? []).map((track: DbTrack) => {
    const positioned = (dbItems ?? [])
      .filter((row: DbNavItem) => row.track_id === track.id)
      .map((row: DbNavItem) => ({ position: row.position, item: toNavItem(row) }));

    const specials = SPECIAL_ITEMS.filter((special) => special.trackId === track.id);

    const items = [...positioned, ...specials]
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
  for (const track of tracks) {
    const item = track.items.find((candidate) => candidate.id === itemId);
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

export async function updateNavItemContent(
  itemId: string,
  content: {
    sections?: DocSection[];
    dataSource?: DirectoryDataSource;
    items?: ChecklistItem[];
    stages?: FlowStage[];
    faqs?: FaqItem[];
  },
) {
  const { error } = await supabase.from("nav_items").update({ content }).eq("id", itemId);
  if (error) throw error;
}
