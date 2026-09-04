import { useState } from "react";
import { es } from "date-fns/locale";
import { formatDistanceToNow } from "date-fns";
import { ChevronDown, ChevronUp, Copy, GripVertical, Plus, Search, Trash2 } from "lucide-react";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import type { FaqItem } from "@/lib/onboarding/nav-tree";

// Editor puro (sin guardado propio) de la lista de FAQs de "Flujo
// operativo". La respuesta usa el mismo editor rico que el resto del
// contenido (antes era un <textarea> de texto plano, inconsistente con
// todo lo demás). `category` es opcional y libre — si ninguna pregunta la
// usa, FlowView la sigue mostrando como lista plana, sin agrupar.
export function FaqListEditor({
  faqs,
  onChange,
}: {
  faqs: FaqItem[];
  onChange: (faqs: FaqItem[]) => void;
}) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [query, setQuery] = useState("");
  const [dragId, setDragId] = useState<string | null>(null);

  const updateFaq = (id: string, patch: Partial<FaqItem>) => {
    onChange(
      faqs.map((f) => (f.id === id ? { ...f, ...patch, updatedAt: new Date().toISOString() } : f)),
    );
  };

  const addFaq = () => {
    onChange([...faqs, { id: crypto.randomUUID(), q: "Nueva pregunta", a: "" }]);
  };

  const duplicateFaq = (id: string) => {
    const index = faqs.findIndex((f) => f.id === id);
    if (index === -1) return;
    const copy: FaqItem = {
      ...faqs[index],
      id: crypto.randomUUID(),
      q: `${faqs[index].q} (copia)`,
      updatedAt: new Date().toISOString(),
    };
    onChange([...faqs.slice(0, index + 1), copy, ...faqs.slice(index + 1)]);
  };

  const removeFaq = (id: string) => {
    if (!window.confirm("¿Borrar esta pregunta?")) return;
    onChange(faqs.filter((f) => f.id !== id));
  };

  const reorderByDrag = (draggedId: string, dropId: string) => {
    if (draggedId === dropId) return;
    const from = faqs.findIndex((f) => f.id === draggedId);
    const to = faqs.findIndex((f) => f.id === dropId);
    if (from === -1 || to === -1) return;
    const next = [...faqs];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange(next);
  };

  const normalizedQuery = query.trim().toLowerCase();
  const visibleFaqs = normalizedQuery
    ? faqs.filter(
        (f) =>
          f.q.toLowerCase().includes(normalizedQuery) ||
          (f.category ?? "").toLowerCase().includes(normalizedQuery),
      )
    : faqs;

  return (
    <div className="space-y-3">
      {faqs.length > 4 && (
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Buscar en ${faqs.length} preguntas...`}
            className="w-full rounded-lg border border-border bg-background py-2 pl-8 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      )}

      {visibleFaqs.map((faq) => {
        const isCollapsed = collapsed[faq.id] ?? false;
        return (
          <div
            key={faq.id}
            draggable
            onDragStart={() => setDragId(faq.id)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (dragId) reorderByDrag(dragId, faq.id);
              setDragId(null);
            }}
            onDragEnd={() => setDragId(null)}
            className={`space-y-2 rounded-xl border border-border p-3 transition-opacity ${
              dragId === faq.id ? "opacity-50" : ""
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-5 shrink-0 cursor-grab items-center justify-center text-muted-foreground active:cursor-grabbing">
                <GripVertical className="h-4 w-4" />
              </span>
              <input
                value={faq.q}
                onChange={(e) => updateFaq(faq.id, { q: e.target.value })}
                placeholder="Pregunta"
                className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm font-semibold outline-none focus:ring-2 focus:ring-ring"
              />
              <input
                value={faq.category ?? ""}
                onChange={(e) => updateFaq(faq.id, { category: e.target.value || undefined })}
                placeholder="Categoría (opcional)"
                className="w-40 shrink-0 rounded-lg border border-border bg-background px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-ring"
              />
              <button
                type="button"
                onClick={() => duplicateFaq(faq.id)}
                title="Duplicar pregunta"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-secondary"
              >
                <Copy className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => removeFaq(faq.id)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border text-destructive transition-colors hover:bg-destructive/10"
                aria-label="Borrar pregunta"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setCollapsed((prev) => ({ ...prev, [faq.id]: !isCollapsed }))}
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

            {faq.updatedAt && (
              <p className="text-[11px] text-muted-foreground">
                Editado{" "}
                {formatDistanceToNow(new Date(faq.updatedAt), { addSuffix: true, locale: es })}
              </p>
            )}

            {!isCollapsed && (
              <RichTextEditor html={faq.a} onChange={(a) => updateFaq(faq.id, { a })} />
            )}
          </div>
        );
      })}

      {normalizedQuery && visibleFaqs.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No hay preguntas que coincidan con "{query}".
        </p>
      )}

      <button
        type="button"
        onClick={addFaq}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary/40"
      >
        <Plus className="h-4 w-4" />
        Agregar pregunta
      </button>
    </div>
  );
}
