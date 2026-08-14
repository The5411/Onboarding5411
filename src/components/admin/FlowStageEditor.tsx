import { useState } from "react";
import { SectionListEditor } from "@/components/admin/SectionListEditor";
import type { FlowStage } from "@/lib/onboarding/nav-tree";

const PHASE_OPTIONS = Array.from({ length: 8 }, (_, i) => `--phase-${i + 1}`);

export function FlowStageEditor({
  stage: initialStage,
  onSave,
}: {
  stage: FlowStage;
  onSave: (stage: FlowStage) => Promise<void>;
}) {
  const [stage, setStage] = useState(initialStage);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const patch = (fields: Partial<FlowStage>) => {
    setSavedAt(null);
    setStage((prev) => ({ ...prev, ...fields }));
  };

  const save = async () => {
    setSaving(true);
    try {
      await onSave(stage);
      setSavedAt(Date.now());
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 rounded-2xl border border-border bg-card p-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="text-xs font-semibold text-muted-foreground">Nombre</label>
          <input
            value={stage.name}
            onChange={(e) => patch({ name: e.target.value })}
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground">Color de la etapa</label>
          <select
            value={stage.phaseVar}
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
        <div className="sm:col-span-2">
          <label className="text-xs font-semibold text-muted-foreground">Descripción corta</label>
          <input
            value={stage.short}
            onChange={(e) => patch({ short: e.target.value })}
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs font-semibold text-muted-foreground">
            Objetivo de la etapa
          </label>
          <textarea
            value={stage.objective}
            onChange={(e) => patch({ objective: e.target.value })}
            rows={2}
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-muted-foreground">Responsable</label>
          <input
            value={stage.responsible}
            onChange={(e) => patch({ responsible: e.target.value })}
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      <div>
        <h4 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">
          Administración — actividades y puntos críticos
        </h4>
        <SectionListEditor
          sections={stage.adminSections}
          onChange={(adminSections) => patch({ adminSections })}
          addLabel="Agregar actividad"
        />
      </div>

      <div>
        <h4 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">
          Warehouse — qué pasa físicamente
        </h4>
        <SectionListEditor
          sections={stage.warehouseSections}
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
