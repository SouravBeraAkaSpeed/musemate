"use client";
import React, { useEffect, useState } from "react";
import { ContainerScroll } from "../ui/container-scroll-animation";
import Image from "next/image";
import { Button } from "../ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { contentWithUser } from "@/lib/types";
import { getPopularContents } from "@/lib/supabase/queries";
import ContentCard from "../content-card";
import { Loader2 } from "lucide-react";

export function Hero() {
  const router = useRouter();
  const [popularContents, setPopularContents] = useState<contentWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const getPopularContent = async () => {
      setIsLoading(true);
      await getPopularContents().then((res) => {
        if (res) {
          setPopularContents(res);
          console.log(res);
          setIsLoading(false);
        }
      });
    };

    getPopularContent();
  }, []);

  return (
    <div className="flex flex-col overflow-hidden top-20 md:top-0 items-center py-10">
      <ContainerScroll
        titleComponent={
          <>
            <h1 className="text-4xl font-semibold text-black dark:text-white">
              The world&apos;s most positive platform for<br />
              <span className="text-4xl md:text-[6rem] font-bold mt-1 leading-none">
                <span className="text-red-500">Artist</span> to engage <span className="text-red-500">Peoples</span>
              </span>
            </h1>
          </>
        }
      >
        <Image
          src={`/images/book.png`}
          alt="hero"
          height={720}
          width={1400}
          className="mx-auto rounded-2xl w-full h-full object-left-top object-contain"
          draggable={false}
        />
      </ContainerScroll>

      <div className="flex-col md:my-0 my-[100px] w-full h-full flex items-center justify-center ">
        <div className="flex font-bold p-4">Today&apos;s Popular Stories</div>

        <div className="flex  md:flex-row flex-col items-center justify-center w-full md:px-[100px] px-5 md:space-y-0 space-y-10">
          {isLoading && (
            <div className="flex text-white flex-1 justify-center items-center h-[300px]">
              <Loader2 className="h-7 w-7 text-white animate-spin my-4" />
              <p className="text-xs text-white ">Loading ...</p>
            </div>
          )}
          {popularContents.slice(0, 3).map((content, index) => (
            <Link
              href={`/explore/story?id=${content.id}`}
              className="flex md:w-1/3 cursor-pointer  w-full items-center justify-center flex-col mx-4 "
              key={index}
            >
              <div className="flex text-lg w-full text-justify justify-center items-center font-bold">
                {content.caption}
              </div>
              <div className="flex text-md w-full justify-center items-center my-4 ">
                {content.description &&
                  content.description?.substring(0, 40) + "..."}
              </div>
              <div className="flex w-full items-center justify-center ">
                <Image
                  src={content.pictures[0]}
                  alt="popular_image"
                  width={300}
                  height={300}
                  className="w-[300px] h-[300px] object-cover rounded-[10px]"
                />
              </div>
            </Link>
          ))}
        </div>
      </div>

      <Button
        onClick={() => router.push("/explore")}
        className="flex w-[100px] z-100   bg-white rounded-[10px] md:mb-[100px]   "
      >
        Explore
      </Button>
    </div>
  );
}

export const users = [
  {
    name: "Manu Arora",
    designation: "Founder, Algochurn",
    image: "https://picsum.photos/id/10/300/300",
    badge: "Mentor",
  },
  {
    name: "Sarah Singh",
    designation: "Founder, Sarah's Kitchen",
    image: "https://picsum.photos/id/11/300/300",
    badge: "Mentor",
  },
  {
    name: "John Doe",
    designation: "Software Engineer, Tech Corp",
    image: "https://picsum.photos/id/12/300/300",
    badge: "Mentor",
  },
  {
    name: "Jane Smith",
    designation: "Product Manager, Innovate Inc",
    image: "https://picsum.photos/id/13/300/300",
    badge: "Mentor",
  },
  {
    name: "Robert Johnson",
    designation: "Data Scientist, DataWorks",
    image: "https://picsum.photos/id/14/300/300",
    badge: "Mentor",
  },
  {
    name: "Emily Davis",
    designation: "UX Designer, DesignHub",
    image: "https://picsum.photos/id/15/300/300",
    badge: "Mentor",
  },
  {
    name: "Michael Miller",
    designation: "CTO, FutureTech",
    image: "https://picsum.photos/id/16/300/300",
    badge: "Mentor",
  },
  {
    name: "Sarah Brown",
    designation: "CEO, StartUp",
    image: "https://picsum.photos/id/17/300/300",
  },
  {
    name: "James Wilson",
    designation: "DevOps Engineer, CloudNet",
    image: "https://picsum.photos/id/18/300/300",
    badge: "Something",
  },
  {
    name: "Patricia Moore",
    designation: "Marketing Manager, MarketGrowth",
    image: "https://picsum.photos/id/19/300/300",
    badge: "Mentor",
  },
  {
    name: "Richard Taylor",
    designation: "Frontend Developer, WebSolutions",
    image: "https://picsum.photos/id/20/300/300",
  },
  {
    name: "Linda Anderson",
    designation: "Backend Developer, ServerSecure",
    image: "https://picsum.photos/id/21/300/300",
  },
  {
    name: "William Thomas",
    designation: "Full Stack Developer, FullStack",
    image: "https://picsum.photos/id/22/300/300",
    badge: "Badger",
  },
  {
    name: "Elizabeth Jackson",
    designation: "Project Manager, ProManage",
    image: "https://picsum.photos/id/23/300/300",
    badge: "Mentor",
  },
  {
    name: "David White",
    designation: "Database Administrator, DataSafe",
    image: "https://picsum.photos/id/24/300/300",
    badge: "Advocate",
  },
  {
    name: "Jennifer Harris",
    designation: "Network Engineer, NetConnect",
    image: "https://picsum.photos/id/25/300/300",
  },
  {
    name: "Charles Clark",
    designation: "Security Analyst, SecureIT",
    image: "https://picsum.photos/id/26/300/300",
  },
  {
    name: "Susan Lewis",
    designation: "Systems Analyst, SysAnalyse",
    image: "https://picsum.photos/id/27/300/300",
  },
  {
    name: "Joseph Young",
    designation: "Mobile Developer, AppDev",
    image: "https://picsum.photos/id/28/300/300",
    badge: "Mentor",
  },
  {
    name: "Margaret Hall",
    designation: "Quality Assurance, BugFree",
    image: "https://picsum.photos/id/29/300/300",
    badge: "Developer",
  },
];
