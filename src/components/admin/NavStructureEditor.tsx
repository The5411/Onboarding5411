import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronDown, ChevronUp, Pencil, Plus, Trash2 } from "lucide-react";
import {
  createNavItem,
  defaultNavItemContent,
  deleteNavItem,
  swapNavItemPositions,
  updateNavItemMeta,
  useNavStructure,
  type CreatableView,
  type RawNavItem,
} from "@/lib/onboarding/content.queries";
import { ICON_MAP, type DirectoryColumn, type Track } from "@/lib/onboarding/nav-tree";

const CREATABLE_VIEWS: { value: CreatableView; label: string }[] = [
  { value: "doc", label: "Documento (tarjetas)" },
  { value: "directory", label: "Tabla" },
  { value: "checklist", label: "Checklist" },
  { value: "stage", label: "Etapa (Administración / Warehouse)" },
];

function slugify(label: string): string {
  const slug = label
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "seccion";
}

// Panel de estructura: crear/renombrar/borrar/reordenar secciones y
// subsecciones de cualquier track, sin tocar código. Es independiente del
// editor de contenido (DocSectionsEditor y el resto) — acá se maneja
// `label`/`icon`/`view`/`parent_id`/`position`, no el `content` de cada item.
export function NavStructureEditor({ tracks }: { tracks: Track[] }) {
  const queryClient = useQueryClient();
  const { items, isLoading } = useNavStructure();

  const onChanged = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["content-tree"] }),
      queryClient.invalidateQueries({ queryKey: ["nav-items-raw"] }),
    ]);
  };

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Cargando estructura...</p>;
  }

  const existingIds = items.map((i) => i.id);

  return (
    <div className="space-y-10">
      {tracks.map((track) => (
        <TrackSection
          key={track.id}
          track={track}
          items={items.filter((i) => i.trackId === track.id)}
          existingIds={existingIds}
          onChanged={onChanged}
        />
      ))}
    </div>
  );
}

function TrackSection({
  track,
  items,
  existingIds,
  onChanged,
}: {
  track: Track;
  items: RawNavItem[];
  existingIds: string[];
  onChanged: () => Promise<void>;
}) {
  const [addingTop, setAddingTop] = useState(false);
  const topLevel = items.filter((i) => !i.parentId).sort((a, b) => a.position - b.position);

  return (
    <div>
      <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">
        {track.label}
      </h3>
      <div className="space-y-2">
        {topLevel.map((item, i) => (
          <ItemRow
            key={item.id}
            item={item}
            siblings={topLevel}
            index={i}
            allItems={items}
            existingIds={existingIds}
            onChanged={onChanged}
          />
        ))}
      </div>
      <div className="mt-2">
        {addingTop ? (
          <CreateItemForm
            trackId={track.id}
            parentId={null}
            nextPosition={(topLevel.at(-1)?.position ?? 0) + 1}
            existingIds={existingIds}
            onCreated={async () => {
              setAddingTop(false);
              await onChanged();
            }}
            onCancel={() => setAddingTop(false)}
          />
        ) : (
          <button
            type="button"
            onClick={() => setAddingTop(true)}
            className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            <Plus className="h-3.5 w-3.5" />
            Agregar sección
          </button>
        )}
      </div>
    </div>
  );
}

function ItemRow({
  item,
  siblings,
  index,
  allItems,
  existingIds,
  onChanged,
}: {
  item: RawNavItem;
  siblings: RawNavItem[];
  index: number;
  allItems: RawNavItem[];
  existingIds: string[];
  onChanged: () => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [label, setLabel] = useState(item.label);
  const [iconName, setIconName] = useState(item.iconName);
  const [addingChild, setAddingChild] = useState(false);
  const [busy, setBusy] = useState(false);

  const children = allItems
    .filter((i) => i.parentId === item.id)
    .sort((a, b) => a.position - b.position);

  const move = async (direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= siblings.length) return;
    setBusy(true);
    try {
      await swapNavItemPositions(item, siblings[targetIndex]);
      await onChanged();
    } finally {
      setBusy(false);
    }
  };

  const saveRename = async () => {
    setBusy(true);
    try {
      await updateNavItemMeta(item.id, { label, iconName });
      setEditing(false);
      await onChanged();
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    const warning = children.length > 0 ? ` (y sus ${children.length} subsección/es)` : "";
    if (!window.confirm(`¿Borrar "${item.label}"${warning}? No se puede deshacer.`)) return;
    setBusy(true);
    try {
      await deleteNavItem(item.id);
      await onChanged();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <div className="flex items-center gap-2">
        <div className="flex flex-col">
          <button
            type="button"
            onClick={() => move(-1)}
            disabled={index === 0 || busy}
            aria-label="Mover arriba"
            className="flex h-4 w-6 items-center justify-center text-muted-foreground hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronUp className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={() => move(1)}
            disabled={index === siblings.length - 1 || busy}
            aria-label="Mover abajo"
            className="flex h-4 w-6 items-center justify-center text-muted-foreground hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
        </div>

        {editing ? (
          <>
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="min-w-[120px] flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
            <select
              value={iconName}
              onChange={(e) => setIconName(e.target.value)}
              className="rounded-lg border border-border bg-background px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring"
            >
              {Object.keys(ICON_MAP).map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={saveRename}
              disabled={busy || !label.trim()}
              className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground disabled:opacity-50"
            >
              Guardar
            </button>
            <button
              type="button"
              onClick={() => {
                setEditing(false);
                setLabel(item.label);
                setIconName(item.iconName);
              }}
              className="text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              Cancelar
            </button>
          </>
        ) : (
          <>
            <span className="flex-1 truncate text-sm font-medium">{item.label}</span>
            <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold uppercase text-muted-foreground">
              {item.view}
            </span>
            <button
              type="button"
              onClick={() => setEditing(true)}
              aria-label="Renombrar"
              className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={remove}
              disabled={busy}
              aria-label="Borrar"
              className="flex h-7 w-7 items-center justify-center rounded-md text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </>
        )}
      </div>

      {children.length > 0 && (
        <div className="mt-2 ml-6 space-y-2 border-l border-border pl-3">
          {children.map((child, i) => (
            <ItemRow
              key={child.id}
              item={child}
              siblings={children}
              index={i}
              allItems={allItems}
              existingIds={existingIds}
              onChanged={onChanged}
            />
          ))}
        </div>
      )}

      <div className="mt-2 ml-6">
        {addingChild ? (
          <CreateItemForm
            trackId={item.trackId}
            parentId={item.id}
            nextPosition={(children.at(-1)?.position ?? 0) + 1}
            existingIds={existingIds}
            onCreated={async () => {
              setAddingChild(false);
              await onChanged();
            }}
            onCancel={() => setAddingChild(false)}
          />
        ) : (
          <button
            type="button"
            onClick={() => setAddingChild(true)}
            className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            <Plus className="h-3.5 w-3.5" />
            Agregar subsección
          </button>
        )}
      </div>
    </div>
  );
}

function CreateItemForm({
  trackId,
  parentId,
  nextPosition,
  existingIds,
  onCreated,
  onCancel,
}: {
  trackId: string;
  parentId: string | null;
  nextPosition: number;
  existingIds: string[];
  onCreated: () => Promise<void>;
  onCancel: () => void;
}) {
  const [label, setLabel] = useState("");
  const [iconName, setIconName] = useState("FileText");
  const [view, setView] = useState<CreatableView>("doc");
  const [columnsInput, setColumnsInput] = useState("");
  const [creating, setCreating] = useState(false);

  const create = async () => {
    if (!label.trim()) return;
    setCreating(true);
    try {
      const baseId = `${parentId ?? trackId}.${slugify(label)}`;
      let id = baseId;
      while (existingIds.includes(id)) {
        id = `${baseId}-${crypto.randomUUID().slice(0, 4)}`;
      }
      const columns: DirectoryColumn[] =
        view === "directory"
          ? columnsInput
              .split(",")
              .map((c) => c.trim())
              .filter(Boolean)
              .map((colLabel) => ({ key: slugify(colLabel).replace(/-/g, "_"), label: colLabel }))
          : [];
      await createNavItem({
        id,
        trackId,
        parentId,
        label: label.trim(),
        iconName,
        view,
        content: defaultNavItemContent(view, columns),
        position: nextPosition,
      });
      setLabel("");
      setColumnsInput("");
      await onCreated();
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-2 rounded-lg border border-dashed border-border p-3">
      <div className="flex flex-wrap gap-2">
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Nombre de la sección"
          className="min-w-[160px] flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
        <select
          value={iconName}
          onChange={(e) => setIconName(e.target.value)}
          className="rounded-lg border border-border bg-background px-2 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
        >
          {Object.keys(ICON_MAP).map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
        <select
          value={view}
          onChange={(e) => setView(e.target.value as CreatableView)}
          className="rounded-lg border border-border bg-background px-2 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
        >
          {CREATABLE_VIEWS.map((v) => (
            <option key={v.value} value={v.value}>
              {v.label}
            </option>
          ))}
        </select>
      </div>
      {view === "directory" && (
        <input
          value={columnsInput}
          onChange={(e) => setColumnsInput(e.target.value)}
          placeholder="Columnas separadas por coma (ej. marca, link sop, responsable)"
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
      )}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={create}
          disabled={creating || !label.trim()}
          className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground disabled:opacity-50"
        >
          {creating ? "Creando..." : "Crear"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
