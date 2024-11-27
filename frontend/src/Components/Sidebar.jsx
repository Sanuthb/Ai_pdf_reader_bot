import React, { useEffect, useRef, useState } from "react";
import { Plus, FileText } from "lucide-react";
import Blank_comp from "./Blank_comp";
import { UserButton, useUser } from "@clerk/clerk-react";
import Signin from "./Signin";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setFiles, setSelectedFile } from "../store/slices/fileSlice";
import fetch_data from "../apis/api";
import { addMessage } from "../store/slices/chatSlice";

const Sidebar = React.memo(() => {
  const { isSignedIn } = useUser();
  const [signin, setSignin] = useState(false);
  const dispatch = useDispatch();
  const files = useSelector((state) => state.files.uploadedFiles);
  const navigate = useNavigate();
  const newchatref = useRef(null);

  const handleFileSelect = (event) => {
    const selectedFiles = event.target.files;
    handleFileUpload(selectedFiles);
  };

  const handleFileUpload = async (selectedFiles) => {
    setIsUploading(true);
    const formData = new FormData();
    Array.from(selectedFiles).forEach((file) => {
      formData.append("files", file);
    });

    try {
      const response = await axios.post(
        "http://localhost:8000/upload/",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      handleUploadSuccess(response.data.results);
    } catch (error) {
      console.error("Error uploading files:", error);
    }
  };

  const handleUploadSuccess = (results) => {
    results.forEach((result) => {
      const formattedSummary = formatSummary(result.summary);

      // Add system message about successful upload
      dispatch(
        addMessage({
          pdfName: result.file_name,
          message: {
            type: "response",
            text: `✨ PDF "${result.file_name}" has been successfully uploaded! Here's a summary of its contents:`,
          },
        })
      );

      // Add the formatted summary
      dispatch(
        addMessage({
          pdfName: result.file_name,
          message: {
            type: "response",
            text: formattedSummary,
          },
        })
      );

      // Add a helpful prompt
      dispatch(
        addMessage({
          pdfName: result.file_name,
          message: {
            type: "response",
            text: "You can now ask questions about this document or generate a quiz to test your understanding! 📚",
          },
        })
      );
    });

    // Navigate to the chat interface for the first uploaded file
    if (results.length > 0) {
      navigate(`/dashboard/chat/${results[0].file_name}`);
    }
  };

  useEffect(() => {
    const loadFiles = async () => {
      const fetchedFiles = await fetch_data();
      dispatch(setFiles(fetchedFiles));
    };
    loadFiles();
  }, [dispatch]);
  const handleFileClick = (pdf) => {
    dispatch(setSelectedFile(pdf));
    navigate(`/dashboard/chat/${pdf}`);
  };

  const handlesignin = () => {
    if (!isSignedIn) {
      setSignin(true);
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
          {isSignedIn && (
            <input
              type="file"
              multiple
              accept=".pdf"
              className="hidden"
              onChange={handleFileSelect}
              ref={newchatref}
            />
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              newchatref.current.click();
            }}
            className="w-full p-2 flex items-center justify-center gap-4 border-[.1rem] border-gray-500 rounded-lg hover:bg-[#3C3D37] text-sm"
          >
            <Plus size={15} />
            New Chat
          </button>
        </div>
        {isSignedIn && (
          <div className="flex flex-col gap-5">
            {files.length > 0 &&
              files.map((pdf, index) => (
                <button
                  key={index}
                  className="bg-[#3C3D37] w-full py-2 rounded-lg flex items-center justify-center gap-5"
                  onClick={() => handleFileClick(pdf)}
                >
                  <FileText />
                  {pdf}
                </button>
              ))}
          </div>
        )}
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
