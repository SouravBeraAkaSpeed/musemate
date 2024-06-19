"use client";
import ContentCard from "@/components/content-card";
import { useSupabaseUser } from "@/components/providers/supabase-user-provider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  filterContentsByFollowing,
  filterContentsByNotFollowing,
  getContentByCategory,
  getLatestTenPost,
  getPopularContents,
} from "@/lib/supabase/queries";
import { contentWithUser } from "@/lib/types";
import { Interests } from "@prisma/client";
import { Loader2, PenSquare } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { Suspense, useEffect, useState } from "react";

const Page = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const feed = searchParams.get("feed");
  const [latestContents, setLatestContents] = useState<contentWithUser[]>([]);
  const [followingContents, setFollowingContents] = useState<contentWithUser[]>(
    []
  );
  const [notfollowingContents, setNotFollowingContents] = useState<
    contentWithUser[]
  >([]);
  const [popularContents, setPopularContents] = useState<contentWithUser[]>([]);
  const [contents, setContents] = useState<contentWithUser[]>([]);
  const { state } = useSupabaseUser();
  const [isLoading, setIsLoading] = useState(false);
  const [categoryContent, setCategoryContent] = useState<contentWithUser[]>([]);

  const ArrayForFeed = (feed: string | null) => {
    switch (feed) {
      case "following":
        setContents(followingContents);
        break;

      case "Horror":
        setContents(categoryContent);
        break;
      case "Thriller":
        setContents(categoryContent);
        break;
      case "Mystery":
        setContents(categoryContent);
        break;
      case "Action":
        setContents(categoryContent);
        break;
      case "Drama":
        setContents(categoryContent);
        break;
      case "Romance":
        setContents(categoryContent);
        break;
      case "Mystery":
        setContents(categoryContent);
        break;

      case "Trendings":
        setContents(categoryContent);
        break;

      default:
        setContents(latestContents);
        break;
    }
  };

  const getLatestContent = async () => {
    setIsLoading(true);
    await getLatestTenPost(state.user?.id).then((res) => {
      if (res) {
        setLatestContents(res.contents);
        setContents(res.contents);
        console.log(res);
        ArrayForFeed(feed);
        setIsLoading(false);
      }
    });
  };
  useEffect(() => {
    const getfilterContentsByNotFollowing = async () => {
      if (latestContents && feed !== "following") {
        setIsLoading(true);
        await filterContentsByNotFollowing(latestContents, state.user?.id).then(
          (res) => {
            if (res) {
              setNotFollowingContents(res);
              setContents(res);
              console.log(res);
              ArrayForFeed(feed);
              setIsLoading(false);
            }
          }
        );
      }
    };

    const getfilterContentsByFollowing = async () => {
      if (latestContents && feed === "following") {
        setIsLoading(true);
        await filterContentsByFollowing(latestContents, state.user?.id).then(
          (res) => {
            if (res) {
              setFollowingContents(res);
              console.log(res);
              setContents(res);
              setIsLoading(false);
            }
          }
        );
      }
    };

    const getPopularContent = async () => {
      setIsLoading(true);
      await getPopularContents().then((res) => {
        if (res) {
          setPopularContents(res);
          console.log(res);
          ArrayForFeed(feed);
          setIsLoading(false);
        }
      });
    };

    const getContentsByCategory = async (category: Interests) => {
      setIsLoading(true);
      await getContentByCategory(category).then((res) => {
        if (res) {
          setCategoryContent(res);
          console.log(res);
          setContents(res);
          setIsLoading(false);
        }
      });
    };

    if (latestContents.length === 0) {
      getLatestContent();
      getPopularContent();
    }

    const categories = Object.values(Interests);
    console.log(categories.includes(feed as Interests));
    if (feed && categories.includes(feed as Interests)) {
      getContentsByCategory(feed as Interests);
    }

    if (!categories.includes(feed as Interests) && latestContents) {
      console.log("enter", feed as Interests, categories);
      getfilterContentsByFollowing();
      getfilterContentsByNotFollowing();
    }
    console.log("contents:", contents);
  }, [state.user, latestContents, feed]);

  return (
    <div className="flex flex-col w-full">
      <div className="flex md:mx-[100px] mx-3 mt-10  min-h-screen">
        <div className="flex flex-1 w-3/4  flex-col md:border-r-2 h-full">
          <div className="flex items-center">
            <Button
              onClick={() => router.push("/explore")}
              className={`${
                !feed && "border-2 border-[#D5BF90]"
              } bg-transparent text-white rounded-[10px] hover:bg-[#D5BF90]  m-2 p-2 border-2`}
            >
              For you
            </Button>

            {state.user && (
              <Button
                onClick={() => router.push("/explore?feed=following")}
                className={`${
                  feed === "following" && "border-2 border-[#D5BF90]"
                } bg-transparent text-white rounded-[10px] hover:bg-[#D5BF90]  m-2 p-2 border-2`}
              >
                Following
              </Button>
            )}
            <Button
              onClick={() => router.push("/explore?feed=Horror")}
              className={`${
                feed === "Horror" && "border-2 border-[#D5BF90]"
              } bg-transparent text-white rounded-[10px] hover:bg-[#D5BF90] hidden xl:flex m-2 p-2 border-2`}
            >
              Horror
            </Button>
            <Button
              onClick={() => router.push("/explore?feed=Thriller")}
              className={`${
                feed === "Thriller" && "border-2 border-[#D5BF90]"
              } bg-transparent text-white rounded-[10px] hover:bg-[#D5BF90] hidden xl:flex m-2 p-2 border-2`}
            >
              Thriller
            </Button>
            <Button
              onClick={() => router.push("/explore?feed=Action")}
              className={`${
                feed === "Action" && "border-2 border-[#D5BF90]"
              } bg-transparent text-white rounded-[10px] hover:bg-[#D5BF90] hidden xl:flex m-2 p-2 border-2`}
            >
              Action
            </Button>
            <Button
              onClick={() => router.push("/explore?feed=ScienceFiction")}
              className={`${
                feed === "ScienceFiction" && "border-2 border-[#D5BF90]"
              } bg-transparent text-white rounded-[10px] hover:bg-[#D5BF90] hidden xl:flex  m-2 p-2 border-2`}
            >
              ScienceFiction
            </Button>
            <Button
              onClick={() => router.push("/explore?feed=Mystery")}
              className={`${
                feed === "Mystery" && "border-2 border-[#D5BF90]"
              } bg-transparent text-white rounded-[10px] hover:bg-[#D5BF90] hidden xl:flex m-2 p-2 border-2`}
            >
              Mystery
            </Button>
            <Button
              onClick={() => router.push("/explore?feed=Trendings")}
              className={`${
                feed === "Trendings" && "border-2 border-[#D5BF90]"
              } bg-transparent text-white rounded-[10px] hover:bg-[#D5BF90] hidden xl:flex m-2 p-2 border-2`}
            >
              Trendings
            </Button>

            <div className="md:hidden flex ">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="  bg-transparent text-white rounded-[10px] hover:bg-[#D5BF90]  m-2 p-2 border-2 ">
                    <div>Categories</div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[170px] rounded-[10px]">
                  <DropdownMenuCheckboxItem
                    className="cursor-pointer rounded-[10px]"
                    onClick={() => router.push("/explore?feed=Thriller")}
                  >
                    Thriller
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    className="cursor-pointer rounded-[10px]"
                    onClick={() => router.push("/explore?feed=Action")}
                  >
                    Action
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    className="cursor-pointer rounded-[10px]"
                    onClick={() => router.push("/explore?feed=Drama")}
                  >
                    Drama
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    className="cursor-pointer rounded-[10px]"
                    onClick={() => router.push("/explore?feed=ScienceFiction")}
                  >
                    ScienceFiction
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    className="cursor-pointer rounded-[10px]"
                    onClick={() => router.push("/explore?feed=Mystery")}
                  >
                    Mystery
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex flex-1  items-center text-[16px] justify-end p-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className=" space-x-2 p-2 bg-transparent text-[#D5BF90] hover:bg-transparent hover:border-0 rounded-[10px] ">
                    <PenSquare size={20} />
                    <div>Create</div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[170px] rounded-[10px]">
                  <DropdownMenuCheckboxItem
                    className="cursor-pointer rounded-[10px]"
                    onClick={() => router.push("/create/story")}
                  >
                    Story
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    className="cursor-pointer rounded-[10px]"
                    onClick={() => router.push("/create/art")}
                  >
                    Art
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    className="cursor-pointer rounded-[10px]"
                    onClick={() => router.push("/create/poll")}
                  >
                    Poll
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <hr />

          {isLoading ? (
            <div className="flex realtive inset-0 m-auto text-white flex-1 justify-center items-center h-[300px]">
              <Loader2 className="h-7 w-7 text-white animate-spin my-4" />
              <p className="text-xs text-white ">Loading ...</p>
            </div>
          ) : (
            <div className="flex flex-col my-10 min-h-screen">
              {contents.map((content, index) => (
                <ContentCard
                  type="explore"
                  key={index}
                  content={content}
                  isPopular={false}
                />
              ))}

              {contents.length === 0 && (
                <div className="flex text-xl font-bold items-center justify-center">
                  😔 No Stories available in this genre
                </div>
              )}
            </div>
          )}
        </div>
        <div className="md:flex-col  w-1/4 h-full hidden md:flex ">
          <div className="flex font-bold p-4">Popular Stories</div>
          <hr />
          {popularContents.map((content, index) => (
            <ContentCard
              type="explore"
              key={index}
              content={content}
              isPopular={true}
            />
          ))}
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
