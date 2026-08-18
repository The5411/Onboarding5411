import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { SectionListEditor } from "@/components/admin/SectionListEditor";
import { updateNavItemContent } from "@/lib/onboarding/content.queries";
import type { StageContent } from "@/lib/onboarding/nav-tree";

const PHASE_OPTIONS = Array.from({ length: 8 }, (_, i) => `--phase-${i + 1}`);

// Edita una etapa de Flujo operativo (Inbound/Outbound/Returns/Crossdock),
// cada una su propio nav_item. El nombre de la etapa es el `label` del item
// — eso se edita desde NavStructureEditor, no acá.
export function FlowStageEditor({
  itemId,
  content: initialContent,
}: {
  itemId: string;
  content: StageContent;
}) {
  const queryClient = useQueryClient();
  const [content, setContent] = useState(initialContent);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const patch = (fields: Partial<StageContent>) => {
    setSavedAt(null);
    setContent((prev) => ({ ...prev, ...fields }));
  };

  const save = async () => {
    setSaving(true);
    try {
      await updateNavItemContent(itemId, content);
      await queryClient.invalidateQueries({ queryKey: ["content-tree"] });
      setSavedAt(Date.now());
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-3 rounded-2xl border border-border bg-card p-5 sm:grid-cols-2">
        <div>
          <label className="text-xs font-semibold text-muted-foreground">Color de la etapa</label>
          <select
            value={content.phaseVar}
            onChange={(e) => patch({ phaseVar: e.target.value })}
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          >
            {PHASE_OPTIONS.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground">Responsable</label>
          <input
            value={content.responsible}
            onChange={(e) => patch({ responsible: e.target.value })}
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs font-semibold text-muted-foreground">Descripción corta</label>
          <input
            value={content.short}
            onChange={(e) => patch({ short: e.target.value })}
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs font-semibold text-muted-foreground">
            Objetivo de la etapa{" "}
            <span className="font-normal normal-case text-muted-foreground/70">
              (Enter separa en párrafos)
            </span>
          </label>
          <textarea
            value={content.objective}
            onChange={(e) => patch({ objective: e.target.value })}
            rows={5}
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm leading-relaxed outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      <div>
        <h4 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">
          Administración — actividades y puntos críticos
        </h4>
        <SectionListEditor
          sections={content.adminSections}
          onChange={(adminSections) => patch({ adminSections })}
          addLabel="Agregar actividad"
        />
      </div>

      <div>
        <h4 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">
          Warehouse — qué pasa físicamente
        </h4>
        <SectionListEditor
          sections={content.warehouseSections}
          onChange={(warehouseSections) => patch({ warehouseSections })}
          addLabel="Agregar bloque"
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="rounded-lg px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-soft)] transition-opacity disabled:opacity-60"
          style={{ background: "var(--gradient-hero)" }}
        >
          {saving ? "Guardando..." : "Guardar etapa"}
        </button>
        {savedAt && <span className="text-xs text-muted-foreground">Guardado ✓</span>}
      </div>
    </div>
  );
}
