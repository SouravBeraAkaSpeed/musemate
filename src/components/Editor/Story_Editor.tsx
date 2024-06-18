"use client";

import React, { useState } from "react";
import Tiptap from "./TipTap";
import { v4 as uuidv4 } from "uuid";

interface StoryEditorProps {
  onChange: (...event: any[]) => void;
  id:string;
}

const StoryEditor = ({ onChange,id }: StoryEditorProps) => {
  const [content, setContent] = useState<string>("");
  const handleContentChange = (reason: any) => {
    onChange(reason)
    setContent(reason)
  };
  const handleSubmit = (e: any) => {
    e.preventDefault();
    const data = {
      id: uuidv4(),
      content: content,
    };
    console.log(data);
    const existingDataString = localStorage.getItem("myData");
    const existingData = existingDataString
      ? JSON.parse(existingDataString)
      : [];
    const updatedData = [...existingData, data];
    localStorage.setItem("myData", JSON.stringify(updatedData));
    setContent("");
  };
  return (
    <Tiptap
      content={content}
      id={id}
      onChange={(newContent: string) => handleContentChange(newContent)}
    />
  );
};

export default StoryEditor;
