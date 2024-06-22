"use client";

import { z } from "zod";
import { StoryFormSchema } from "@/lib/FormSchemas";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import MultiSelect from "@/components/multiselect";
import { useEffect, useState } from "react";
import { Content_Type, Interests, Visibility_type } from "@prisma/client";
import { StoryPictureUpload } from "@/components/file-upload";
import { v4 } from "uuid";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import StoryEditor from "@/components/Editor/Story_Editor";
import { content } from "@/lib/types";
import { useSupabaseUser } from "@/components/providers/supabase-user-provider";
import { createStory } from "@/lib/supabase/queries";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

const Page = () => {
  const [uploadingStoryPicture, setUploadingStoryPicture] = useState(false);
  const { state } = useSupabaseUser();
  const router = useRouter();

  const [allCategory, setAllCategory] = useState<
    {
      id: string;
      name:
        | "Horror"
        | "Thriller"
        | "Action"
        | "Mystery"
        | "Drama"
        | "ScienceFiction"
        | "Comedy"
        | "Romance";
    }[]
  >([]);

  const id = v4();

  useEffect(() => {
    if (!state.user) router.push("/login");
    const interestsList = Object.values(Interests).map((value, index) => ({
      id: index.toString(),
      name: Interests[value],
    }));
    setAllCategory(interestsList);
    console.log(interestsList);
  }, [state.user]);

  const storyUploadForm = useForm<z.infer<typeof StoryFormSchema>>({
    mode: "onChange",
    resolver: zodResolver(StoryFormSchema),
    defaultValues: {
      title: "",
      description: "",
      pictures: "",
      caption: "",
      category: [],
      body: "",
    },
  });

  const isStoryUploading = storyUploadForm.formState.isSubmitting;

  const onStorySubmit: SubmitHandler<z.infer<typeof StoryFormSchema>> = async (
    formData
  ) => {
    console.log(formData);

    if (state.user) {
      const data: content = {
        authorId: state.user.id,
        title: formData.title,
        description: formData.description,
        caption: formData.caption,
        category: formData.category as Interests[],
        body: formData.body,
        id: id,
        pictures: [formData.pictures],
        savedBy: 0,
        likes: 0,
        total_voters: 0,
        commentsCount: 0,
        type: Content_Type.STORY,
        visibility_type: Visibility_type.Public,
        createdAt: new Date(),
        modifiedAt: new Date(),
        isTrending: false,
      };

      const story = await createStory(data);
      if (story) {
        console.log(story);
        toast({
          title: "Story Uploaded Successfully!!",
        });
        router.push("/explore");
      } else {
        toast({
          title: "Some error occurred!!",
        });
      }
    }
  };

  return (
    <div className="flex flex-col h-screen w-full items-center">
      <div className="flex flex-col md:w-1/2 mt-10 ">
        <Form {...storyUploadForm}>
          <form
            onChange={() => {}}
            onSubmit={storyUploadForm.handleSubmit(onStorySubmit)}
            className="w-full text-black  mb-8 space-y-4 flex flex-col  "
          >
            <div className="flex  justify-center ">
              <div className="flex flex-col  w-full mx-7">
                <Label className="font-semibold text-white">
                  Title of the Story*
                </Label>
                <FormField
                  disabled={isStoryUploading}
                  control={storyUploadForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          type="text"
                          className=" text-white  my-2 rounded-[10px]"
                          placeholder="Ex: The Forgotten Symphony"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex  justify-center ">
              <div className="flex flex-col  w-full mx-7">
                <Label className="font-semibold text-white">
                  Description of the Story*
                </Label>
                <FormField
                  disabled={isStoryUploading}
                  control={storyUploadForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          rows={4}
                          className=" text-white  my-2 rounded-[10px]"
                          placeholder={`Ex: Set against the backdrop of war-torn Europe during the early 20th century, "The Forgotten Symphony" weaves a tale of love, loss, and the enduring power of music...`}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex  justify-center ">
              <div className="flex flex-col w-full mx-7">
                <Label htmlFor="interests" className="font-semibold text-white">
                  Choose categories of the story*
                </Label>

                <FormField
                  disabled={isStoryUploading}
                  control={storyUploadForm.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem className="my-2">
                      <FormControl>
                        <MultiSelect
                          options={allCategory}
                          selected={field.value}
                          onChange={field.onChange}
                          placeholder="Select your Category"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex  justify-center ">
              <div className="flex flex-col  w-full mx-7">
                <Label htmlFor="school" className="text-white">
                  Pictures*
                </Label>

                {uploadingStoryPicture ? (
                  <div className="flex text-white flex-1 justify-center items-center h-[300px]">
                    <Loader2 className="h-7 w-7 text-white animate-spin my-4" />
                    <p className="text-xs text-white ">Loading ...</p>
                  </div>
                ) : (
                  <FormField
                    disabled={isStoryUploading}
                    control={storyUploadForm.control}
                    name="pictures"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <StoryPictureUpload
                            onChange={field.onChange}
                            setUploadingStory={setUploadingStoryPicture}
                            storyId={id}
                            value={field.value}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            </div>

            <div className="flex  justify-center ">
              <div className="flex flex-col  w-full mx-7">
                <Label className="font-semibold text-white">Story*</Label>
                <FormField
                  disabled={isStoryUploading}
                  control={storyUploadForm.control}
                  name="body"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <StoryEditor onChange={field.onChange} id={id} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex  justify-center ">
              <div className="flex flex-col  w-full mx-7">
                <Label className="font-semibold text-white">
                  Caption for the Story*
                </Label>
                <FormField
                  disabled={isStoryUploading}
                  control={storyUploadForm.control}
                  name="caption"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          type="text"
                          className=" text-white  my-2 rounded-[10px]"
                          placeholder="Ex: In the echoes of the past, music holds the key to redemption"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="ghost"
              className="border-2 mx-7 text-white rounded-[10px] my-4  hover:bg-gray-500 hover:text-black font-semibold"
            >
              {isStoryUploading ? (
                <div className="flex text-white flex-1 justify-center items-center h-[300px]">
                  <Loader2 className="h-7 w-7 text-white animate-spin my-4" />
                  <p className="text-xs text-white ">Loading ...</p>
                </div>
              ) : (
                "Submit"
              )}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default Page;
