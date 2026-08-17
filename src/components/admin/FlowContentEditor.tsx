import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ImagePlus, Plus, Trash2 } from "lucide-react";
import { SectionListEditor } from "@/components/admin/SectionListEditor";
import { updateNavItemContent } from "@/lib/onboarding/content.queries";
import { uploadContentImage } from "@/lib/supabase/uploadContentImage";
import type { DocSection, FaqItem, RoadmapContent } from "@/lib/onboarding/nav-tree";

// Edita la intro + FAQ + textos/imágenes del mapa visual de "Flujo
// operativo" (la imagen de fondo y la posición de los hotspots se quedan en
// código, ver FlowView.tsx). Las etapas (Inbound/Outbound/...) ya no viven
// acá — son subsecciones propias, se editan con FlowStageEditor.
export function FlowContentEditor({
  itemId,
  intro: initialIntro,
  faqs: initialFaqs,
  roadmap: initialRoadmap,
}: {
  itemId: string;
  intro: DocSection[];
  faqs: FaqItem[];
  roadmap: RoadmapContent;
}) {
  const queryClient = useQueryClient();
  const [intro, setIntro] = useState(initialIntro);
  const [faqs, setFaqs] = useState(initialFaqs);
  const [roadmap, setRoadmap] = useState(initialRoadmap);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const save = async () => {
    setSaving(true);
    try {
      await updateNavItemContent(itemId, { intro, faqs, roadmap });
      await queryClient.invalidateQueries({ queryKey: ["content-tree"] });
      setSavedAt(Date.now());
    } finally {
      setSaving(false);
    }
  };

  const updateHotspot = (
    number: number,
    patch: Partial<{ title: string; description: string }>,
  ) => {
    setSavedAt(null);
    setRoadmap((prev) => ({
      ...prev,
      hotspots: prev.hotspots.map((h) => (h.number === number ? { ...h, ...patch } : h)),
    }));
  };

  const updateModalImage = (key: keyof RoadmapContent["modalImages"], url: string) => {
    setSavedAt(null);
    setRoadmap((prev) => ({ ...prev, modalImages: { ...prev.modalImages, [key]: url } }));
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
        <h3 className="mb-1 text-lg font-bold">Mapa visual — pasos y modales</h3>
        <p className="mb-4 text-xs text-muted-foreground">
          La imagen de fondo y la posición de cada paso quedan fijas en el código. Acá se edita el
          título/descripción de cada uno y las 3 imágenes de los modales.
        </p>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5, 6].map((number) => {
            const hotspot = roadmap.hotspots.find((h) => h.number === number);
            return (
              <div key={number} className="space-y-2 rounded-xl border border-border p-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-bold">
                    {number}
                  </span>
                  <input
                    value={hotspot?.title ?? ""}
                    onChange={(e) => updateHotspot(number, { title: e.target.value })}
                    placeholder="Título del paso"
                    className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm font-semibold outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <textarea
                  value={hotspot?.description ?? ""}
                  onChange={(e) => updateHotspot(number, { description: e.target.value })}
                  placeholder="Descripción (se ve al pasar el mouse)"
                  rows={2}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            );
          })}
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <SingleImageUpload
            label="Depende de la Marca"
            value={roadmap.modalImages.marca}
            onChange={(url) => updateModalImage("marca", url)}
          />
          <SingleImageUpload
            label="Mapa Warehouse"
            value={roadmap.modalImages.mapa}
            onChange={(url) => updateModalImage("mapa", url)}
          />
          <SingleImageUpload
            label="Comunicación"
            value={roadmap.modalImages.envio}
            onChange={(url) => updateModalImage("envio", url)}
          />
        </div>
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

function SingleImageUpload({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      const url = await uploadContentImage(file);
      onChange(url);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-1.5">
      <div className="text-xs font-semibold text-muted-foreground">{label}</div>
      {value && (
        <img
          src={value}
          alt={label}
          className="h-24 w-full rounded-lg border border-border bg-white object-contain"
        />
      )}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-border px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary/40 disabled:opacity-60"
      >
        <ImagePlus className="h-3.5 w-3.5" />
        {uploading ? "Subiendo..." : value ? "Cambiar imagen" : "Subir imagen"}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}
