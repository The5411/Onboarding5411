import { useState } from "react";
import { AlertTriangle, ChevronDown } from "lucide-react";
import { SlidesCarousel } from "@/components/onboarding/SlidesCarousel";
import { ImageZoomModal } from "@/components/onboarding/ImageZoomModal";
import { VideoModal } from "@/components/onboarding/VideoModal";
import { withVideoEmbedButtons } from "@/lib/onboarding/video-embeds";
import type { DocSection } from "@/lib/onboarding/nav-tree";

// Lista de tarjetas colapsables (título + HTML), con zoom de imágenes al
// hacer click. Lo usa `DocView` (layout "accordion") y `FlowView` (columnas
// Administración/Warehouse de cada etapa) — mismo componente en los dos
// lados para que se vea y se comporte igual en toda la app.
export function AccordionSections({ sections }: { sections: DocSection[] }) {
  const [openIds, setOpenIds] = useState<Record<string, boolean>>({});
  const [zoomedImage, setZoomedImage] = useState<{ src: string; alt: string } | null>(null);
  const [openVideoSrc, setOpenVideoSrc] = useState<string | null>(null);

  const toggle = (id: string) => {
    setOpenIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleContentClick = (event: React.MouseEvent<HTMLDivElement>) => {
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
    <>
      <div className="space-y-3">
        {sections.map((section) => {
          const isOpen = !!openIds[section.id];
          const isWarning = section.accent === "warning";
          return (
            <div
              key={section.id}
              className={`overflow-hidden rounded-xl border ${
                isWarning ? "border-destructive/30 bg-destructive/5" : "border-border bg-card"
              }`}
            >
              <button
                type="button"
                onClick={() => toggle(section.id)}
                aria-expanded={isOpen}
                className={`flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition-colors ${
                  isWarning ? "hover:bg-destructive/10" : "hover:bg-secondary/40"
                }`}
              >
                <span
                  className={`flex items-center gap-2 text-base font-bold ${isWarning ? "text-destructive" : ""}`}
                >
                  {isWarning && <AlertTriangle className="h-4 w-4 flex-shrink-0" />}
                  {section.title}
                </span>
                <ChevronDown
                  className={`h-4 w-4 flex-shrink-0 transition-transform ${
                    isWarning ? "text-destructive" : "text-muted-foreground"
                  } ${isOpen ? "rotate-180" : ""}`}
                />
              </button>
              <div
                className={`grid transition-all duration-200 ease-in-out ${
                  isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <div
                    className={`border-t px-5 py-5 ${isWarning ? "border-destructive/20" : "border-border"}`}
                  >
                    {section.images && (
                      <div className="mb-4">
                        <SlidesCarousel images={section.images} />
                      </div>
                    )}
                    <div
                      className="prose prose-sm dark:prose-invert max-w-none [&_img]:cursor-zoom-in [&_img]:transition-transform [&_img]:hover:scale-[1.01]"
                      onClick={handleContentClick}
                      dangerouslySetInnerHTML={{ __html: withVideoEmbedButtons(section.html) }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <ImageZoomModal image={zoomedImage} onClose={() => setZoomedImage(null)} />
      <VideoModal src={openVideoSrc} onClose={() => setOpenVideoSrc(null)} />
    </>
  );
}
