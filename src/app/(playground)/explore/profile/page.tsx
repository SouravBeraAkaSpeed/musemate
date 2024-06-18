"use client";
import ContentCard from "@/components/content-card";
import { useSupabaseUser } from "@/components/providers/supabase-user-provider";
import { toast } from "@/components/ui/use-toast";
import {
  followUser,
  getUserDetails,
  getuserFollowing,
} from "@/lib/supabase/queries";
import { content, contentWithUser, user } from "@/lib/types";
import { Loader2, Upload, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React, { useCallback, useEffect, useState, useRef } from "react";

const Page = () => {
  const searchParams = useSearchParams();
  const profile_id = searchParams.get("id");
  const [user, setUser] = useState<user | null>(null);
  const [contents, setContents] = useState<content[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const initialFetchDoneRef = useRef(false);
  const { state } = useSupabaseUser();
  const [isMounted, setIsMounted] = useState(false);
  const [contentsWithUser, setContentsWithUser] = useState<contentWithUser[]>(
    []
  );
  const [userFollowing, setUserFollowing] = useState<user[]>([]);

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

  const fetchUserData = useCallback(
    async (cursor?: string) => {
      if (loading) return; // Prevent multiple simultaneous calls
      setLoading(true);
      try {
        const response = await getUserDetails(profile_id, cursor);

        if (response) {
          setUser(response.user);
          setContents((prevContents) => [
            ...prevContents,
            ...response.contents,
          ]);
          setNextCursor(response.nextCursor);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    },
    [profile_id, loading]
  );

  useEffect(() => {
    if (user && contents.length > 0) {
      const updatedContentsWithUser = contents.map((content) => ({
        ...content,
        author: user,
      }));
      setContentsWithUser(updatedContentsWithUser);
    }
  }, [user, contents]);

  useEffect(() => {
    setIsMounted(true);
  }, [isMounted]);

  useEffect(() => {
    const getUser = async () => {
      if (profile_id) {
        const users = await getuserFollowing(profile_id);
        if (users) {
          setUserFollowing(users.usersFollowing);
        }
      }
    };
    if (profile_id) {
      getUser();
    }
  }, [profile_id]);

  useEffect(() => {
    if (!initialFetchDoneRef.current) {
      initialFetchDoneRef.current = true;
      fetchUserData();
    }
  }, [fetchUserData]);

  const handleScroll = (e: React.UIEvent<HTMLElement>) => {
    const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
    if (
      scrollTop + clientHeight >= scrollHeight - 5 &&
      nextCursor &&
      !loading
    ) {
      fetchUserData(nextCursor);
    }
  };

  if (!isMounted)
    return (
      <div className="flex text-white flex-1 justify-center items-center h-[300px]">
        <Loader2 className="h-7 w-7 text-white animate-spin my-4" />
        <p className="text-xs text-white ">Loading ...</p>
      </div>
    );

  return (
    <div className="flex flex-col w-full  items-center ">
      <div className="flex flex-col w-[70%] mt-[50px]">
        <div className="flex w-full md:flex-row flex-col h-auto">
          <div className="flex flex-col md:w-2/3 md:border-r-2 h-auto">
            <div className="w-full ">
              {user?.banner ? (
                <div className="w-full flex flex-col items-center justify-center font-bold cursor-pointer ">
                  <Image
                    src={user?.banner}
                    alt="user-banner"
                    width={500}
                    height={300}
                  />
                </div>
              ) : (
                <div className="w-full flex flex-col items-center justify-center font-bold cursor-pointer ">
                  {state?.user &&  state.user?.id === profile_id && (
                    <>
                      <Upload className="md:w-[60%] h-[100px]" /> Upload Banner
                    </>
                  )}
                </div>
              )}

              <div className="hidden md:flex w-full  text-xl font-bold py-1 pt-10">
                {user?.full_name}
              </div>
              <div className="w-full flex flex-col   py-1">{user?.tagline}</div>

              <div className="md:hidden flex flex-col  cursor-pointer mt-4 ">
                {user?.profile_picture ? (
                  <div className="w-full flex  flex-col font-bold cursor-pointer   py-1">
                    <Image
                      src={user?.profile_picture}
                      alt="user-profile-picture"
                      width={80}
                      height={80}
                      className="md:w-[80px] h-[80px] rounded-full bg-black p-2"
                    />
                  </div>
                ) : (
                  <div className="w-full flex flex-col font-bold cursor-pointer  py-1">
                    <Upload className="md:w-[80px] h-[80px] rounded-full p-2 bg-black" />{" "}
                    Upload Profile Photo
                  </div>
                )}

                <div className="w-full flex flex-col font-bold   py-1">
                  {user?.full_name}
                </div>

                <div className="w-full flex text-sm    py-1">
                  {user?.Interests?.map((interest, index) => (
                    <div key={index} className="flex px-1">
                      #{interest}{" "}
                    </div>
                  ))}
                </div>
                {profile_id && (
                  <div className=" w-full flex   py-1 cursor-pointer">
                    <div
                      className=" w-auto px-4 py-1 justify-center bg-[#bbaf95] rounded-[10px]"
                      onClick={() =>
                        FollowUser({
                          followerId: state.user?.id,
                          userId: profile_id,
                        })
                      }
                    >
                      Follow
                    </div>
                  </div>
                )}
              </div>
              <div className="w-full flex flex-col font-bold  pt-10">About</div>
              <div
                className="ProseMirror whitespace-pre-line flex flex-col  text-justify py-4 rounded-lg"
                style={{ whiteSpace: "pre-line" }}
                dangerouslySetInnerHTML={{
                  __html: user?.about as string | TrustedHTML,
                }}
              />

              <div className="w-full flex flex-col font-bold  pt-10">Posts</div>

              <div className="flex flex-col my-5 min-h-screen">
                {contentsWithUser.map((content, index) => (
                  <ContentCard
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
            </div>
          </div>

          <div className="flex flex-col md:w-1/3">
            <div className=" hidden  md:flex md:flex-col  cursor-pointer ">
              {user?.profile_picture ? (
                <div className="w-full flex flex-col font-bold cursor-pointer  px-10 py-1">
                  <Image
                    src={user?.profile_picture}
                    alt="user-profile-picture"
                    width={80}
                    height={80}
                    className="md:w-[80px] h-[80px] rounded-full bg-black p-2"
                  />
                </div>
              ) : (
                <div className="w-full flex flex-col font-bold cursor-pointer px-10 py-1">
                  <Upload className="md:w-[80px] h-[80px] rounded-full p-2 bg-black" />{" "}
                  Upload Profile Photo
                </div>
              )}

              <div className="w-full flex flex-col font-bold   px-10 py-1">
                {user?.full_name}
              </div>

              <div className="w-full flex text-sm   px-10 py-1">
                {user?.Interests?.map((interest, index) => (
                  <div key={index} className="flex px-1">
                    #{interest}{" "}
                  </div>
                ))}
              </div>
              {profile_id && (
                <div className=" w-full flex  px-10 py-1 cursor-pointer">
                  <div
                    className=" w-auto px-4 py-1 justify-center bg-[#bbaf95] rounded-[10px]"
                    onClick={() =>
                      FollowUser({
                        followerId: state.user?.id,
                        userId: profile_id,
                      })
                    }
                  >
                    Follow
                  </div>
                </div>
              )}

              <div className="hidden w-full md:flex md:flex-col font-bold   px-10 py-4 pt-10">
                Following
              </div>

              <div className="hidden w-full md:flex md:flex-col    px-10 py-1">
                {userFollowing.map((user, index) => (
                  <div key={index} className="flex p-2 items-center">
                    <div>
                      {user.profile_picture ? (
                        <Image
                          src={user.profile_picture}
                          alt="user-profile"
                          width={40}
                          height={40}
                          className="w-[40px] h-[40px] bg-black rounded-full p-2"
                        />
                      ) : (
                        <User />
                      )}{" "}
                    </div>
                    <div className="px-2">{user.full_name}</div>
                  </div>
                ))}
              </div>

              <div className="hidden md:flex  w-full space-x-2 px-10 py-1">
                <div
                  className={`flex cursor-pointer justify-start text-lg border-2 rounded-[20px] font-bold p-2  `}
                >
                  See all following
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
