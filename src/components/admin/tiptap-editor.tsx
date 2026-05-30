"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import {
  Bold, Italic, Heading2, Heading3,
  List, ListOrdered, Link2, Link2Off, Image as ImageIcon,
} from "lucide-react";

interface Props {
  value: string;
  onChange: (html: string) => void;
  error?: string;
}

const btnBase =
  "rounded p-1.5 text-sm transition-colors hover:bg-[var(--color-cream)] disabled:opacity-40";
const btnActive = "bg-[var(--color-forest)] text-white hover:bg-[var(--color-forest)]/90";

export function TiptapEditor({ value, onChange, error }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Link.configure({ openOnClick: false, HTMLAttributes: { rel: "noopener noreferrer" } }),
      Image.configure({ inline: false, allowBase64: false }),
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class:
          "min-h-[320px] px-4 py-3 text-sm focus:outline-none prose prose-sm max-w-none " +
          "prose-headings:font-display prose-a:text-[var(--color-leaf)] prose-img:rounded-lg",
      },
    },
  });

  if (!editor) return null;

  const setLink = () => {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("URL du lien :", prev ?? "https://");
    if (url === null) return;
    if (url === "") { editor.chain().focus().unsetLink().run(); return; }
    editor.chain().focus().setLink({ href: url }).run();
  };

  const insertImage = () => {
    const url = window.prompt("URL de l'image :", "https://");
    if (!url) return;
    editor.chain().focus().setImage({ src: url }).run();
  };

  return (
    <div className={`overflow-hidden rounded-lg border ${error ? "border-[var(--color-danger)]" : "border-border"} bg-white`}>
      {/* Toolbar */}
      <div className="flex flex-wrap gap-0.5 border-b border-border bg-[var(--color-cream)] px-2 py-1.5">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`${btnBase} ${editor.isActive("bold") ? btnActive : ""}`}
          title="Gras"
        >
          <Bold className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`${btnBase} ${editor.isActive("italic") ? btnActive : ""}`}
          title="Italique"
        >
          <Italic className="size-4" />
        </button>
        <div className="mx-1 w-px bg-border" />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`${btnBase} ${editor.isActive("heading", { level: 2 }) ? btnActive : ""}`}
          title="Titre H2"
        >
          <Heading2 className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`${btnBase} ${editor.isActive("heading", { level: 3 }) ? btnActive : ""}`}
          title="Titre H3"
        >
          <Heading3 className="size-4" />
        </button>
        <div className="mx-1 w-px bg-border" />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`${btnBase} ${editor.isActive("bulletList") ? btnActive : ""}`}
          title="Liste à puces"
        >
          <List className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`${btnBase} ${editor.isActive("orderedList") ? btnActive : ""}`}
          title="Liste numérotée"
        >
          <ListOrdered className="size-4" />
        </button>
        <div className="mx-1 w-px bg-border" />
        <button
          type="button"
          onClick={setLink}
          className={`${btnBase} ${editor.isActive("link") ? btnActive : ""}`}
          title="Insérer un lien"
        >
          <Link2 className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().unsetLink().run()}
          disabled={!editor.isActive("link")}
          className={btnBase}
          title="Supprimer le lien"
        >
          <Link2Off className="size-4" />
        </button>
        <div className="mx-1 w-px bg-border" />
        <button
          type="button"
          onClick={insertImage}
          className={btnBase}
          title="Insérer une image"
        >
          <ImageIcon className="size-4" />
        </button>
      </div>

      {/* Editor area */}
      <EditorContent editor={editor} />

      {error && (
        <p className="px-4 py-1.5 text-xs text-[var(--color-danger)]">{error}</p>
      )}
    </div>
  );
}
