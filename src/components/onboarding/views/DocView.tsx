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
      <div className="space-y-10">
        {sections.map((section) => (
          <section key={section.id} id={section.id} className="scroll-mt-6">
            <h2 className="mb-3 text-xl font-bold">{section.title}</h2>
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
          </section>
        ))}
      </div>

      {sections.length > 1 && (
        <nav className="hidden lg:block">
          <div className="sticky top-6 rounded-xl border border-border bg-card p-4">
            <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              En esta página
            </div>
            <ul className="space-y-1">
              {sections.map((section) => (
                <li key={section.id}>
                  <button
                    onClick={() => scrollTo(section.id)}
                    className={`w-full rounded-md px-2 py-1.5 text-left text-sm transition-colors ${
                      activeId === section.id
                        ? "bg-secondary font-semibold text-foreground"
                        : "text-muted-foreground hover:bg-secondary/60"
                    }`}
                  >
                    {section.title}
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
