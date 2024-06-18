"use client";
import React, { useEffect, useState } from "react";
import { useSupabaseUser } from "./providers/supabase-user-provider";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { v4 } from "uuid";
import Image from "next/image";
import { X } from "lucide-react";
import { Input } from "./ui/input";

interface ProfilePictureUploadProps {
  onChange: (url?: string) => void;
  value: string | undefined;
  setUploadinglogo: React.Dispatch<React.SetStateAction<boolean>>;
}
export const ProfilePictureUpload = ({
  onChange,
  value,
  setUploadinglogo,
}: ProfilePictureUploadProps) => {
  const { state } = useSupabaseUser();
  const [profileId, setProfileId] = useState("");
  const supabase = createClientComponentClient();

  useEffect(() => {
    if (state.user) setProfileId(state.user.id);
  }, [state]);

  interface onProfilePictureUploadProps {
    e: React.ChangeEvent<HTMLInputElement>;
  }
  const onProfilePictureUpload = async ({ e }: onProfilePictureUploadProps) => {
    console.log("called");
    if (!profileId) return;
    const file = e.target.files?.[0];
    if (!file) return;
    const uuid = v4();
    setUploadinglogo(true);
    const { data, error } = await supabase.storage
      .from("profile-pictures")
      .upload(`profilepictures.${profileId}.${uuid}`, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (!error) {
      console.log(data);
      const path = supabase.storage
        .from("profile-pictures")
        .getPublicUrl(`profilepictures.${profileId}.${uuid}`)?.data.publicUrl;
      onChange(path);
      setUploadinglogo(false);
    }
  };

  if (value) {
    return (
      <div className="relative flex justify-center items-center p-4  rounded-[10px] bg-background/10 border-2 mt-3 ">
        <Image
          width={50}
          height={50}
          src={value}
          alt="Profile Picture"
          className="rounded-full w-[50px] h-[50px]"
        />

        <button
          onClick={() => onChange("")}
          className="bg-rose-500 text-white p-1 rounded-full absolute top-1 right-1 shadow-sm"
          type="button"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <Input
      type="file"
      accept="image/*"
      className="text-white  my-2   rounded-[10px]"
      onChange={(e) => {
        onProfilePictureUpload({ e });
      }}
      value={value}
    />
  );
};

interface storyPictureUploadProps {
  onChange: (url?: string) => void;
  value: string | undefined;
  storyId: string;
  setUploadingStory: React.Dispatch<React.SetStateAction<boolean>>;
}
export const StoryPictureUpload = ({
  onChange,
  value,
  storyId,
  setUploadingStory,
}: storyPictureUploadProps) => {
  const { state } = useSupabaseUser();
  const supabase = createClientComponentClient();

  interface onstoryPictureUploadProps {
    e: React.ChangeEvent<HTMLInputElement>;
  }
  const onStoryPictureUpload = async ({ e }: onstoryPictureUploadProps) => {
    console.log("called");
    if (!storyId) return;
    const file = e.target.files?.[0];
    if (!file) return;
    const uuid = v4();
    setUploadingStory(true);
    const { data, error } = await supabase.storage
      .from("story-pictures")
      .upload(`storypictures.${storyId}.${uuid}`, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (!error) {
      console.log(data);
      const path = supabase.storage
        .from("story-pictures")
        .getPublicUrl(`storypictures.${storyId}.${uuid}`)?.data.publicUrl;
      onChange(path);
      setUploadingStory(false);
    }
  };

  if (value) {
    return (
      <div className="relative flex justify-center items-center p-4  rounded-[10px] bg-background/10 border-2 mt-3 ">
        <Image
          width={50}
          height={50}
          src={value}
          alt="Story Picture"
          className="rounded-full w-[50px] h-[50px]"
        />

        <button
          onClick={() => onChange("")}
          className="bg-rose-500 text-white p-1 rounded-full absolute top-1 right-1 shadow-sm"
          type="button"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <Input
      type="file"
      accept="image/*"
      className="text-white  my-2  w-full  rounded-[10px]"
      onChange={(e) => {
        onStoryPictureUpload({ e });
      }}
      value={value}
    />
  );
};
