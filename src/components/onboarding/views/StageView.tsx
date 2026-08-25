// Página de una etapa de Flujo operativo (Inbound/Outbound/Returns/Crossdock
// hoy) — mismo diseño de dos columnas Administración/Warehouse que existía
// cuando todas las etapas vivían juntas en una sola página larga.
import {
  ClipboardCheck,
  GraduationCap,
  PackageCheck,
  Truck,
  Warehouse,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { AccordionSections } from "@/components/onboarding/AccordionSections";
import { ImageZoomModal } from "@/components/onboarding/ImageZoomModal";
import { VideoModal } from "@/components/onboarding/VideoModal";
import { withVideoEmbedButtons } from "@/lib/onboarding/video-embeds";
import type { StageContent } from "@/lib/onboarding/nav-tree";

const WAREHOUSE_ICONS: Record<string, LucideIcon> = {
  inbound: Truck,
  outbound: ClipboardCheck,
  returns: PackageCheck,
};

export function StageView({
  itemId,
  label,
  content,
}: {
  itemId: string;
  label: string;
  content: StageContent;
}) {
  const stageKey = itemId.split(".").pop() ?? "";
  const WhIcon = WAREHOUSE_ICONS[stageKey] ?? Warehouse;
  const hasSimulacro = stageKey === "inbound" || stageKey === "outbound";

  const [zoomedImage, setZoomedImage] = useState<{ src: string; alt: string } | null>(null);
  const [openVideoSrc, setOpenVideoSrc] = useState<string | null>(null);

  const handleNoteClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    if (target.tagName === "IMG") {
      const img = target as HTMLImageElement;
      setZoomedImage({ src: img.src, alt: img.alt });
      return;
    }
    const videoTrigger = target.closest("[data-video-embed]");
    if (videoTrigger) {
      const src = videoTrigger.getAttribute("data-video-src");
      if (src) setOpenVideoSrc(src);
    }
  };

  return (
    <div className="space-y-8">
      <div
        className="relative rounded-2xl p-6 md:p-8"
        style={{
          background: `linear-gradient(135deg, var(${content.phaseVar}) 0%, oklch(from var(${content.phaseVar}) calc(l - 0.1) c h) 100%)`,
        }}
      >
        <div className="text-white">
          <h2 className="text-3xl font-bold md:text-4xl">{label}</h2>
          <p className="mt-2 text-base opacity-90">{content.short}</p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Objetivo de la etapa
        </div>
        <p className="mt-2 whitespace-pre-line text-base leading-relaxed">{content.objective}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="relative rounded-2xl border border-border bg-card/60 p-4">
          <div className="mb-4 flex items-center gap-2 border-b border-border pb-3">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-[var(--shadow-soft)]"
              style={{ background: "var(--gradient-hero)" }}
            >
              <ClipboardCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                Perspectiva
              </div>
              <h3 className="text-lg font-bold">Administración</h3>
              <p className="text-xs text-muted-foreground">Responsable: {content.responsible}</p>
            </div>
          </div>
          <AccordionSections sections={content.adminSections} />
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-border p-5 md:p-6">
          <WhIcon className="pointer-events-none absolute -right-6 -top-6 h-44 w-44 opacity-[0.07]" />
          <div className="relative mb-4 flex items-center gap-2 border-b border-border pb-3">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-[var(--shadow-soft)]"
              style={{
                background: `linear-gradient(135deg, var(${content.phaseVar}), oklch(from var(${content.phaseVar}) calc(l - 0.12) c h))`,
              }}
            >
              <WhIcon className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                Perspectiva
              </div>
              <h3 className="text-lg font-bold">Warehouse</h3>
            </div>
          </div>
          <div className="relative">
            <AccordionSections sections={content.warehouseSections} />
          </div>
        </div>
      </div>

      {content.notes && content.notes.length > 0 && (
        <div className="space-y-4">
          {content.notes.map((note) => (
            <div key={note.id} className="rounded-xl border border-border bg-card p-5">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {note.label}
              </div>
              <div
                className="prose prose-sm dark:prose-invert mt-2 max-w-none [&_img]:cursor-zoom-in [&_img]:transition-transform [&_img]:hover:scale-[1.01]"
                onClick={handleNoteClick}
                dangerouslySetInnerHTML={{ __html: withVideoEmbedButtons(note.html) }}
              />
            </div>
          ))}
        </div>
      )}

      <ImageZoomModal image={zoomedImage} onClose={() => setZoomedImage(null)} />
      <VideoModal src={openVideoSrc} onClose={() => setOpenVideoSrc(null)} />

      {hasSimulacro && (
        <div className="flex justify-center">
          <Link
            to="/simulacro/$stage"
            params={{ stage: stageKey }}
            className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-[var(--shadow-soft)] transition-transform hover:scale-105"
            style={{
              background: `linear-gradient(135deg, var(${content.phaseVar}), oklch(from var(${content.phaseVar}) calc(l - 0.12) c h))`,
            }}
          >
            <GraduationCap className="h-4 w-4" />
            Hacer simulacro de {label}
          </Link>
        </div>
      )}
    </div>
  );
}
