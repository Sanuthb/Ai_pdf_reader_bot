import React, { useEffect, useState } from "react";
import { Plus, FileText, MessageSquareMore } from "lucide-react";
import Blank_comp from "./Blank_comp";
import { UserButton, useUser } from "@clerk/clerk-react";
import Signin from "./Signin";
import { useNavigate } from "react-router-dom";
import {fetch_data} from "../apis/api"

const Sidebar = React.memo(() => {
  const { isSignedIn } = useUser();
  const [signin, seSignin] = useState(false);
  const [files,setFiles] = useState([]);

  const navigate = useNavigate(); 

  useEffect(() => {
    const loadfiles  = async() =>{
      const fetchfiles = await fetch_data()
      setFiles(fetchfiles)
    }
    loadfiles()
  },[])

  const handlesignin = () => {
    if (!isSignedIn) {
      seSignin(true);
    }
  };
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
            <MessageSquareMore size={20} /> Interact 
          </button>
        </div>
        {
          isSignedIn && (
            <div className="flex flex-col gap-5">
            {files.length > 0 &&
              files.map((pdf, index) => (
                <button
                  key={index}
                  className="bg-[#3C3D37] w-full py-2 rounded-lg flex items-center justify-center gap-5"
                  onClick={()=>{navigate(`/dashboard/chat/${pdf}`)}}
                >
                  <FileText />
                  {pdf}
                </button>
              ))}
          </div>
          )
        }
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
});

export default Sidebar;
