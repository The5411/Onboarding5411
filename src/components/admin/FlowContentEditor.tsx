import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { SectionListEditor } from "@/components/admin/SectionListEditor";
import { updateNavItemContent } from "@/lib/onboarding/content.queries";
import type { DocSection, FaqItem } from "@/lib/onboarding/nav-tree";

// Edita la intro + FAQ de "Flujo operativo" (el mapa visual se queda como
// código). Las etapas (Inbound/Outbound/...) ya no viven acá — son
// subsecciones propias, se editan con FlowStageEditor.
export function FlowContentEditor({
  itemId,
  intro: initialIntro,
  faqs: initialFaqs,
}: {
  itemId: string;
  intro: DocSection[];
  faqs: FaqItem[];
}) {
  const queryClient = useQueryClient();
  const [intro, setIntro] = useState(initialIntro);
  const [faqs, setFaqs] = useState(initialFaqs);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const save = async () => {
    setSaving(true);
    try {
      await updateNavItemContent(itemId, { intro, faqs });
      await queryClient.invalidateQueries({ queryKey: ["content-tree"] });
      setSavedAt(Date.now());
    } finally {
      setSaving(false);
    }
  };

  const updateFaq = (id: string, patch: Partial<FaqItem>) => {
    setSavedAt(null);
    setFaqs((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  };

  const addFaq = () => {
    setSavedAt(null);
    setFaqs((prev) => [...prev, { id: crypto.randomUUID(), q: "Nueva pregunta", a: "" }]);
  };

  const removeFaq = (id: string) => {
    if (!window.confirm("¿Borrar esta pregunta?")) return;
    setSavedAt(null);
    setFaqs((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="mb-3 text-lg font-bold">Introducción</h3>
        <SectionListEditor
          sections={intro}
          onChange={(next) => {
            setSavedAt(null);
            setIntro(next);
          }}
          addLabel="Agregar tarjeta"
        />
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <h3 className="mb-4 text-lg font-bold">Preguntas frecuentes</h3>
        <div className="space-y-3">
          {faqs.map((faq) => (
            <div key={faq.id} className="space-y-2 rounded-xl border border-border p-3">
              <div className="flex items-center gap-2">
                <input
                  value={faq.q}
                  onChange={(e) => updateFaq(faq.id, { q: e.target.value })}
                  placeholder="Pregunta"
                  className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm font-semibold outline-none focus:ring-2 focus:ring-ring"
                />
                <button
                  type="button"
                  onClick={() => removeFaq(faq.id)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-destructive transition-colors hover:bg-destructive/10"
                  aria-label="Borrar pregunta"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <textarea
                value={faq.a}
                onChange={(e) => updateFaq(faq.id, { a: e.target.value })}
                placeholder="Respuesta"
                rows={2}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addFaq}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary/40"
        >
          <Plus className="h-4 w-4" />
          Agregar pregunta
        </button>
      </div>

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
