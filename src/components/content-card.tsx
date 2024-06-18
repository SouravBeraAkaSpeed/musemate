"use client";
import { content, contentWithUser } from "@/lib/types";
import { Menubar } from "@radix-ui/react-menubar";
import { Ellipsis, Loader2, Menu, Save, ThumbsUp, Users } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useState } from "react";
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
  checkIfLiked,
  followUser,
  toggleLikeContent,
} from "@/lib/supabase/queries";
import { toast } from "./ui/use-toast";
import { useSupabaseUser } from "./providers/supabase-user-provider";
import { Interests } from "@prisma/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

const ContentCard = ({
  content,
  isPopular,
  type,
}: {
  content: contentWithUser;
  isPopular: boolean;
  type:string
}) => {
  const { state } = useSupabaseUser();
  const router = useRouter();
  const [liked, setLiked] = useState<boolean | null>(null);
  const [likes, setLikes] = useState(content.likes);
  const [loading, setLoading] = useState(true);

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
          className={`flex rounded-full cursor-pointer ${type === "explore" && 'pl-4 md:pl-0' } `}
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
            className={`flex  text-[#D5BF90] items-center justify-center ${
              isPopular && "text-sm"
            }`}
          >
            {" "}
            #OnTrending
          </div>
        )}
      </div>
      <div className={`flex ${isPopular ? "p-0" : type === "explore" && "px-4"}`}>
        <div className="flex  flex-col flex-1">
          <div className="flex md:flex-row flex-col ">
            <div
              className="flex flex-col cursor-pointer "
              onClick={() => router.push(`/explore/story?id=${content.id}`)}
            >
              <div
                className={`flex w-full  py-2 ${
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
            <div className="flex md:px-6">
              {content.pictures && content.pictures.length > 0 && (
                <Image
                  src={content.pictures[0]}
                  alt="content_image"
                  width={100}
                  height={100}
                  className="rounded-[13px] w-full h-full py-2"
                />
              )}
            </div>
          </div>

          {!isPopular && (
            <div className="flex">
              <div className="flex flex-1  justify-start items-center">
                <div className="flex flex-col md:flex-row  md:space-y-0 md:space-x-3 md:items-center space-y-2 mt-6 ">
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
    </div>
  );
};

export default ContentCard;
