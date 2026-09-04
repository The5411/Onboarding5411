import { useState } from "react";
import { es } from "date-fns/locale";
import { formatDistanceToNow } from "date-fns";
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Copy,
  GripVertical,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { SlideImagesEditor } from "@/components/admin/SlideImagesEditor";
import type { DocSection } from "@/lib/onboarding/nav-tree";

// Editor puro (sin botón de guardar ni llamadas a Supabase) de una lista de
// tarjetas título+HTML. Lo usa `DocSectionsEditor` (que le agrega guardado)
// y `FlowStageEditor` (que guarda todo el contenido de la etapa junto). El
// orden de la lista ES el orden en que se ven las tarjetas en la app — no
// hay un campo "position" separado, así que reordenar es solo reordenar
// este array y guardar como siempre.
export function SectionListEditor({
  sections,
  onChange,
  addLabel = "Agregar tarjeta",
}: {
  sections: DocSection[];
  onChange: (sections: DocSection[]) => void;
  addLabel?: string;
}) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [query, setQuery] = useState("");
  const [dragId, setDragId] = useState<string | null>(null);

  const updateSection = (id: string, patch: Partial<DocSection>) => {
    onChange(
      sections.map((s) =>
        s.id === id ? { ...s, ...patch, updatedAt: new Date().toISOString() } : s,
      ),
    );
  };

  const addSection = () => {
    onChange([...sections, { id: crypto.randomUUID(), title: "Nueva sección", html: "<p></p>" }]);
  };

  const duplicateSection = (id: string) => {
    const index = sections.findIndex((s) => s.id === id);
    if (index === -1) return;
    const copy: DocSection = {
      ...sections[index],
      id: crypto.randomUUID(),
      title: `${sections[index].title} (copia)`,
      updatedAt: new Date().toISOString(),
    };
    onChange([...sections.slice(0, index + 1), copy, ...sections.slice(index + 1)]);
  };

  const removeSection = (id: string) => {
    if (!window.confirm("¿Borrar esta tarjeta?")) return;
    onChange(sections.filter((s) => s.id !== id));
  };

  const moveSection = (id: string, direction: -1 | 1) => {
    const index = sections.findIndex((s) => s.id === id);
    const targetIndex = index + direction;
    if (index === -1 || targetIndex < 0 || targetIndex >= sections.length) return;
    const next = [...sections];
    [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
    onChange(next);
  };

  const reorderByDrag = (draggedId: string, dropId: string) => {
    if (draggedId === dropId) return;
    const from = sections.findIndex((s) => s.id === draggedId);
    const to = sections.findIndex((s) => s.id === dropId);
    if (from === -1 || to === -1) return;
    const next = [...sections];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange(next);
  };

  const normalizedQuery = query.trim().toLowerCase();
  const visibleSections = normalizedQuery
    ? sections.filter((s) => s.title.toLowerCase().includes(normalizedQuery))
    : sections;

  return (
    <div className="space-y-4">
      {sections.length > 4 && (
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Buscar en ${sections.length} tarjetas...`}
            className="w-full rounded-lg border border-border bg-background py-2 pl-8 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      )}

      {visibleSections.map((section) => {
        const isCollapsed = collapsed[section.id] ?? false;
        return (
          <div
            key={section.id}
            draggable
            onDragStart={() => setDragId(section.id)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (dragId) reorderByDrag(dragId, section.id);
              setDragId(null);
            }}
            onDragEnd={() => setDragId(null)}
            className={`rounded-xl border border-border bg-card p-4 transition-opacity ${
              dragId === section.id ? "opacity-50" : ""
            }`}
          >
            <div className="mb-3 flex items-center gap-2">
              <span
                className="flex h-9 w-5 shrink-0 cursor-grab items-center justify-center text-muted-foreground active:cursor-grabbing"
                aria-hidden
              >
                <GripVertical className="h-4 w-4" />
              </span>
              <div className="flex flex-col">
                <button
                  type="button"
                  onClick={() => moveSection(section.id, -1)}
                  className="flex h-4 w-9 items-center justify-center rounded-t-md border border-b-0 border-border text-muted-foreground transition-colors hover:bg-secondary"
                  aria-label="Mover arriba"
                >
                  <ChevronUp className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => moveSection(section.id, 1)}
                  className="flex h-4 w-9 items-center justify-center rounded-b-md border border-border text-muted-foreground transition-colors hover:bg-secondary"
                  aria-label="Mover abajo"
                >
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
              </div>
              <input
                value={section.title}
                onChange={(e) => updateSection(section.id, { title: e.target.value })}
                className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm font-semibold outline-none focus:ring-2 focus:ring-ring"
                placeholder="Título de la tarjeta"
              />
              <button
                type="button"
                onClick={() =>
                  updateSection(section.id, {
                    accent: section.accent === "warning" ? undefined : "warning",
                  })
                }
                aria-pressed={section.accent === "warning"}
                title="Resaltar como punto crítico"
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-colors ${
                  section.accent === "warning"
                    ? "border-destructive/40 bg-destructive/10 text-destructive"
                    : "border-border text-muted-foreground hover:bg-secondary"
                }`}
              >
                <AlertTriangle className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => duplicateSection(section.id)}
                title="Duplicar tarjeta"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-secondary"
              >
                <Copy className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => removeSection(section.id)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border text-destructive transition-colors hover:bg-destructive/10"
                aria-label="Borrar tarjeta"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setCollapsed((prev) => ({ ...prev, [section.id]: !isCollapsed }))}
                title={isCollapsed ? "Expandir" : "Colapsar"}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-secondary"
              >
                {isCollapsed ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronUp className="h-4 w-4" />
                )}
              </button>
            </div>

            {section.updatedAt && (
              <p className="mb-2 text-[11px] text-muted-foreground">
                Editado{" "}
                {formatDistanceToNow(new Date(section.updatedAt), { addSuffix: true, locale: es })}
              </p>
            )}

            {!isCollapsed && (
              <>
                <RichTextEditor
                  html={section.html}
                  onChange={(html) => updateSection(section.id, { html })}
                />
                <div className="mt-3">
                  <SlideImagesEditor
                    images={section.images ?? []}
                    onChange={(images) =>
                      updateSection(section.id, { images: images.length > 0 ? images : undefined })
                    }
                  />
                </div>
              </>
            )}
          </div>
        );
      })}

      {normalizedQuery && visibleSections.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No hay tarjetas que coincidan con "{query}".
        </p>
      )}

      <button
        type="button"
        onClick={addSection}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary/40"
      >
        <Plus className="h-4 w-4" />
        {addLabel}
      </button>
    </div>
  );
}
