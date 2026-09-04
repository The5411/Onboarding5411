import { useState } from "react";
import type { DocSection } from "@/lib/onboarding/nav-tree";
import { SlidesCarousel } from "@/components/onboarding/SlidesCarousel";
import { ImageZoomModal } from "@/components/onboarding/ImageZoomModal";
import { VideoModal } from "@/components/onboarding/VideoModal";
import { AccordionSections } from "@/components/onboarding/AccordionSections";
import { withVideoEmbedButtons } from "@/lib/onboarding/video-embeds";

export function DocView({
  sections,
  layout = "flat",
}: {
  sections: DocSection[];
  layout?: "flat" | "accordion";
}) {
  if (layout === "accordion") {
    return <AccordionSections sections={sections} />;
  }
  return <FlatDoc sections={sections} />;
}

// Ciclo de colores de fase (los mismos 8 que usan el roadmap de Flujo
// operativo y las etapas) para darle a cada tarjeta un acento distinto sin
// inventar una paleta nueva — mantiene todo el color de la app consistente.
const PHASE_VARS = Array.from({ length: 8 }, (_, i) => `--phase-${i + 1}`);

function FlatDoc({ sections }: { sections: DocSection[] }) {
  const [activeId, setActiveId] = useState(sections[0]?.id);
  const [zoomedImage, setZoomedImage] = useState<{ src: string; alt: string } | null>(null);
  const [openVideoSrc, setOpenVideoSrc] = useState<string | null>(null);

  const scrollTo = (id: string) => {
    setActiveId(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
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
    <div className="grid gap-8 lg:grid-cols-[1fr_220px]">
      <div className="space-y-6">
        {sections.map((section, index) => {
          const phaseVar = PHASE_VARS[index % PHASE_VARS.length];
          return (
            <section
              key={section.id}
              id={section.id}
              className="scroll-mt-6 overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-soft)]"
            >
              <div className="h-1" style={{ background: `var(${phaseVar})` }} />
              <div className="p-6">
                <div className="mb-4 flex items-center gap-3">
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white"
                    style={{ background: `var(${phaseVar})` }}
                  >
                    {index + 1}
                  </span>
                  <h2 className="text-xl font-bold">{section.title}</h2>
                </div>
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
            </section>
          );
        })}
      </div>

      {sections.length > 1 && (
        <nav className="hidden lg:block">
          <div className="sticky top-6 rounded-xl border border-border bg-card p-4">
            <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              En esta página
            </div>
            <ul className="space-y-1">
              {sections.map((section, index) => (
                <li key={section.id}>
                  <button
                    onClick={() => scrollTo(section.id)}
                    className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors ${
                      activeId === section.id
                        ? "bg-secondary font-semibold text-foreground"
                        : "text-muted-foreground hover:bg-secondary/60"
                    }`}
                  >
                    <span
                      className="h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ background: `var(${PHASE_VARS[index % PHASE_VARS.length]})` }}
                    />
                    <span className="truncate">{section.title}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      )}

      <ImageZoomModal image={zoomedImage} onClose={() => setZoomedImage(null)} />
      <VideoModal src={openVideoSrc} onClose={() => setOpenVideoSrc(null)} />
    </div>
  );
}
