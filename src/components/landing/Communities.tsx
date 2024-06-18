import React from "react";
import { TextGenerateEffect } from "../ui/text-generating-effect";
import Image from "next/image";

const Communities = () => {
  return (
    <div className="h-screen w-full rounded-md  space-x-[200px] flex md:items-center md:justify-center bg-black/[0.96] antialiased bg-grid-white/[0.02] relative overflow-hidden">
      <div className="flex-col w-1/2 px-10">
        <div className="flex text-4xl font-bold">Communites</div>
        <TextGenerateEffect
          words={`Connect with like-minded enthusiasts, share passions, and foster creativity. Join public or private groups, engage in events, and unlock exclusive content.  `}
        />
      </div>
      <div className="flex flex-col w-1/2 max-w-[500px] justify-center  space-y-[50px]">
        <div className="flex space-x-[50px]">
          <div className="flex flex-col w-1/2 justify-center items-center ">
            <Image
              src={"/images/action.webp"}
              width={50}
              height={50}
              alt="action-communties"
              className="rounded-full"
            />
            <div className="flex">Action Movies</div>
          </div>
          <div className="flex flex-col w-1/2 justify-center items-center ">
            <Image
              src={"/images/drama.jpeg"}
              width={50}
              height={50}
              alt="drama-communties"
              className="rounded-full"
            />
            <div className="flex">Drama Movies</div>
          </div>
        </div>
        <div className="flex space-x-[50px]">
          <div className="flex flex-col w-1/2 justify-center items-center ">
            <Image
              src={"/images/scifi.jpeg"}
              width={50}
              height={50}
              alt="SCIFI-communties"
              className="rounded-full"
            />
            <div className="flex">SCIFI Movies</div>
          </div>
          <div className="flex flex-col w-1/2 justify-center items-center ">
            <Image
              src={"/images/thriller.jpeg"}
              width={50}
              height={50}
              alt="Thriller-communties"
              className="rounded-full"
            />
            <div className="flex">Thriller Movies</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Communities;
