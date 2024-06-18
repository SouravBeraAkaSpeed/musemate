import React from "react";
import { Spotlight } from "../ui/Spotlight";

export function About() {
  return (
    <div className="h-screen w-full rounded-md flex md:items-center md:justify-center bg-black/[0.96] antialiased bg-grid-white/[0.02] relative overflow-hidden">
      <Spotlight
        className="top-20 left-0 md:left-60 md:-top-20"
        fill="white"
      />
      <div className=" p-4 max-w-7xl  mx-auto relative z-10  w-full pt-[320px] md:pt-0">
        <h1 className="text-4xl md:text-7xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400 bg-opacity-50">
          MYMUSEMATE <br /> is the new trend.
        </h1>
        <p className="mt-4 font-normal text-base text-neutral-300 max-w-lg text-center mx-auto">
          Where creators and audiences unite. Explore diverse narratives,
          captivating artworks, and engaging polls. Join communities, access
          exclusive content, and dive into a marketplace of literary and visual
          treasures.
        </p>
      </div>
    </div>
  );
}
