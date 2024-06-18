"use client";
import { useSupabaseUser } from "@/components/providers/supabase-user-provider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/use-toast";
import {
  checkIfLiked,
  followUser,
  getContent,
  getContentByUser,
  getContentLikes,
  toggleLikeContent,
} from "@/lib/supabase/queries";
import { contentWithUser } from "@/lib/types";
import { Ellipsis, Loader2, Mic, MicOff, Save } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { Suspense, useEffect, useState } from "react";

const Page = () => {
  const { state } = useSupabaseUser();
  const searchParams = useSearchParams();
  const router = useRouter();
  const story_id = searchParams.get("id");
  const [content, setcontent] = useState<contentWithUser | null>(null);
  const [authorContents, setAuthorContents] = useState<contentWithUser[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [liked, setLiked] = useState<boolean | null>(null);
  const [likes, setLikes] = useState(0);
  const [loading, setLoading] = useState(true);

  const FollowUser = async ({
    followerId,
    userId,
  }: {
    followerId: string | undefined | null;
    userId: string;
  }) => {
    if (followerId) {
      await followUser(followerId, userId).then((res) => {
        if (res) {
          toast({
            title: "Following",
            description: "Successfully Followed",
          });
        } else {
          toast({
            title: "Unable to follow",
          });
        }
      });
    } else {
      toast({
        title: "Login to Follow",
        description: "Kindly Login to Follow",
      });
    }
  };

  useEffect(() => {
    const fetchLikedStatus = async () => {
      try {
        if (state.user && story_id) {
          const isLiked = await checkIfLiked(state.user.id, story_id);
          setLiked(isLiked);

          const numlikes = await getContentLikes(story_id);
          if (numlikes) setLikes(numlikes);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchLikedStatus();
  }, [state.user, story_id]);

  const handleLikeToggle = async () => {
    try {
      if (state.user && story_id) {
        const message = await toggleLikeContent(state.user.id, story_id);
        console.log(message);

        if (message) {
          if (liked) {
            setLikes(likes - 1);
          } else {
            setLikes(likes + 1);
          }

          setLiked(!liked);
        } else {
          return null;
        }
      } else {
        return null;
      }
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  function formatDate(date: Date): {
    yyyy_mm_dd: string;
    month_day_year: string;
  } {
    // Get year, month, and day from the date object
    const year = date.getFullYear();
    const month = date.toLocaleString("en", { month: "short" }); // Abbreviated month name (e.g., "Feb")
    const day = date.getDate();

    // Format the date as yyyy-mm-dd
    const yyyy_mm_dd = `${year}-${month.padStart(2, "0")}-${day
      .toString()
      .padStart(2, "0")}`;

    // Format the date as Month day, year
    const month_day_year = `${month} ${day}, ${year}`;

    return { yyyy_mm_dd, month_day_year };
  }

  function speak(text: string | null): void {
    // Check if the browser supports speech synthesis
    if ("speechSynthesis" in window && text) {
      // Cancel any ongoing speech
      if (window.speechSynthesis.speaking) {
        console.log("testing..");
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      } else {
        // Create a new speech synthesis utterance instance
        const utterance = new SpeechSynthesisUtterance(text);

        // Optionally, you can set properties on the utterance
        // utterance.lang = 'en-US'; // Set the language
        // utterance.pitch = 1; // Set the pitch
        // utterance.rate = 1; // Set the rate (speed)
        // utterance.volume = 1; // Set the volume

        // Speak the utterance
        window.speechSynthesis.speak(utterance);
        setIsSpeaking(true);
      }
    } else {
      console.error("Sorry, your browser doesn't support text to speech.");
    }
  }

  useEffect(() => {
    if (story_id) {
      const getStory = async () => {
        const story = await getContent(story_id);
        setcontent(story);
      };

      const getContents = async () => {
        if (state.user) {
          const contents = await getContentByUser(state.user.id);
          if (contents) {
            setAuthorContents(contents);
          }
        }
      };

      getStory();
      getContents();
    }
  }, [story_id, state.user]);

  if (!content) {
    return (
      <div className="flex text-white flex-1 justify-center items-center h-[300px]">
        <Loader2 className="h-7 w-7 text-white animate-spin my-4" />
        <p className="text-xs text-white ">Loading ...</p>
      </div>
    );
  }

  return (
    <div className=" flex flex-col items-center justify-center w-full">
      <div className="md:w-[50%] w-[90%] flex flex-col">
        <div className="flex  flex-col ">
          <div className="flex  my-4 mt-[100px]">
            <div className="flex flex-col  ">
              <div
                className={`flex w-full  md:text-5xl text-3xl 
                 font-bold`}
              >
                {content?.caption}
              </div>
            </div>
          </div>

          <div className="flex items-center  space-x-2 my-4 ">
            <Link
              href={`/explore/profile?id=${content.authorId}`}
              className="flex rounded-full cursor-pointer"
            >
              <Image
                src={
                  content.author.profile_picture
                    ? content.author.profile_picture
                    : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4CUkdaTo6Na0w9vdr4Km_0Sx0hTZ5eecjPCQ89fj87A&s"
                }
                alt="author_image"
                width={40}
                height={40}
                className="rounded-full object-cover bg-black  p-2 m-auto"
              />
            </Link>
            <Link
              href={`/explore/profile?id=${content.authorId}`}
              className={`flex cursor-pointer `}
            >
              {content.author.full_name} .{" "}
            </Link>
            <div className={`flex `}>
              {formatDate(content.createdAt).month_day_year} .
            </div>

            <div
              className="cursor-pointer hover:text-[#D5BF90] text-[#bbaf95]"
              onClick={() =>
                FollowUser({
                  followerId: state.user?.id,
                  userId: content?.authorId,
                })
              }
            >
              Follow
            </div>

            {content.isTrending && (
              <div
                className={`flex  text-[#D5BF90] items-center justify-center `}
              >
                {" "}
                #OnTrending
              </div>
            )}
          </div>

          <div className="flex my-4">
            <div className="flex flex-1  justify-start items-center">
              <div className="flex flex-col md:flex-row items-center justify-center md:space-y-0 space-y-2 md:space-x-4 ">
                <div className="hidden md:flex md:space-x-4 space-x-2">
                  <div className="font-bold text-sm">{content.type}</div>
                  {content.category.map((c, index) => (
                    <div className="font-bold text-sm" key={index}>
                      {c}
                    </div>
                  ))}
                </div>

                <div className="flex space-x-4">
                  {!loading && (
                    <>
                      <div
                        className={`flex  items-center justify-center cursor-pointer`}
                        onClick={handleLikeToggle}
                      >
                        {liked ? <>👏</> : <>👍</>} {likes}
                      </div>
                      <div className={`flex  items-center justify-center `}>
                        🗨️ {content.comments}
                      </div>
                    </>
                  )}
                  <div
                    className={`flex  items-center justify-center  cursor-pointer`}
                    onClick={() => speak(content.body)}
                  >
                    {isSpeaking ? (
                      <>
                        <MicOff className="mx-1" /> Stop
                      </>
                    ) : (
                      <>
                        <Mic className="mx-1" /> Listen
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex space-x-2">
              <Button className="flex bg-transparent text-[#c8b896] hover:bg-[#D5BF90] hover:text-black  rounded-[10px]">
                <Save />
              </Button>
              <Button className="flex bg-transparent text-[#c8b896] hover:bg-[#D5BF90] hover:text-black rounded-[10px]">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Ellipsis />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-[170px] rounded-[10px]">
                    <DropdownMenuCheckboxItem
                      className="cursor-pointer"
                      onClick={() =>
                        FollowUser({
                          followerId: state.user?.id,
                          userId: content?.authorId,
                        })
                      }
                    >
                      Follow Author
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem>
                      Report Author
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem>
                      Mute Author
                    </DropdownMenuCheckboxItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </Button>
            </div>
          </div>

          <div className="flex flex-col my-4">
            <div className="flex py-2 rounded-lg items-center justify-center text-xl font-bold">
              Title : {content.title}
            </div>

            <div
              className="ProseMirror whitespace-pre-line  text-justify py-4 rounded-lg"
              style={{ whiteSpace: "pre-line" }}
              dangerouslySetInnerHTML={{
                __html: content.body as string | TrustedHTML,
              }}
            />
          </div>

          <div className="flex my-4 mt-[100px]">
            <div className="flex flex-1  justify-start items-center">
              <div className="flex flex-col md:flex-row items-center justify-center md:space-y-0 space-y-2 md:space-x-4 ">
                <div className="hidden md:flex md:space-x-4 space-x-2">
                  <div className="font-bold text-sm">{content.type}</div>
                  {content.category.map((c, index) => (
                    <div className="font-bold text-sm" key={index}>
                      {c}
                    </div>
                  ))}
                </div>

                <div className="flex space-x-4">
                  <div className={`flex  items-center justify-center `}>
                    👏 {content.likes}
                  </div>
                  <div className={`flex  items-center justify-center `}>
                    🗨️ {content.comments}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex space-x-2">
              <Button className="flex bg-transparent text-[#c8b896] hover:bg-[#D5BF90] hover:text-black  rounded-[10px]">
                <Save />
              </Button>
              <Button className="flex bg-transparent text-[#c8b896] hover:bg-[#D5BF90] hover:text-black rounded-[10px]">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Ellipsis />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-[170px] rounded-[10px]">
                    <DropdownMenuCheckboxItem
                      className="cursor-pointer"
                      onClick={() =>
                        FollowUser({
                          followerId: state.user?.id,
                          userId: content?.authorId,
                        })
                      }
                    >
                      Follow Author
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem>
                      Report Author
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem>
                      Mute Author
                    </DropdownMenuCheckboxItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </Button>
            </div>
          </div>

          <div className="flex items-center  mt-[150px] space-x-2 my-3 ">
            <div className="flex rounded-full cursor-pointer">
              <Image
                src={
                  content.author.profile_picture
                    ? content.author.profile_picture
                    : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4CUkdaTo6Na0w9vdr4Km_0Sx0hTZ5eecjPCQ89fj87A&s"
                }
                alt="author_image"
                width={100}
                height={100}
                className="rounded-full object-cover bg-black  p-2 m-auto"
              />
            </div>
          </div>

          <div className="flex  w-full space-x-2 my-2 items-center justify-center ">
            <div
              className={`flex cursor-pointer justify-start text-2xl  w-1/2`}
            >
              Written by {content.author.full_name} .{" "}
            </div>

            <div
              className="cursor-pointer w-1/2 justify-end flex text-lg   hover:text-[#D5BF90] text-[#bbaf95]"
              onClick={() =>
                FollowUser({
                  followerId: state.user?.id,
                  userId: content?.authorId,
                })
              }
            >
              <div className="border-2 rounded-[20px] p-2 px-4 hover:border-[#cfab5d]">
                Follow
              </div>
            </div>
          </div>
          <div className="flex  w-full space-x-2 my-2  ">
            <div className={`flex cursor-pointer justify-start text-lg  `}>
              {content.author.tagline}
            </div>
          </div>

          <hr className="my-10" />

          <div className="flex  w-full space-x-2 my-2 ">
            <div
              className={`flex cursor-pointer justify-start text-lg font-bold  `}
            >
              More from {content.author.full_name}
            </div>
          </div>

          <div className="flex w-full flex-col">
            {authorContents.map((content, index) => (
              <div
                key={index}
                className={`flex flex-col my-2  w-full  rounded-[10px]  
                `}
              >
                <div className="flex items-center  space-x-2 p-2">
                  <Link
                    href={`/explore/profile?id=${content.authorId}`}
                    className="flex rounded-full cursor-pointer"
                  >
                    <Image
                      src={
                        content.author.profile_picture
                          ? content.author.profile_picture
                          : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4CUkdaTo6Na0w9vdr4Km_0Sx0hTZ5eecjPCQ89fj87A&s"
                      }
                      alt="author_image"
                      width={40}
                      height={40}
                      className="rounded-full object-cover bg-black  p-2 m-auto"
                    />
                  </Link>
                  <Link
                    href={`/explore/profile?id=${content.authorId}`}
                    className={`flex cursor-pointer text-sm`}
                  >
                    {content.author.full_name} .{" "}
                  </Link>

                  {content.isTrending && (
                    <div
                      className={`flex  text-[#D5BF90] items-center justify-center text-sm`}
                    >
                      {" "}
                      #OnTrending
                    </div>
                  )}
                </div>
                <div className={`flex py-4`}>
                  <div className="flex  flex-col flex-1">
                    <div className="flex  ">
                      <div
                        className="flex flex-col cursor-pointer "
                        onClick={() =>
                          router.push(`/explore/story?id=${content.id}`)
                        }
                      >
                        <div
                          className={`flex w-full  p-2 text-lg text-justify font-bold`}
                        >
                          {content.caption}
                        </div>

                        <div className="flex w-full flex-col p-2">
                          <div className="w-full font-bold ">
                            Title - {content.title}
                          </div>
                          <div className="w-full text-gray-500">
                            {content.description}...
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex px-2">
                      <div className="flex flex-1  justify-start items-center">
                        <div className="flex flex-col md:flex-row  md:space-y-0 md:space-x-3 md:items-center space-y-2 ">
                          <div className="flex md:space-x-4 space-x-2">
                            <div className="font-bold text-sm">
                              {content.type}
                            </div>
                            {content.category.map((c, index) => (
                              <div className="font-bold text-sm" key={index}>
                                {c}
                              </div>
                            ))}
                          </div>

                          {!loading && (
                            <div className="flex space-x-4">
                              <div
                                className={`flex  items-center justify-center cursor-pointer `}
                                onClick={handleLikeToggle}
                              >
                                {liked ? <>👏</> : <>👍</>} {likes}
                              </div>
                              <div
                                className={`flex  items-center justify-center `}
                              >
                                🗨️ {content.comments}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <Button className="flex bg-transparent text-[#c8b896] hover:bg-[#D5BF90] hover:text-black  rounded-[10px]">
                          <Save />
                        </Button>
                        <Button className="flex bg-transparent text-[#c8b896] hover:bg-[#D5BF90] hover:text-black rounded-[10px]">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Ellipsis />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-[170px] rounded-[10px]">
                              <DropdownMenuCheckboxItem
                                className="cursor-pointer"
                                onClick={() =>
                                  FollowUser({
                                    followerId: state.user?.id,
                                    userId: content.authorId,
                                  })
                                }
                              >
                                Follow Author
                              </DropdownMenuCheckboxItem>
                              <DropdownMenuCheckboxItem>
                                Report Author
                              </DropdownMenuCheckboxItem>
                              <DropdownMenuCheckboxItem>
                                Mute Author
                              </DropdownMenuCheckboxItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex  w-full space-x-2 my-10 ">
            <Link
              href={`/explore/profile?id=${content.authorId}`}
              className={`flex cursor-pointer justify-start text-lg border-2 rounded-[20px] font-bold p-2  `}
            >
              See all from {content.author.full_name}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

const SuspendedPage = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <Page />
  </Suspense>
);

export default SuspendedPage;