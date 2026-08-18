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
          "flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold",
      }),
      ["span", { class: "text-primary" }, "▶"],
      ["span", {}, "Ver video"],
    ];
  },
  // Sin esto, un video ya insertado no se puede volver a tocar — el único
  // camino era borrar el bloque entero y agregarlo de nuevo. El NodeView
  // hace que el botón, dentro del editor, abra el mismo prompt de URL para
  // corregirla o reemplazarla en el lugar.
  addNodeView() {
    return ({ node, editor, getPos }) => {
      const button = document.createElement("button");
      button.type = "button";
      button.setAttribute("data-video-embed", "");
      button.className =
        "flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold cursor-pointer hover:bg-secondary";

      const icon = document.createElement("span");
      icon.className = "text-primary";
      icon.textContent = "▶";

      const label = document.createElement("span");
      label.textContent = "Ver video (click para editar la URL)";

      button.append(icon, label);

      // mousedown + preventDefault (no "click") es lo que evita que
      // ProseMirror procese su propia selección sobre este elemento antes de
      // que el prompt le robe el foco — si no, tira un error de consola
      // inofensivo pero ruidoso ("Selection ... must point at the current
      // document") por la carrera entre el foco del prompt y el editor.
      button.addEventListener("mousedown", (event) => {
        event.preventDefault();
        const url = window.prompt(
          "URL del video (embed de YouTube, ej. https://www.youtube.com/embed/XXXX):",
          node.attrs.src,
        );
        if (url === null) return;
        const pos = typeof getPos === "function" ? getPos() : undefined;
        if (typeof pos === "number") {
          editor.view.dispatch(
            editor.view.state.tr.setNodeMarkup(pos, undefined, { ...node.attrs, src: url }),
          );
        }
      });

      return { dom: button };
    };
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
