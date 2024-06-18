"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Toolbar from "./Toolbar";
import Underline from "@tiptap/extension-underline";
import Heading from "@tiptap/extension-heading";
import Image from "@tiptap/extension-image";
import Strike from "@tiptap/extension-strike";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import Blockquote from "@tiptap/extension-blockquote";
import HardBreak from "@tiptap/extension-hard-break";

const Tiptap = ({ onChange, content, id }: any) => {
  const handleChange = (newContent: string) => {
    onChange(newContent);
  };
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Blockquote.configure({
        HTMLAttributes: {
          class: 'italic text-lg',
        },
      }),
      Image.configure({
        inline: false,
      }),
      HardBreak,
      Heading.configure({
        levels: [1],
        HTMLAttributes: {
          class: "text-3xl",
        },
      }),
      Strike,
      OrderedList.configure({
        HTMLAttributes: {
          class: 'list-decimal p-3',
        },
      }),
      BulletList.configure({
        itemTypeName: "listItem",
        keepMarks: true,

        HTMLAttributes: {
          class: "list-disc p-3",
        },
      }),
    ],
    editorProps: {
      attributes: {
        class:
          "flex flex-col px-4 py-3 justify-start border-b border-r border-l border-gray-700 text-white items-start w-full gap-3 font-medium text-[16px] pt-4 rounded-bl-md rounded-br-md outline-none",
      },
    },
    onUpdate: ({ editor }) => {
      handleChange(editor.getHTML());
    },
  });

  return (
    <div className="w-full my-2">
      <Toolbar editor={editor} content={content} id={id} />
      <EditorContent style={{ whiteSpace: "pre-line" }} editor={editor} />
    </div>
  );
};

export default Tiptap;
