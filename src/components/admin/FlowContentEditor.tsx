import { useRef, useState } from "react";
import { ImagePlus } from "lucide-react";
import { FaqListEditor } from "@/components/admin/FaqListEditor";
import { SectionListEditor } from "@/components/admin/SectionListEditor";
import { SaveBar } from "@/components/admin/SaveBar";
import { useContentEditorState } from "@/hooks/useContentEditorState";
import { updateNavItemContent } from "@/lib/onboarding/content.queries";
import { uploadContentImage } from "@/lib/supabase/uploadContentImage";
import type { DocSection, FaqItem, RoadmapContent } from "@/lib/onboarding/nav-tree";

type FlowContent = { intro: DocSection[]; faqs: FaqItem[]; roadmap: RoadmapContent };

// Edita la intro + FAQ + textos/imágenes del mapa visual de "Flujo
// operativo" (la imagen de fondo y la posición de los hotspots se quedan en
// código, ver FlowView.tsx). Las etapas (Inbound/Outbound/...) ya no viven
// acá — son subsecciones propias, se editan con FlowStageEditor.
export function FlowContentEditor({
  itemId,
  intro: initialIntro,
  faqs: initialFaqs,
  roadmap: initialRoadmap,
  onDirtyChange,
}: {
  itemId: string;
  intro: DocSection[];
  faqs: FaqItem[];
  roadmap: RoadmapContent;
  onDirtyChange?: (dirty: boolean) => void;
}) {
  const { content, setContent, saving, hasUndo, save, undoLastSave } =
    useContentEditorState<FlowContent>(
      itemId,
      { intro: initialIntro, faqs: initialFaqs, roadmap: initialRoadmap },
      (content) => updateNavItemContent(itemId, content),
      onDirtyChange,
    );
  const { intro, faqs, roadmap } = content;

  const updateHotspot = (
    number: number,
    patch: Partial<{ title: string; description: string }>,
  ) => {
    setContent((prev) => ({
      ...prev,
      roadmap: {
        ...prev.roadmap,
        hotspots: prev.roadmap.hotspots.map((h) => (h.number === number ? { ...h, ...patch } : h)),
      },
    }));
  };

  const updateModalImage = (key: keyof RoadmapContent["modalImages"], url: string) => {
    setContent((prev) => ({
      ...prev,
      roadmap: { ...prev.roadmap, modalImages: { ...prev.roadmap.modalImages, [key]: url } },
    }));
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="mb-3 text-lg font-bold">Introducción</h3>
        <SectionListEditor
          sections={intro}
          onChange={(intro) => setContent((prev) => ({ ...prev, intro }))}
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
        <h3 className="mb-1 text-lg font-bold">Preguntas frecuentes</h3>
        <p className="mb-4 text-xs text-muted-foreground">
          La categoría es opcional — si la usás, la vista pública agrupa las preguntas por
          categoría; si la dejás vacía en todas, se sigue viendo como una sola lista.
        </p>
        <FaqListEditor faqs={faqs} onChange={(faqs) => setContent((prev) => ({ ...prev, faqs }))} />
      </div>

      <SaveBar saving={saving} hasUndo={hasUndo} onSave={save} onUndo={undoLastSave} />
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
