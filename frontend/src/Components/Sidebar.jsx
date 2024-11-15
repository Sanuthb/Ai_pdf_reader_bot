import React, { useState } from "react";
import { Plus, FolderDown, FileText } from "lucide-react";
import Blank_comp from "./Blank_comp";
import { UserButton, useUser } from "@clerk/clerk-react";
import Signin from "./Signin";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { uploadedPDFsAtom ,selectedPDFAtom} from "../Atoms/atoms";

const Sidebar = () => {
  const { isSignedIn } = useUser();
  const [signin, seSignin] = useState(false);
  const uploadedPDFs = useRecoilValue(uploadedPDFsAtom);
  const setSelectedPDF = useSetRecoilState(selectedPDFAtom);

  const handlesignin = () => {
    if (!isSignedIn) {
      seSignin(true);
    }
  };

  // const handlenewchat = () => {};

  return (
    <div className="bg-secondary w-[16rem] h-screen text-white font-primaryFontFamily px-5 py-5 flex justify-between flex-col">
      <div className="flex flex-col gap-5">
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

        <div className="">
          {uploadedPDFs.length > 0 &&
            uploadedPDFs.map((pdf, index) => (
              <button
                key={index}
                className="bg-[#3C3D37] w-full py-2 rounded-lg flex items-center justify-center gap-5"
                onClick={() => setSelectedPDF(pdf)}
              >
                <FileText />
                {pdf}
              </button>
            ))}
        </div>
      </div>
      {!isSignedIn && (
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
      )}
      {isSignedIn && (
        <div className="bg-[#3C3D37] flex items-center px-2 py-3 rounded-lg gap-2">
          <UserButton />
          <div>
            <h1 className="text-sm">Hi! Welcome</h1>
          </div>
        </div>
      )}
      {signin && <Signin />}
    </div>
  );
};

export default Sidebar;
