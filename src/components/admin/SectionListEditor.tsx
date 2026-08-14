import { Plus, Trash2 } from "lucide-react";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import type { DocSection } from "@/lib/onboarding/nav-tree";

// Editor puro (sin botón de guardar ni llamadas a Supabase) de una lista de
// tarjetas título+HTML. Lo usa `DocSectionsEditor` (que le agrega guardado)
// y `FlowStageEditor` (que guarda todo el contenido de la etapa junto).
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

  return (
    <div className="space-y-4">
      {sections.map((section) => (
        <div key={section.id} className="rounded-xl border border-border bg-card p-4">
          <div className="mb-3 flex items-center gap-2">
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
