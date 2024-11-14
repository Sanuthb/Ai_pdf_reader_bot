import React, { useState } from "react";
import { Plus, FolderDown } from "lucide-react";
import Blank_comp from "./Blank_comp";
import { useUser } from "@clerk/clerk-react";
import Signin from "./Signin";

const Sidebar = () => {
  const { isSignedIn } = useUser();
  const [signin, seSignin] = useState(false);
  const handlesignin = () => {
    if (!isSignedIn) {
      seSignin(true);
    }
  };

  return (
    <div className="bg-secondary w-[16rem] h-screen text-white font-primaryFontFamily px-5 py-5 flex justify-between flex-col">
      <div>
        <div className="w-full flex items-center justify-center">
          <h1 className="text-xl font-medium">
            Docu
            <span className="bg-primary p-2 rounded-lg font-bold">Genie</span>
          </h1>
        </div>
        <div className="flex items-center flex-col gap-5 mt-5">
          <button className="w-full p-2 flex items-center justify-center gap-4 border-[.1rem] border-gray-500 rounded-lg hover:bg-[#3C3D37] text-sm">
            <Plus size={15} />
            New Chat
          </button>
          <button className="w-full p-2 flex items-center justify-center gap-4 border-[.1rem] border-gray-500 rounded-lg hover:bg-[#3C3D37] text-sm ">
            <FolderDown size={15} /> New Folder
          </button>
        </div>
      </div>
      <div className="flex items-center justify-center w-full flex-col gap-5">
        <Blank_comp />
        <p className="text-sm font-semibold text-gray-400  text-center">
          Sign in for free to save your chat history
        </p>
        <button
          className="bg-primary p-2 rounded-lg  font-semibold"
          onClick={handlesignin}
        >
          Sign in
        </button>
      </div>
      {signin && <Signin />}
    </div>
  );
};

export default Sidebar;
