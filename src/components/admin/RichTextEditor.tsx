import { useRef, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import {
  Bold,
  Heading2,
  Heading3,
  ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";

export function RichTextEditor({
  html,
  onChange,
}: {
  html: string;
  onChange: (html: string) => void;
}) {
  const editor = useEditor({
    extensions: [StarterKit.configure({ link: { openOnClick: false } }), Image],
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
    const path = `${crypto.randomUUID()}-${file.name}`;
    const { error } = await supabase.storage.from("content-images").upload(path, file);
    if (!error) {
      const { data } = supabase.storage.from("content-images").getPublicUrl(path);
      editor.chain().focus().setImage({ src: data.publicUrl }).run();
    }
    setUploading(false);
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
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className={btn(false)}
        aria-label="Insertar imagen"
      >
        <ImageIcon className="h-3.5 w-3.5" />
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
