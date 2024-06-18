"use client";
import React, { useState } from "react";
import { Menu, MenuItem, ProductItem } from "../Navbar/navbar-menu";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useSupabaseUser } from "../providers/supabase-user-provider";
import { Button } from "../ui/button";
import { actionSignOut } from "@/lib/server-actions/auth-sections";
import { useRouter } from "next/navigation";

export function Navbar({ className }: { className?: string }) {
  const router = useRouter();
  const [active, setActive] = useState<string | null>(null);
  const { state, getUser } = useSupabaseUser();

  const handleSignout = async () => {
    const res = await actionSignOut();
    if (!res) {
      getUser();
      router.push("/login");
    }
  };
  return (
    <div
      className={cn("relative top-10 inset-x-0 w-full mx-auto z-50", className)}
    >
      <Menu setActive={setActive}>
        <Link
          href={"/"}
          className="flex flex-col  flex-1 space-y-4 text-sm font-bold items-start  w-[100px]  justify-center text-[#E3BF90]"
        >
          MYMUSEMATE
        </Link>

        <Link
          className=" hidden md:flex flex-col space-y-4 text-sm justify-center "
          href={"/explore"}
        >
          Explore
        </Link>

        <div className="hidden md:flex  flex-col justify-center">
          <MenuItem setActive={setActive} active={active} item="Categories">
            <div className="  text-sm grid grid-cols-2 gap-10 p-4 ">
              <ProductItem
                title="Horror"
                href="/explore?feed=Horror"
                src="/images/horror-books.jpg"
                description="Dark tales, chilling suspense, and spine-tingling thrills await readers"
              />
              <ProductItem
                title="Action"
                href="/explore?feed=Action"
                src="/images/action-books.jpeg"
                description="Heart-pounding adventures, relentless heroes, and non-stop excitement fill the pages."
              />
              <ProductItem
                title="Thriller"
                href="/explore?feed=Thriller"
                src="/images/thriller-books.jpeg"
                description="Futuristic worlds, advanced technology, and mind-bending concepts ignite imagination."
              />
              <ProductItem
                title="Sci-Fi"
                href="/explore?feed=ScienceFiction"
                src="/images/sci-fi-books.jpg"
                description="Twists, suspense, and gripping narratives keep readers on the edge."
              />
            </div>
          </MenuItem>
        </div>
        <Link
          className=" hidden md:flex flex-col space-y-4 text-sm justify-center"
          href={"/explore?feed=trendings"}
        >
          Trending
        </Link>

        {state.user ? (
          <>
            <Link
              className=" hidden md:flex flex-col space-y-4 text-sm justify-center"
              href={`/explore/profile?id=${state.user.id}`}
            >
              Profile
            </Link>
            <Button
              className="flex flex-col font-semibold rounded-[10px]  text-sm bg-[#E3BF90] p-2   hover:text-black"
              onClick={() => handleSignout()}
            >
              LogOut
            </Button>
          </>
        ) : (
          <Link
            className="flex flex-col font-semibold rounded-[10px]  text-sm bg-[#E3BF90] p-2   hover:text-black"
            href={"/login"}
          >
            SignIn
          </Link>
        )}
      </Menu>
    </div>
  );
}
