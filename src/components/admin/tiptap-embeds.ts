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
        parseHTML: (element) => element.querySelector("iframe")?.getAttribute("src") ?? "",
      },
    };
  },
  parseHTML() {
    return [{ tag: "div[data-video-embed]" }];
  },
  renderHTML({ HTMLAttributes, node }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-video-embed": "",
        class: "aspect-video w-full overflow-hidden rounded-xl border border-border bg-black",
      }),
      [
        "iframe",
        {
          src: node.attrs.src,
          class: "h-full w-full",
          allowfullscreen: "true",
        },
      ],
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
