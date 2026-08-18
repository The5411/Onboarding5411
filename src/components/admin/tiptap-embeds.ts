import { mergeAttributes, Node } from "@tiptap/core";

// Nodos custom de Tiptap para poder insertar y volver a editar videos (embed
// de YouTube u otro iframe) y audios dentro de una tarjeta de texto. El HTML
// que generan es el mismo patrón que ya se usa a mano en el resto del
// contenido (DocView/nav-tree.ts), para que se vea igual en la vista normal.

export const VideoEmbed = Node.create({
  name: "videoEmbed",
  group: "block",
  atom: true,
  addAttributes() {
    return {
      src: {
        default: "",
        // Los videos guardados antes de que esto fuera un botón todavía
        // tienen un <iframe> real adentro — seguimos leyendo el src de ahí
        // si no hay data-video-src (formato nuevo).
        parseHTML: (element) =>
          element.getAttribute("data-video-src") ??
          element.querySelector("iframe")?.getAttribute("src") ??
          "",
      },
    };
  },
  parseHTML() {
    return [{ tag: "div[data-video-embed], button[data-video-embed]" }];
  },
  renderHTML({ HTMLAttributes, node }) {
    // Nada de <svg> acá: Tiptap arma este nodo con document.createElement
    // sin namespace SVG, así que el ícono vectorial queda invisible dentro
    // del editor (el HTML final guardado se re-parsea normal y ahí sí se ve
    // bien — ver withVideoEmbedButtons). Un ▶ de texto evita el problema.
    return [
      "button",
      mergeAttributes(HTMLAttributes, {
        type: "button",
        "data-video-embed": "",
        "data-video-src": node.attrs.src,
        class:
          "flex aspect-video w-full items-center justify-center gap-2 overflow-hidden rounded-xl border border-border bg-black text-sm font-semibold text-white",
      }),
      ["span", { class: "text-lg" }, "▶"],
      ["span", {}, "Ver video"],
    ];
  },
});

export const AudioEmbed = Node.create({
  name: "audioEmbed",
  group: "block",
  atom: true,
  addAttributes() {
    return { src: { default: "" } };
  },
  parseHTML() {
    return [{ tag: "audio" }];
  },
  renderHTML({ HTMLAttributes, node }) {
    return [
      "audio",
      mergeAttributes(HTMLAttributes, { controls: "true", class: "w-full", src: node.attrs.src }),
    ];
  },
});
