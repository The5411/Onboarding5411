import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
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
  const updateSection = (id: string, patch: Partial<DocSection>) => {
    onChange(sections.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  };

  const addSection = () => {
    onChange([...sections, { id: crypto.randomUUID(), title: "Nueva sección", html: "<p></p>" }]);
  };

  const removeSection = (id: string) => {
    if (!window.confirm("¿Borrar esta tarjeta?")) return;
    onChange(sections.filter((s) => s.id !== id));
  };

  const moveSection = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= sections.length) return;
    const next = [...sections];
    [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
    onChange(next);
  };

  return (
    <div className="space-y-4">
      {sections.map((section, index) => (
        <div key={section.id} className="rounded-xl border border-border bg-card p-4">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex flex-col">
              <button
                type="button"
                onClick={() => moveSection(index, -1)}
                disabled={index === 0}
                className="flex h-4 w-9 items-center justify-center rounded-t-md border border-b-0 border-border text-muted-foreground transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-30"
                aria-label="Mover arriba"
              >
                <ChevronUp className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => moveSection(index, 1)}
                disabled={index === sections.length - 1}
                className="flex h-4 w-9 items-center justify-center rounded-b-md border border-border text-muted-foreground transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-30"
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
              onClick={() => removeSection(section.id)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-destructive transition-colors hover:bg-destructive/10"
              aria-label="Borrar tarjeta"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          <RichTextEditor
            html={section.html}
            onChange={(html) => updateSection(section.id, { html })}
          />
        </div>
      ))}

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
