// Los videos se guardan en el HTML de las tarjetas como
// `<div data-video-embed><iframe src="...">` (ver tiptap-embeds.ts). Antes
// eso se mostraba como un iframe en vivo (algunos hasta con autoplay), lo
// que hacía la página muy pesada/ruidosa con varios videos. Esta función
// reemplaza cada iframe por un botón "Ver video" — el click real que abre
// el video en un modal lo maneja el componente que llama a esto (ver
// data-video-src + handleContentClick en AccordionSections/DocView).
const VIDEO_EMBED_RE =
  /<div[^>]*\bdata-video-embed\b[^>]*>\s*<iframe[^>]*\bsrc="([^"]*)"[^>]*>\s*<\/iframe>\s*<\/div>/g;

function escapeHtmlAttr(value: string) {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}

export function withVideoEmbedButtons(html: string): string {
  return html.replace(VIDEO_EMBED_RE, (_match, src: string) => {
    const safeSrc = escapeHtmlAttr(src);
    return (
      `<button type="button" data-video-embed data-video-src="${safeSrc}" ` +
      `class="group flex aspect-video w-full items-center justify-center gap-2 overflow-hidden ` +
      `rounded-xl border border-border bg-black text-sm font-semibold text-white transition-colors ` +
      `hover:bg-black/85">` +
      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" ` +
      `class="h-10 w-10 flex-shrink-0 transition-transform group-hover:scale-110">` +
      `<circle cx="12" cy="12" r="10"></circle>` +
      `<polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none"></polygon>` +
      `</svg>` +
      `<span>Ver video</span>` +
      `</button>`
    );
  });
}
