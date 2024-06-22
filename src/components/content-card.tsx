"use client";
import { commentWithChildren, content, contentWithUser } from "@/lib/types";
import { Menubar } from "@radix-ui/react-menubar";
import { Ellipsis, Loader2, Menu, Save, ThumbsUp, Users } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  addCommentToContent,
  addReplyToComment,
  checkIfLiked,
  followUser,
  toggleLikeContent,
} from "@/lib/supabase/queries";
import { toast } from "./ui/use-toast";
import { useSupabaseUser } from "./providers/supabase-user-provider";
import { Content_Type, Interests } from "@prisma/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { CommentForm } from "@/lib/FormSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "./ui/form";
import { Label } from "./ui/label";
import { Input } from "./ui/input";

const ContentCard = ({
  content,
  isPopular,
  type,
}: {
  content: contentWithUser;
  isPopular: boolean;
  type: string;
}) => {
  console.log(content);
  const { state } = useSupabaseUser();
  const [replyToCommentId, setReplyToCommentId] = useState<string>("");
  const [showComments, setShowComments] = useState(false);
  const router = useRouter();
  const [liked, setLiked] = useState<boolean | null>(null);
  const [likes, setLikes] = useState(content.likes);
  const [loading, setLoading] = useState(true);

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
      if (state.user) {
        if (replyToCommentId) {
          const data = {
            body: formData.body,
            authorId: state.user.id,
            contentId: content.id,
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
            contentId: content.id,
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

  useEffect(() => {
    const fetchLikedStatus = async () => {
      try {
        if (state.user) {
          const isLiked = await checkIfLiked(state.user.id, content.id);
          setLiked(isLiked);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchLikedStatus();
  }, [state.user, content.id]);

  const handleLikeToggle = async () => {
    try {
      if (!state.user) {
        toast({
          title: "Login to like to post",
        });
      }
      if (state.user) {
        const message = await toggleLikeContent(state.user.id, content.id);
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
                  className={`flex rounded-full cursor-pointer ${
                    type === "explore" && "pl-4 md:pl-0"
                  }`}
                >
                  <Image
                    src={
                      comment.author?.profile_picture ||
                      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4CUkdaTo6Na0w9vdr4Km_0Sx0hTZ5eecjPCQ89fj87A&s"
                    }
                    alt="author_image"
                    width={isPopular ? 30 : 40}
                    height={isPopular ? 30 : 40}
                    className="rounded-full object-cover bg-black p-2 m-auto"
                  />
                </Link>
                <div className="flex flex-col w-[90%]">
                  <Link
                    href={`/explore/profile?id=${comment.authorId}`}
                    className={`flex cursor-pointer font-bold ${
                      isPopular && "text-sm"
                    }`}
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
          className={`flex rounded-full cursor-pointer ${
            type === "explore" && "pl-4 md:pl-0"
          }`}
        >
          <Image
            src={
              reply.author?.profile_picture ||
              "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4CUkdaTo6Na0w9vdr4Km_0Sx0hTZ5eecjPCQ89fj87A&s"
            }
            alt="author_image"
            width={isPopular ? 30 : 40}
            height={isPopular ? 30 : 40}
            className="rounded-full object-cover bg-black p-2 m-auto"
          />
        </Link>
        <div className="flex flex-col w-[90%]">
          <Link
            href={`/explore/profile?id=${reply.authorId}`}
            className={`flex cursor-pointer font-bold ${
              isPopular && "text-sm"
            }`}
          >
            {reply.author.full_name}
          </Link>
          <div className="flex">{reply.body}</div>
        </div>
      </div>
    ));
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

  return (
    <div
      className={`flex flex-col  rounded-[10px]  ${
        isPopular ? "m-2" : "my-4 mr-4"
      }`}
    >
      <div className="flex items-center  space-x-2 md:p-2 py-2">
        <Link
          href={`/explore/profile?id=${content.authorId}`}
          className={`flex rounded-full cursor-pointer ${
            type === "explore" && "pl-4 md:pl-0"
          } `}
        >
          <Image
            src={
              content.author?.profile_picture
                ? content.author.profile_picture
                : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4CUkdaTo6Na0w9vdr4Km_0Sx0hTZ5eecjPCQ89fj87A&s"
            }
            alt="author_image"
            width={isPopular ? 30 : 40}
            height={isPopular ? 30 : 40}
            className="rounded-full object-cover bg-black  p-2 m-auto"
          />
        </Link>
        <Link
          href={`/explore/profile?id=${content.authorId}`}
          className={`flex cursor-pointer ${isPopular && "text-sm"}`}
        >
          {content.author.full_name} .{" "}
        </Link>
        <div className={`flex ${isPopular && "text-sm"}`}>
          {formatDate(content.createdAt).month_day_year} .
        </div>

        {content.isTrending && (
          <div
            className={`flex  text-white items-center justify-center ${
              isPopular && "text-sm"
            }`}
          >
            {" "}
            #OnTrending
          </div>
        )}
      </div>
      <div
        className={`flex ${isPopular ? "p-0" : type === "explore" && "px-4"}`}
      >
        <div className="flex  flex-col flex-1">
          <div
            className={`flex items-center ${
              content.type !== Content_Type.ART && !isPopular
                ? "md:flex-row flex-col"
                : ""
            }  ${
              content.type === Content_Type.ART || isPopular ? "flex-col" : ""
            } ${isPopular ? " items-center justify-center " : ""}  `}
          >
            <div
              className="flex flex-col cursor-pointer w-[90%] "
              onClick={() => router.push(`/explore/story?id=${content.id}`)}
            >
              <div
                className={`flex w-full text-justify  py-2 ${
                  isPopular ? "text-md px-2" : "text-lg"
                } font-bold`}
              >
                {content.caption}
              </div>

              {!isPopular && (
                <div className="flex w-full flex-col py-2">
                  <div className="w-full font-bold ">
                    Title - {content.title}
                  </div>
                  <div className="w-full text-gray-500 text-justify">
                    {content.description}
                  </div>
                </div>
              )}
            </div>
            <div
              className={`flex ${
                !isPopular ? "md:flex-row" : ""
              } flex-col md:px-6 p-2 overflow-hidden`}
            >
              {content.pictures &&
                content.pictures.length > 0 &&
                content.pictures.map((picture, index) => (
                  <Image
                    key={index}
                    src={picture}
                    alt="content_image"
                    width={300}
                    height={300}
                    className={`rounded-[25px] object-contain w-full h-full md:px-1 ${
                      !isPopular && "md:py-0"
                    } py-4`}
                  />
                ))}
            </div>
          </div>

          {!isPopular && (
            <div className="flex">
              <div className="flex flex-1  justify-start items-center">
                <div className="flex flex-col md:flex-row  md:space-y-0 md:space-x-3 md:items-center space-y-2  ">
                  <div className="flex md:space-x-4 space-x-2">
                    <div className="font-bold text-sm">{content.type}</div>
                    {content.category.map((c, index) => (
                      <div className="font-bold text-sm" key={index}>
                        {c}
                      </div>
                    ))}
                  </div>

                  {!loading && (
                    <div className="flex space-x-4">
                      <div
                        className={`flex  items-center justify-center cursor-pointer ${
                          isPopular && "text-sm"
                        }`}
                        onClick={handleLikeToggle}
                      >
                        {liked ? <>👏</> : <>👍</>} {likes}
                      </div>
                      <div
                        className={`flex  items-center justify-center ${
                          isPopular && "text-sm"
                        }`}
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
          )}
        </div>
        {/* <div className="flex ">
          {content.pictures && content.pictures.length > 0 && (
            <Image
              src={content.pictures[0]}
              alt="content_image"
              width={100}
              height={100}
              className="rounded-[10px] w-full h-full"
            />
          )}
        </div> */}
      </div>

      {!isPopular && (
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
      )}
    </div>
  );
};

export default ContentCard;

// {content?.comments?.map((comment, index) => (
//   <div className="flex  space-x-2 items-center w-[85%] " key={index}>
//     <Link
//       href={`/explore/profile?id=${comment.authorId}`}
//       className={`flex rounded-full cursor-pointer ${
//         type === "explore" && "pl-4 md:pl-0"
//       } `}
//     >
//       <Image
//         src={
//           comment.author?.profile_picture
//             ? comment.author.profile_picture
//             : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4CUkdaTo6Na0w9vdr4Km_0Sx0hTZ5eecjPCQ89fj87A&s"
//         }
//         alt="author_image"
//         width={isPopular ? 30 : 40}
//         height={isPopular ? 30 : 40}
//         className="rounded-full object-cover bg-black  p-2 m-auto"
//       />
//     </Link>
//     <Link
//       href={`/explore/profile?id=${comment.authorId}`}
//       className={`flex cursor-pointer font-bold ${
//         isPopular && "text-sm"
//       }`}
//     >
//       {comment.author.full_name}
//     </Link>
//     <div className="flex ">{comment.body} </div>

//     {/* Reply Button */}
//     {!replyToCommentId && (
//       <button
//         onClick={() => {
//           commentForm.reset({
//             body: `@${comment.author.full_name?.replaceAll(
//               " ",
//               "_"
//             )} `,
//           });

//           commentForm.setFocus("body");
//           commentForm.reset();
//         }}
//         className="text-blue-500 cursor-pointer "
//       >
//         Reply
//       </button>
//     )}
//   </div>
// ))}
