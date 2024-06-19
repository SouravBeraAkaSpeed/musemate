"use client";

import StoryEditor from "@/components/Editor/Story_Editor";
import {
  ProfileBannerUpload,
  ProfilePictureUpload,
} from "@/components/file-upload";
import MultiSelect from "@/components/multiselect";
import { useSupabaseUser } from "@/components/providers/supabase-user-provider";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { OnboardingFormSchema } from "@/lib/FormSchemas";
import { onBoardUser } from "@/lib/supabase/queries";
import { user } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Audience_type, Interests, User_type } from "@prisma/client";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";

const Page = () => {
  const router = useRouter();
  const { state } = useSupabaseUser();

  const [allInterest, setAllInterest] = useState<
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
  const [uploadingProfilePicture, setUploadingProfilePicture] = useState(false);
  const [uploadingProfileBanner, setUploadingProfileBanner] = useState(false);
  const onBoardingForm = useForm<z.infer<typeof OnboardingFormSchema>>({
    mode: "onChange",
    resolver: zodResolver(OnboardingFormSchema),
    defaultValues: {
      fullname: "",
      about: "",
      profile_picture: "",
      phone_no: "",
      interests: [],
      audience_type: undefined,
      account_type: undefined,
      tagline: "",
      banner: "",
    },
  });

  const isOnBoardingLoading = onBoardingForm.formState.isSubmitting;

  useEffect(() => {
    const interestsList = Object.values(Interests).map((value, index) => ({
      id: index.toString(),
      name: Interests[value],
    }));
    setAllInterest(interestsList);
    console.log(interestsList);
  }, []);

  const onBoardingSubmit: SubmitHandler<
    z.infer<typeof OnboardingFormSchema>
  > = async (formData) => {
    if (state.user?.email) {
      const user: user = {
        id: state.user.id,
        about: formData.about,
        audience_type: formData.audience_type as Audience_type,
        type: formData.account_type as User_type,
        email: state.user.email,
        full_name: formData.fullname,
        onboarded: true,
        phone_no: formData.phone_no,
        profile_picture: formData.profile_picture,
        Interests: formData.interests
          ? formData.interests.map((interest) => {
              return interest as Interests;
            })
          : [],
        tagline: formData.tagline,
        banner: formData.banner,
      };
      const res = await onBoardUser(user);

      if (res) {
        toast({
          title: "User OnBoarded",
          description: "You are Successfully OnBoarded !!",
        });

        router.push("/explore");
      }
    }
  };
  return (
    <div className="flex flex-col  items-center justify-center w-full ">
      <div
        className="flex flex-col md:min-w-[600px] h-full border-2 
        shadow-lg mt-10 rounded-[10px] mb-10"
      >
        <div className="w-full p-5 flex flex-col">
          <h1 className="text-xl font-bold py-2"> Create Profile</h1>
          <hr />
        </div>

        <div className="flex flex-col w-full">
          <Form {...onBoardingForm}>
            <form
              onChange={() => {}}
              onSubmit={onBoardingForm.handleSubmit(onBoardingSubmit)}
              className="w-full text-black  mb-8 space-y-4 flex flex-col  "
            >
              {uploadingProfilePicture ? (
                <div className="flex text-white flex-1 justify-center items-center h-[300px]">
                  <Loader2 className="h-7 w-7 text-white animate-spin my-4" />
                  <p className="text-xs text-white ">Loading ...</p>
                </div>
              ) : (
                <div className="flex  justify-center ">
                  <div className="flex flex-col  w-full mx-7">
                    <Label
                      htmlFor="profile_picture_url"
                      className="font-semibold text-white"
                    >
                      Profile Picture
                    </Label>
                    <FormField
                      disabled={isOnBoardingLoading}
                      control={onBoardingForm.control}
                      name="profile_picture"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <ProfilePictureUpload
                              value={field.value}
                              onChange={field.onChange}
                              setUploadinglogo={setUploadingProfilePicture}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}

              {uploadingProfileBanner ? (
                <div className="flex text-white flex-1 justify-center items-center h-[300px]">
                  <Loader2 className="h-7 w-7 text-white animate-spin my-4" />
                  <p className="text-xs text-white ">Loading ...</p>
                </div>
              ) : (
                <div className="flex  justify-center ">
                  <div className="flex flex-col  w-full mx-7">
                    <Label
                      htmlFor="profile_picture_url"
                      className="font-semibold text-white"
                    >
                      Profile Banner
                    </Label>
                    <FormField
                      disabled={isOnBoardingLoading}
                      control={onBoardingForm.control}
                      name="banner"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <ProfileBannerUpload
                              value={field.value}
                              onChange={field.onChange}
                              setUploadinglogo={setUploadingProfileBanner}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}

              <div className="flex  justify-center ">
                <div className="flex flex-col  w-full mx-7">
                  <Label className="font-semibold text-white">Full Name</Label>
                  <FormField
                    disabled={isOnBoardingLoading}
                    control={onBoardingForm.control}
                    name="fullname"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type="text"
                            className=" text-white  my-2 rounded-[10px]"
                            placeholder="Ex: John Smith"
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
                    Profile Tagline
                  </Label>
                  <FormField
                    disabled={isOnBoardingLoading}
                    control={onBoardingForm.control}
                    name="tagline"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type="text"
                            className=" text-white  my-2 rounded-[10px]"
                            placeholder="Ex: I'm a Professional Artist"
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
                    Phone Number
                  </Label>
                  <FormField
                    disabled={isOnBoardingLoading}
                    control={onBoardingForm.control}
                    name="phone_no"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            type="text"
                            className=" text-white  my-2 rounded-[10px]"
                            placeholder="Ex: 7787398902"
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
                  <Label className="font-semibold text-white">About</Label>
                  <FormField
                    disabled={isOnBoardingLoading}
                    control={onBoardingForm.control}
                    name="about"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <StoryEditor
                            onChange={field.onChange}
                            id={state.user?.id}
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
                  <Label className="font-semibold text-white">User Type</Label>
                  <FormField
                    disabled={isOnBoardingLoading}
                    control={onBoardingForm.control}
                    name="audience_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <SelectTrigger className="w-full my-2 text-white font-semibold rounded-[10px] ">
                              <SelectValue
                                placeholder="Select  your type"
                                className="text-white  my-2  w-full"
                              />
                            </SelectTrigger>
                            <SelectContent className=" text-white my-2 w-full">
                              <SelectGroup className="my-2">
                                <SelectItem
                                  value={Audience_type.Artist}
                                  className="font-semibold text-white"
                                >
                                  Artist
                                </SelectItem>

                                <SelectItem
                                  value={Audience_type.Audience}
                                  className="font-semibold text-white"
                                >
                                  Audience
                                </SelectItem>
                              </SelectGroup>
                            </SelectContent>
                          </Select>
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
                    Account Type
                  </Label>
                  <FormField
                    disabled={isOnBoardingLoading}
                    control={onBoardingForm.control}
                    name="account_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <SelectTrigger className="w-full my-2 text-white font-semibold rounded-[10px] ">
                              <SelectValue
                                placeholder="Select your account type"
                                className="text-white  my-2  w-full"
                              />
                            </SelectTrigger>
                            <SelectContent className=" text-white my-2 w-full">
                              <SelectGroup className="my-2">
                                <SelectItem
                                  value={User_type.private}
                                  className="font-semibold text-white"
                                >
                                  Private
                                </SelectItem>

                                <SelectItem
                                  value={User_type.public}
                                  className="font-semibold text-white"
                                >
                                  Public
                                </SelectItem>
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="flex  justify-center ">
                <div className="flex flex-col w-full mx-7">
                  <Label
                    htmlFor="interests"
                    className="font-semibold text-white"
                  >
                    Interests
                  </Label>

                  <FormField
                    disabled={isOnBoardingLoading}
                    control={onBoardingForm.control}
                    name="interests"
                    render={({ field }) => (
                      <FormItem className="my-2">
                        <FormControl>
                          <MultiSelect
                            options={allInterest}
                            selected={field.value}
                            onChange={field.onChange}
                            placeholder="Select your interests"
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
                {isOnBoardingLoading ? (
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
    </div>
  );
};

export default Page;
