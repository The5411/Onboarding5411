import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { SectionListEditor } from "@/components/admin/SectionListEditor";
import { updateNavItemContent } from "@/lib/onboarding/content.queries";
import type { DocSection } from "@/lib/onboarding/nav-tree";

export function DocSectionsEditor({
  itemId,
  sections: initialSections,
}: {
  itemId: string;
  sections: DocSection[];
}) {
  const queryClient = useQueryClient();
  const [sections, setSections] = useState(initialSections);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const handleChange = (next: DocSection[]) => {
    setSavedAt(null);
    setSections(next);
  };

  const save = async () => {
    setSaving(true);
    try {
      await updateNavItemContent(itemId, { sections });
      await queryClient.invalidateQueries({ queryKey: ["content-tree"] });
      setSavedAt(Date.now());
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <SectionListEditor sections={sections} onChange={handleChange} />

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="rounded-lg px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-soft)] transition-opacity disabled:opacity-60"
          style={{ background: "var(--gradient-hero)" }}
        >
          {saving ? "Guardando..." : "Guardar cambios"}
        </button>
        {savedAt && <span className="text-xs text-muted-foreground">Guardado ✓</span>}
      </div>
    </div>
  );
}
