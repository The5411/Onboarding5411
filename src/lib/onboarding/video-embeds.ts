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

// YouTube solo permite mostrar dentro de un <iframe> las URLs con forma
// /embed/<ID> — cualquier link normal que alguien copia (watch?v=, youtu.be,
// shorts, m.youtube.com, con &list=/&t=/?si= de más) queda bloqueado por el
// propio YouTube en silencio (pantalla negra, sin error visible). Esta
// función convierte esos links al único formato que sí funciona; si no es un
// link de YouTube reconocible, lo deja intacto (otros iframes siguen
// funcionando igual).
const YOUTUBE_URL_RE =
  /youtube(?:-nocookie)?\.com\/(?:embed\/(?<embedId>[a-zA-Z0-9_-]{11})|(?:watch\?(?:[^#]*&)?v=|shorts\/|v\/)(?<otherId>[a-zA-Z0-9_-]{11}))|youtu\.be\/(?<shortId>[a-zA-Z0-9_-]{11})/;

export function normalizeVideoUrl(url: string): string {
  const trimmed = url.trim();
  const groups = trimmed.match(YOUTUBE_URL_RE)?.groups;
  const id = groups?.embedId ?? groups?.otherId ?? groups?.shortId;
  if (!id) return trimmed;

  // Si ya era un link /embed/, mantenemos sus query params tal cual (pueden
  // llevar opciones propias del embed, ej. modestbranding). Si era un link
  // "para humanos" (watch/youtu.be/shorts), el único dato que vale la pena
  // rescatar es el tiempo de inicio (?t=90s o ?start=90).
  try {
    const parsed = new URL(trimmed);
    if (groups?.embedId) return `https://www.youtube.com/embed/${id}${parsed.search}`;
    const start = (parsed.searchParams.get("t") ?? parsed.searchParams.get("start"))?.replace(
      /s$/,
      "",
    );
    return start
      ? `https://www.youtube.com/embed/${id}?start=${start}`
      : `https://www.youtube.com/embed/${id}`;
  } catch {
    return `https://www.youtube.com/embed/${id}`;
  }
}

export function withVideoEmbedButtons(html: string): string {
  return html.replace(VIDEO_EMBED_RE, (_match, src: string) => {
    const safeSrc = escapeHtmlAttr(src);
    return (
      `<button type="button" data-video-embed data-video-src="${safeSrc}" ` +
      `class="flex w-full items-center justify-center gap-2 rounded-xl border border-border ` +
      `bg-card px-4 py-2.5 text-sm font-semibold transition-all hover:bg-secondary ` +
      `hover:scale-[1.02] active:scale-[0.98]">` +
      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" ` +
      `class="h-4 w-4 flex-shrink-0 text-primary">` +
      `<circle cx="12" cy="12" r="10"></circle>` +
      `<polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none"></polygon>` +
      `</svg>` +
      `<span>Ver video</span>` +
      `</button>`
    );
  });
}
