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
  addCommentToContent,
  addReplyToComment,
  checkIfLiked,
  followUser,
  getContent,
  getContentByUser,
  getContentLikes,
  toggleLikeContent,
} from "@/lib/supabase/queries";
import { commentWithChildren, contentWithUser } from "@/lib/types";
import { Content_Type } from "@prisma/client";
import { Ellipsis, Loader2, Mic, MicOff, Save } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { Suspense, useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { CommentForm } from "@/lib/FormSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const useIsSpeaking = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  return [isSpeaking, setIsSpeaking] as const;
};

const speak = async (
  htmlString: string | null,
  isSpeaking: boolean,
  setIsSpeaking: React.Dispatch<React.SetStateAction<boolean>>
) => {
  if (!htmlString) {
    console.error("No text provided.");
    return;
  }

  // Function to strip HTML tags and get plain text
  const stripHtmlTags = (html: string): string => {
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || div.innerText || "";
  };

  // Function to split text into chunks
  const splitTextIntoChunks = (text: string, chunkSize: number): string[] => {
    const regex = new RegExp(`.{1,${chunkSize}}`, "g");
    return text.match(regex) || [];
  };

  const text = stripHtmlTags(htmlString);
  const chunkSize = 150; // Adjust chunk size based on your needs
  const textChunks = splitTextIntoChunks(text, chunkSize);

  if ("speechSynthesis" in window && text) {
    // Wait for voices to be loaded
    const loadVoices = new Promise((resolve) => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length !== 0) {
        resolve(voices);
      } else {
        window.speechSynthesis.onvoiceschanged = () => {
          resolve(window.speechSynthesis.getVoices());
        };
      }
    });

    await loadVoices;

    const speakChunk = (chunk: string) => {
      return new Promise<void>((resolve, reject) => {
        const utterance = new SpeechSynthesisUtterance(chunk);

        utterance.onstart = () => {
          console.log("Speech started");
          setIsSpeaking(true);
        };
        utterance.onend = () => {
          console.log("Speech ended");
          setIsSpeaking(false);
          resolve();
        };
        utterance.onerror = (event) => {
          console.error("Speech synthesis error", event);
          setIsSpeaking(false);
          reject(event);
        };

        window.speechSynthesis.speak(utterance);
      });
    };

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      for (const chunk of textChunks) {
        if (window.speechSynthesis.speaking) {
          window.speechSynthesis.cancel();
          setIsSpeaking(false);
          break;
        }
        await speakChunk(chunk);
      }
    }
  } else {
    console.error("Sorry, your browser doesn't support text to speech.");
  }
};

const Page = () => {
  const { state } = useSupabaseUser();
  const searchParams = useSearchParams();
  const router = useRouter();
  const story_id = searchParams.get("id");
  const [content, setcontent] = useState<contentWithUser | null>(null);
  const [authorContents, setAuthorContents] = useState<contentWithUser[]>([]);
  const [isSpeaking, setIsSpeaking] = useIsSpeaking();
  const [liked, setLiked] = useState<boolean | null>(null);
  const [likes, setLikes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [replyToCommentId, setReplyToCommentId] = useState<string>("");
  const [showComments, setShowComments] = useState(false);

  const commentForm = useForm<z.infer<typeof CommentForm>>({
    mode: "onChange",
    resolver: zodResolver(CommentForm),
    defaultValues: {
      body: "",
    },
  });

  const isSubmitting = commentForm.formState.isSubmitting;

  const onCommentSubmit: SubmitHandler<z.infer<typeof CommentForm>> = async (
    formData
  ) => {
    console.log(formData);

    try {
      if (state.user && story_id) {
        if (replyToCommentId) {
          const data = {
            body: formData.body,
            authorId: state.user.id,
            contentId: story_id,
            parentId: replyToCommentId,
          };

          const res = await addReplyToComment(data);
          toast({
            title: "Reply added successfully",
          });
        } else {
          const data = {
            body: formData.body,
            authorId: state.user.id,
            contentId: story_id,
          };

          const res = await addCommentToContent(data);
          toast({
            title: "Comment added successfully",
          });
        }

        commentForm.reset();
        router.refresh();
      } else {
        toast({
          title: "Please login to comment",
        });
        commentForm.reset();
      }
    } catch (error) {
      console.log(error);
      toast({
        title: "Unknown error occured",
      });
    }
  };

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
        }
        if (story_id) {
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
      if (!state.user) {
        toast({
          title: "Login to like to post",
        });
      }
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

  const handleButtonClick = (htmlString: string | null) => {
    speak(htmlString, isSpeaking, setIsSpeaking);
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

  // const speak = async (htmlString: string | null) => {
  //   if (!htmlString) {
  //     console.error("No text provided.");
  //     return;
  //   }

  //   // Function to strip HTML tags and get plain text
  //   const stripHtmlTags = (html: string): string => {
  //     const div = document.createElement("div");
  //     div.innerHTML = html;
  //     return div.textContent || div.innerText || "";
  //   };

  //   // Function to split text into chunks
  //   const splitTextIntoChunks = (text: string, chunkSize: number): string[] => {
  //     const regex = new RegExp(`.{1,${chunkSize}}`, "g");
  //     return text.match(regex) || [];
  //   };

  //   const text = stripHtmlTags(htmlString);
  //   const chunkSize = 150; // Adjust chunk size based on your needs
  //   const textChunks = splitTextIntoChunks(text, chunkSize);

  //   if ("speechSynthesis" in window && text) {
  //     // Wait for voices to be loaded
  //     const loadVoices = new Promise((resolve) => {
  //       const voices = window.speechSynthesis.getVoices();
  //       if (voices.length !== 0) {
  //         resolve(voices);
  //       } else {
  //         window.speechSynthesis.onvoiceschanged = () => {
  //           resolve(window.speechSynthesis.getVoices());
  //         };
  //       }
  //     });

  //     await loadVoices;

  //     const speakChunk = (chunk: string) => {
  //       return new Promise<void>((resolve, reject) => {
  //         const utterance = new SpeechSynthesisUtterance(chunk);

  //         utterance.onstart = () => {
  //           console.log("Speech started");
  //           setIsSpeaking(true);
  //         };
  //         utterance.onend = () => {
  //           console.log("Speech ended");
  //           setIsSpeaking(false);
  //           resolve();
  //         };
  //         utterance.onerror = (event) => {
  //           console.error("Speech synthesis error", event);
  //           setIsSpeaking(false);
  //           reject(event);
  //         };

  //         window.speechSynthesis.speak(utterance);
  //       });
  //     };

  //     for (const chunk of textChunks) {
  //       await speakChunk(chunk);
  //     }
  //   } else {
  //     console.error("Sorry, your browser doesn't support text to speech.");
  //   }
  // };

  useEffect(() => {
    if (story_id) {
      const getStory = async () => {
        const story = await getContent(story_id);
        setcontent(story);
      };

      const getContents = async () => {
        if (content) {
          const contents = await getContentByUser(content.authorId);
          if (contents) {
            setAuthorContents(contents);
          }
        }
      };
      if (!content) {
        getStory();
      }
      getContents();
    }
  }, [story_id, content]);

  const renderComments = (comments: commentWithChildren[] | undefined) => {
    if (!comments) return null;

    return (
      <div className="comments-container space-y-4">
        {comments.map((comment, index) => (
          <div className="comment-wrapper" key={index}>
            {/* Main Comment */}
            {!comment.parentId && ( // Render only if it's a top-level comment
              <div className="flex space-x-2 items-center w-[85%] mt-4">
                <Link
                  href={`/explore/profile?id=${comment.authorId}`}
                  className={`flex rounded-full cursor-pointer `}
                >
                  <Image
                    src={
                      comment.author?.profile_picture ||
                      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4CUkdaTo6Na0w9vdr4Km_0Sx0hTZ5eecjPCQ89fj87A&s"
                    }
                    alt="author_image"
                    width={40}
                    height={40}
                    className="rounded-full object-cover bg-black p-2 m-auto"
                  />
                </Link>
                <div className="flex flex-col w-[90%]">
                  <Link
                    href={`/explore/profile?id=${comment.authorId}`}
                    className={`flex cursor-pointer font-bold `}
                  >
                    {comment.author.full_name}
                  </Link>
                  <div className="flex">{comment.body}</div>
                </div>
              </div>
            )}

            {/* Reply Button */}
            {!replyToCommentId &&
              !comment.parentId && ( // Only show reply button for top-level comments
                <button
                  onClick={() => {
                    commentForm.reset({
                      body: `@${comment.author.full_name?.replaceAll(
                        " ",
                        "_"
                      )} `,
                    });
                    setReplyToCommentId(comment.id); // Set the reply target ID
                    commentForm.setFocus("body");
                  }}
                  className="text-blue-500 cursor-pointer ml-10"
                >
                  Reply
                </button>
              )}

            {/* Replies */}
            {comment.children && ( // Render replies if they exist
              <div className="replies-container ml-10 mt-2 space-y-2">
                {renderReplies(comment.children)}{" "}
                {/* Updated to renderReplies */}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  // Separate function to render replies
  const renderReplies = (replies: commentWithChildren[]) => {
    return replies.map((reply, index) => (
      <div className="flex space-x-2 items-center mt-2" key={index}>
        <Link
          href={`/explore/profile?id=${reply.authorId}`}
          className={`flex rounded-full cursor-pointer`}
        >
          <Image
            src={
              reply.author?.profile_picture ||
              "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4CUkdaTo6Na0w9vdr4Km_0Sx0hTZ5eecjPCQ89fj87A&s"
            }
            alt="author_image"
            width={40}
            height={40}
            className="rounded-full object-cover bg-black p-2 m-auto"
          />
        </Link>
        <div className="flex flex-col w-[90%]">
          <Link
            href={`/explore/profile?id=${reply.authorId}`}
            className={`flex cursor-pointer font-bold `}
          >
            {reply.author.full_name}
          </Link>
          <div className="flex">{reply.body}</div>
        </div>
      </div>
    ));
  };

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
              className="cursor-pointer hover:text-white text-[#bbaf95]"
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
              <div className={`flex  text-white items-center justify-center `}>
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
                        🗨️ {content.commentsCount}
                      </div>
                    </>
                  )}

                  {content.type !== Content_Type.ART && (
                    <button
                      className={`flex  items-center justify-center  cursor-pointer`}
                      onClick={() => handleButtonClick(content.body)}
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
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="flex space-x-2">
              <Button className="flex bg-transparent text-[#c8b896] hover:bg-gray-500 hover:text-black  rounded-[10px]">
                <Save />
              </Button>
              <Button className="flex bg-transparent text-[#c8b896] hover:bg-gray-500 hover:text-black rounded-[10px]">
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

          <div className="flex flex-col items-center justify-center md:space-x-10 md:flex-row my-4">
            {content.pictures &&
              content.pictures.length > 0 &&
              content.pictures.map((picture, index) => (
                <Image
                  key={index}
                  src={picture}
                  alt="content_image"
                  width={300}
                  height={300}
                  className={`rounded-[25px] object-cover w-[300px] h-[300px] md:px-1   py-4`}
                />
              ))}
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
                    🗨️ {content.commentsCount}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex space-x-2">
              <Button className="flex bg-transparent text-[#c8b896] hover:bg-gray-500 hover:text-black  rounded-[10px]">
                <Save />
              </Button>
              <Button className="flex bg-transparent text-[#c8b896] hover:bg-gray-500 hover:text-black rounded-[10px]">
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

          <div className="flex  flex-col w-full  space-x-2 md:p-2 py-2">
            {showComments && (
              <div className="overflow-y-auto">
                {renderComments(content.comments)}
              </div>
            )}

            {showComments && (
              <div
                className="flex px-2 cursor-pointer text-gray-500 "
                onClick={() => setShowComments((prev) => !prev)}
              >
                Hide comments
              </div>
            )}

            {content.commentsCount > 0 && !showComments && (
              <div
                className="flex px-2 cursor-pointer text-gray-500 "
                onClick={() => setShowComments((prev) => !prev)}
              >
                View All {content.commentsCount} comments
              </div>
            )}

            <div className="flex">
              <Form {...commentForm}>
                <form
                  onSubmit={commentForm.handleSubmit(onCommentSubmit)}
                  className="w-full text-black  mb-8 space-y-4 flex  items-center justify-center  "
                >
                  <div className="flex justify-center flex-1 py-2">
                    <div className="flex flex-col w-full">
                      <FormField
                        disabled={isSubmitting}
                        control={commentForm.control}
                        name="body"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                className="text-white border-0 border-b-2  rounded-[10px] focus:ring-0 focus:border-transparent"
                                placeholder="Add a Comment"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </form>
              </Form>
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
              className="cursor-pointer w-1/2 justify-end flex text-lg   hover:text-white text-[#bbaf95]"
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
                      className={`flex  text-white items-center justify-center text-sm`}
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
                                🗨️ {content.commentsCount}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <Button className="flex bg-transparent text-[#c8b896] hover:bg-gray-500 hover:text-black  rounded-[10px]">
                          <Save />
                        </Button>
                        <Button className="flex bg-transparent text-[#c8b896] hover:bg-gray-500 hover:text-black rounded-[10px]">
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
