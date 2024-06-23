"use client";
import { UpdatePollVote } from "@/lib/supabase/queries";
import { useState } from "react";

type PollOption = {
  id: string;
  option: string;
  votes: number;
};

type PollProps = {
  pollId: string;
  caption: string | null;
  options: PollOption[];
};

const Poll = ({ pollId, caption, options }: PollProps) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [pollOptions, setPollOptions] = useState(options);

  const handleVote = async (optionId: string) => {
    try {
      const res = await UpdatePollVote(pollId, optionId);

      if (res) {
        setSelectedOption(optionId);
        setPollOptions(res);
      }
    } catch (error) {
      console.error("Error voting:", error);
    }
  };

  const totalVotes = pollOptions.reduce((acc, option) => acc + option.votes, 0);

  return (
    <div className="poll-container p-4 border rounded shadow-sm w-full">
      <h2 className="text-xl font-bold mb-4">{caption}</h2>
      <div className="poll-options space-y-2 w-full">
        {pollOptions.map((option) => (
          <div key={option.id} className="flex items-center space-x-2 w-full">
            <button
              onClick={() => handleVote(option.id)}
              disabled={!!selectedOption}
              className={`px-4 py-2 rounded  w-full text-start ${
                selectedOption ? "bg-gray-300" : "bg-blue-500 text-white"
              }`}
            >
              {option.option}
            </button>
            {selectedOption && (
              <div className="ml-2 text-gray-600">
                {((option.votes / totalVotes) * 100).toFixed(1)}%
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Poll;
