'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import ImageExt from '@tiptap/extension-image';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Youtube from '@tiptap/extension-youtube';
import { useEffect } from 'react';

export function TiptapEditor({
  initialContent,
  onChange,
}: {
  initialContent?: object;
  onChange: (json: object, html: string) => void;
}) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Link.configure({ openOnClick: false, autolink: true }),
      ImageExt,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      Youtube.configure({ width: 640, height: 360 }),
    ],
    content: initialContent ?? '<p></p>',
    editorProps: {
      attributes: { class: 'editable prose max-w-none focus:outline-none' },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON(), editor.getHTML());
    },
  });

  // Report the initial content on mount too, so a brand-new article
  // still has a valid contentJson/contentHtml pair if saved untouched.
  useEffect(() => {
    if (editor) onChange(editor.getJSON(), editor.getHTML());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

  if (!editor) return null;

  const tool = (active: boolean) =>
    `tool ${active ? 'bg-frl-green text-white border-frl-green' : ''}`;

  return (
    <div className="editor">
      <div className="toolbar">
        <button type="button" className={tool(editor.isActive('bold'))} onClick={() => editor.chain().focus().toggleBold().run()}><b>B</b></button>
        <button type="button" className={tool(editor.isActive('italic'))} onClick={() => editor.chain().focus().toggleItalic().run()}><i>I</i></button>
        <button type="button" className={tool(editor.isActive('underline'))} onClick={() => editor.chain().focus().toggleUnderline().run()}><u>U</u></button>
        <button type="button" className={tool(editor.isActive('strike'))} onClick={() => editor.chain().focus().toggleStrike().run()}><s>S</s></button>
        <button type="button" className={tool(editor.isActive('heading', { level: 1 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>H1</button>
        <button type="button" className={tool(editor.isActive('heading', { level: 2 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>H2</button>
        <button type="button" className={tool(editor.isActive('heading', { level: 3 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>H3</button>

        <input
          type="color"
          className="tool"
          title="Text colour"
          onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
        />
        <button type="button" className={tool(editor.isActive('highlight'))} onClick={() => editor.chain().focus().toggleHighlight().run()}>Highlight</button>

        <button type="button" className={tool(editor.isActive({ textAlign: 'left' }))} onClick={() => editor.chain().focus().setTextAlign('left').run()}>⇤</button>
        <button type="button" className={tool(editor.isActive({ textAlign: 'center' }))} onClick={() => editor.chain().focus().setTextAlign('center').run()}>↔</button>
        <button type="button" className={tool(editor.isActive({ textAlign: 'right' }))} onClick={() => editor.chain().focus().setTextAlign('right').run()}>⇥</button>

        <button type="button" className={tool(editor.isActive('orderedList'))} onClick={() => editor.chain().focus().toggleOrderedList().run()}>1. List</button>
        <button type="button" className={tool(editor.isActive('bulletList'))} onClick={() => editor.chain().focus().toggleBulletList().run()}>• List</button>
        <button type="button" className={tool(editor.isActive('blockquote'))} onClick={() => editor.chain().focus().toggleBlockquote().run()}>“ ”</button>
        <button type="button" className={tool(editor.isActive('codeBlock'))} onClick={() => editor.chain().focus().toggleCodeBlock().run()}>{'</>'}</button>
        <button type="button" className="tool" onClick={() => editor.chain().focus().setHorizontalRule().run()}>―</button>

        <button
          type="button"
          className={tool(editor.isActive('link'))}
          onClick={() => {
            const url = window.prompt('Link URL');
            if (url) editor.chain().focus().setLink({ href: url }).run();
            else editor.chain().focus().unsetLink().run();
          }}
        >
          🔗
        </button>
        <button
          type="button"
          className="tool"
          onClick={() => {
            const url = window.prompt('Image URL');
            if (url) editor.chain().focus().setImage({ src: url }).run();
          }}
        >
          🖼
        </button>
        <button
          type="button"
          className="tool"
          onClick={() => {
            const url = window.prompt('YouTube video URL');
            if (url) editor.commands.setYoutubeVideo({ src: url });
          }}
        >
          ▶ Video
        </button>
        <button
          type="button"
          className="tool"
          onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
        >
          ▦ Table
        </button>

        <button type="button" className="tool" onClick={() => editor.chain().focus().undo().run()}>↶</button>
        <button type="button" className="tool" onClick={() => editor.chain().focus().redo().run()}>↷</button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
