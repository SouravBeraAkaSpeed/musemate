"use client";
import { useSupabaseUser } from "@/components/providers/supabase-user-provider";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { createPoll } from "@/lib/supabase/queries";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export type PollOption = {
  id: string;
  option: string;
};

const Page = () => {
  const [caption, setCaption] = useState("");
  const { state } = useSupabaseUser();
  const [pollOptions, setPollOptions] = useState<PollOption[]>([
    { id: "1", option: "" },
  ]);
  const router = useRouter();

  const handleAddOption = () => {
    setPollOptions([
      ...pollOptions,
      { id: `${pollOptions.length + 1}`, option: "" },
    ]);
  };

  const handleOptionChange = (id: string, value: string) => {
    setPollOptions(
      pollOptions.map((option) =>
        option.id === id ? { ...option, option: value } : option
      )
    );
  };

  const handleRemoveOption = (id: string) => {
    setPollOptions(pollOptions.filter((option) => option.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log(caption, pollOptions);
    // Basic validation
    if (!caption || pollOptions.some((option) => !option.option)) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      if (state.user) {
        const res = await createPoll(
          caption,
          pollOptions.map((option) => option.option),
          state.user.id
        );
        toast({
          title: "Poll is created successfully.",
        });
        router.push("/explore");
      } else {
        toast({
          title: "Login to create a post",
        });
      }
    } catch (error) {
      console.error("Error creating poll:", error);
    }
  };

  if (!state.user)
    return (
      <div className=" w-full flex items-center justify-center">
        <div className="flex flex-col">
          <div className="flex">Login to create a Poll</div>
          <Button className="flex p-3 " onClick={() => router.push("/login")}>
            Login
          </Button>
        </div>
      </div>
    );

  return (
    <div className="container mx-auto p-4 h-screen mt-10 md:w-[60%] w-[90%]">
      <h1 className="text-2xl my-[50px] text-center font-bold ">
        Create a Poll
      </h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-white text-sm font-bold mb-2">
            Caption
          </label>
          <input
            type="text"
            placeholder="caption"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div className="mb-4">
          <label className="block text-white text-sm font-bold mb-2">
            Poll Options
          </label>
          {pollOptions.map((option) => (
            <div key={option.id} className="flex items-center mb-2">
              <input
                type="text"
                placeholder="option"
                value={option.option}
                onChange={(e) => handleOptionChange(option.id, e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline"
              />
              {pollOptions.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveOption(option.id)}
                  className="ml-2 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddOption}
            className="bg-gray-300 w-full mt-5 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Add Option
          </button>
        </div>
        <button
          type="submit"
          className="bg-white w-full mt-5 text-black hover:bg-white  font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Create Poll
        </button>
      </form>
    </div>
  );
};

export default Page;
