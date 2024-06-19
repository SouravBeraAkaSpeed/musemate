import Image from "next/image";
import React from "react";

const Owner = () => {
  return (
    <div className="flex flex-col w-full items-center justify-center ">
      <div className="flex w-full p-10 text-3xl font-bold items-center justify-center">
        Owners
      </div>
      <div className="flex w-full p-10 md:flex-row flex-col items-center justify-center">
        <div className="flex flex-col items-center justify-center m-4 mx-10   rounded-[10px]">
          <Image
            src="/images/kashim.jpg"
            alt="kashim"
            width={300}
            height={300}
            className="w-[300px] h-[300px] object-cover  rounded-[10px] shadow-lg shadow-gray-500"
          />

          <div className="flex mt-4 text-lg">khasim Bin Saleh</div>
          <div className="flex my-1">Founder and CEO</div>
        </div>
        <div className="flex flex-col m-4 mx-10 items-center justify-center  rounded-[10px]">
          <Image
            src="/images/aryan.jpg"
            alt="aryan"
            width={300}
            height={300}
            className="w-[300px] h-[300px] object-cover rounded-[10px] shadow-lg shadow-gray-500"
          />
          <div className="flex  mt-4 text-lg">Arayn kumar singh</div>
          <div className="flex my-1">CTO , Mentor</div>
        </div>
      </div>
    </div>
  );
};

export default Owner;


