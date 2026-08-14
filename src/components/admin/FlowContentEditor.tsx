import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { FlowStageEditor } from "@/components/admin/FlowStageEditor";
import { updateNavItemContent } from "@/lib/onboarding/content.queries";
import type { FaqItem, FlowStage } from "@/lib/onboarding/nav-tree";

export function FlowContentEditor({
  itemId,
  stages: initialStages,
  faqs: initialFaqs,
}: {
  itemId: string;
  stages: FlowStage[];
  faqs: FaqItem[];
}) {
  const queryClient = useQueryClient();
  const [stages, setStages] = useState(initialStages);
  const [faqs, setFaqs] = useState(initialFaqs);
  const [faqSaving, setFaqSaving] = useState(false);
  const [faqSavedAt, setFaqSavedAt] = useState<number | null>(null);

  const persist = async (nextStages: FlowStage[], nextFaqs: FaqItem[]) => {
    await updateNavItemContent(itemId, { stages: nextStages, faqs: nextFaqs });
    await queryClient.invalidateQueries({ queryKey: ["content-tree"] });
  };

  const saveStage = async (updatedStage: FlowStage) => {
    const nextStages = stages.map((s) => (s.id === updatedStage.id ? updatedStage : s));
    setStages(nextStages);
    await persist(nextStages, faqs);
  };

  const updateFaq = (id: string, patch: Partial<FaqItem>) => {
    setFaqSavedAt(null);
    setFaqs((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  };

  const addFaq = () => {
    setFaqSavedAt(null);
    setFaqs((prev) => [...prev, { id: crypto.randomUUID(), q: "Nueva pregunta", a: "" }]);
  };

  const removeFaq = (id: string) => {
    if (!window.confirm("¿Borrar esta pregunta?")) return;
    setFaqSavedAt(null);
    setFaqs((prev) => prev.filter((f) => f.id !== id));
  };

  const saveFaqs = async () => {
    setFaqSaving(true);
    try {
      await persist(stages, faqs);
      setFaqSavedAt(Date.now());
    } finally {
      setFaqSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {stages.map((stage) => (
        <FlowStageEditor key={stage.id} stage={stage} onSave={saveStage} />
      ))}

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

        <div className="mt-4 flex items-center gap-3">
          <button
            type="button"
            onClick={saveFaqs}
            disabled={faqSaving}
            className="rounded-lg px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-soft)] transition-opacity disabled:opacity-60"
            style={{ background: "var(--gradient-hero)" }}
          >
            {faqSaving ? "Guardando..." : "Guardar FAQ"}
          </button>
          {faqSavedAt && <span className="text-xs text-muted-foreground">Guardado ✓</span>}
        </div>
      </div>
    </div>
  );
}
