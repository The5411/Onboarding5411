import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Check } from "lucide-react";
import { SectionListEditor } from "@/components/admin/SectionListEditor";
import { SaveBar } from "@/components/admin/SaveBar";
import { useContentEditorState } from "@/hooks/useContentEditorState";
import { updateNavItemContent, updateNavItemMeta } from "@/lib/onboarding/content.queries";
import type { DocSection } from "@/lib/onboarding/nav-tree";

const LAYOUT_OPTIONS: {
  value: "flat" | "accordion";
  label: string;
  description: string;
}[] = [
  {
    value: "flat",
    label: "Lista con color",
    description: "Todas las tarjetas visibles una debajo de la otra, con acento de color.",
  },
  {
    value: "accordion",
    label: "Acordeón colapsable",
    description: "Cada tarjeta arranca cerrada y se expande al hacer click — ideal si hay muchas.",
  },
];

export function DocSectionsEditor({
  itemId,
  sections: initialSections,
  layout: initialLayout,
  onDirtyChange,
}: {
  itemId: string;
  sections: DocSection[];
  layout?: "flat" | "accordion";
  onDirtyChange?: (dirty: boolean) => void;
}) {
  const {
    content: sections,
    setContent: setSections,
    saving,
    hasUndo,
    save,
    undoLastSave,
  } = useContentEditorState(
    itemId,
    initialSections,
    (sections) => updateNavItemContent(itemId, { sections }),
    onDirtyChange,
  );
  const queryClient = useQueryClient();
  const [layout, setLayout] = useState<"flat" | "accordion">(initialLayout ?? "flat");
  const [applyingLayout, setApplyingLayout] = useState(false);

  const applyLayout = async (next: "flat" | "accordion") => {
    if (next === layout) return;
    setApplyingLayout(true);
    try {
      await updateNavItemMeta(itemId, { layout: next });
      setLayout(next);
      await queryClient.invalidateQueries({ queryKey: ["content-tree"] });
      toast.success("Diseño actualizado");
    } catch {
      toast.error("No se pudo cambiar el diseño. Probá de nuevo.");
    } finally {
      setApplyingLayout(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="mb-1 text-sm font-bold uppercase tracking-wide text-muted-foreground">
          Diseño de la página
        </h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {LAYOUT_OPTIONS.map((option) => {
            const active = layout === option.value;
            return (
              <button
                key={option.value}
                type="button"
                disabled={applyingLayout}
                onClick={() => applyLayout(option.value)}
                className={`flex flex-col items-start gap-1 rounded-xl border p-4 text-left transition-colors disabled:opacity-60 ${
                  active ? "border-primary bg-primary/5" : "border-border hover:bg-secondary/40"
                }`}
              >
                <div className="flex items-center gap-2 text-sm font-semibold">
                  {active && <Check className="h-4 w-4 text-primary" />}
                  {option.label}
                </div>
                <p className="text-xs text-muted-foreground">{option.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      <SectionListEditor sections={sections} onChange={setSections} />
      <SaveBar saving={saving} hasUndo={hasUndo} onSave={save} onUndo={undoLastSave} />
    </div>
  );
}
