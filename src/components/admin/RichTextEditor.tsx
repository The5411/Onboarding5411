import { useRef, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import {
  Bold,
  Heading2,
  Heading3,
  Highlighter,
  ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  Music,
  Palette,
  Smile,
  Video,
} from "lucide-react";
import { AudioEmbed, VideoEmbed } from "@/components/admin/tiptap-embeds";
import { normalizeVideoUrl } from "@/lib/onboarding/video-embeds";
import { uploadContentImage } from "@/lib/supabase/uploadContentImage";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

// Set acotado y relevante para contenido de operaciones/warehouse — no un
// selector de emojis completo, para no complicar la barra de herramientas.
const EMOJI_OPTIONS = [
  "📦",
  "🚚",
  "✅",
  "⚠️",
  "📋",
  "🔍",
  "📌",
  "🏷️",
  "📅",
  "💡",
  "🔔",
  "📸",
  "🔒",
  "📤",
  "📥",
  "🧾",
  "⏱️",
  "👥",
  "📞",
  "✉️",
];

export function RichTextEditor({
  html,
  onChange,
}: {
  html: string;
  onChange: (html: string) => void;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ link: { openOnClick: false } }),
      Image,
      TextStyle,
      Color,
      Highlight,
      VideoEmbed,
      AudioEmbed,
    ],
    content: html,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class:
          "prose prose-sm dark:prose-invert max-w-none min-h-[120px] rounded-lg border border-border bg-background px-3 py-2 focus:outline-none",
      },
    },
  });

  if (!editor) return null;

  return (
    <div className="space-y-2">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}

function Toolbar({ editor }: { editor: NonNullable<ReturnType<typeof useEditor>> }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const btn = (active: boolean) =>
    `flex h-7 w-7 items-center justify-center rounded-md transition-colors ${
      active ? "bg-primary text-primary-foreground" : "hover:bg-secondary"
    }`;

  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      const url = await uploadContentImage(file);
      editor.chain().focus().setImage({ src: url }).run();
    } catch {
      // ignora fallos de subida, igual que antes
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={btn(editor.isActive("bold"))}
        aria-label="Negrita"
      >
        <Bold className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={btn(editor.isActive("italic"))}
        aria-label="Cursiva"
      >
        <Italic className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={btn(editor.isActive("heading", { level: 2 }))}
        aria-label="Título"
      >
        <Heading2 className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={btn(editor.isActive("heading", { level: 3 }))}
        aria-label="Subtítulo"
      >
        <Heading3 className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={btn(editor.isActive("bulletList"))}
        aria-label="Lista"
      >
        <List className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={btn(editor.isActive("orderedList"))}
        aria-label="Lista numerada"
      >
        <ListOrdered className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        onClick={() => {
          const url = window.prompt("URL del link:");
          if (url) editor.chain().focus().setLink({ href: url }).run();
        }}
        className={btn(editor.isActive("link"))}
        aria-label="Link"
      >
        <Link2 className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHighlight().run()}
        className={btn(editor.isActive("highlight"))}
        aria-label="Resaltar"
      >
        <Highlighter className="h-3.5 w-3.5" />
      </button>
      <label
        className={btn(false) + " relative cursor-pointer"}
        title="Color de texto"
        aria-label="Color de texto"
      >
        <Palette className="h-3.5 w-3.5" />
        <input
          type="color"
          onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
      </label>
      <button
        type="button"
        onClick={() => editor.chain().focus().unsetColor().run()}
        className={btn(false)}
        aria-label="Quitar color"
        title="Quitar color de texto"
      >
        <Palette className="h-3.5 w-3.5 opacity-40" />
      </button>
      <Popover>
        <PopoverTrigger asChild>
          <button type="button" className={btn(false)} aria-label="Insertar ícono">
            <Smile className="h-3.5 w-3.5" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-2">
          <div className="grid grid-cols-6 gap-1">
            {EMOJI_OPTIONS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => editor.chain().focus().insertContent(emoji).run()}
                className="flex h-8 w-8 items-center justify-center rounded-md text-base transition-colors hover:bg-secondary"
              >
                {emoji}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className={btn(false)}
        aria-label="Insertar imagen"
      >
        <ImageIcon className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        onClick={() => {
          const url = window.prompt(
            "URL del video (pegá el link de YouTube tal cual, ej. https://youtu.be/XXXX):",
          );
          if (url)
            editor
              .chain()
              .focus()
              .insertContent({ type: "videoEmbed", attrs: { src: normalizeVideoUrl(url) } })
              .run();
        }}
        className={btn(false)}
        aria-label="Insertar video"
      >
        <Video className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        onClick={() => {
          const url = window.prompt("URL del audio (mp3, etc.):");
          if (url)
            editor
              .chain()
              .focus()
              .insertContent({ type: "audioEmbed", attrs: { src: url } })
              .run();
        }}
        className={btn(false)}
        aria-label="Insertar audio"
      >
        <Music className="h-3.5 w-3.5" />
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
      {uploading && <span className="text-xs text-muted-foreground">Subiendo...</span>}
    </div>
  );
}
