import React, { useRef, useState } from "react";
import { FilePlus2, Upload } from "lucide-react";
import { useSetRecoilState } from "recoil";
import { uploadedPDFsAtom } from "../Atoms/atoms";
import axios from "axios";

const Upload_comp = () => {
  const [files, setFiles] = useState(null);
  const [isUploading, setIsUploading] = useState(false); 
  const [uploadStatus, setUploadStatus] = useState(""); 
  const inputRef = useRef(null);
  const setUploadedPDFs = useSetRecoilState(uploadedPDFsAtom);

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = async (event) => {
    event.preventDefault();
    const droppedFiles = event.dataTransfer.files;
    setFiles(droppedFiles);
    await handleFileUpload(droppedFiles); 
  };

  const handleFileSelect = (event) => {
    const selectedFiles = event.target.files;
    setFiles(selectedFiles);
    handleFileUpload(selectedFiles); 
  };

  const handleFileUpload = async (selectedFiles) => {
    setIsUploading(true); 
    const formData = new FormData();
    Array.from(selectedFiles).forEach((file) => {
      formData.append("files", file);
    });

    try {
      const response = await axios.post("http://localhost:8000/upload/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setUploadStatus("Files uploaded successfully!"); 
    } catch (error) {
      console.error("Error uploading files:", error);
      setUploadStatus("Error uploading files!"); 
    } finally {
      setIsUploading(false); 
    }
  };

  return (
    <div className="bg-white w-1/2 rounded-lg shadow-md shadow-gray-500 p-5 font-primaryFontFamily">
      <div
        onDragOver={handleDragOver} 
        onDrop={handleDrop} 
        onClick={() => inputRef.current.click()} 
        className="hover:cursor-pointer hover:bg-purple-200 border-2 border-primary border-dashed rounded-lg w-full h-[18rem] p-5 flex gap-10 items-center justify-center flex-col"
      >
        <FilePlus2 size={50} stroke="gray" />
        <h1 className="font-semibold text-xl">Click to upload, or drag PDF here</h1>
        <button
          onClick={() => inputRef.current.click()}
          className="bg-primary font-semibold py-2 px-5 rounded-lg text-white flex gap-4 items-center justify-center"
        >
          <Upload size={18} /> Upload
        </button>
        <input
          type="file"
          multiple
          className="hidden"
          onChange={handleFileSelect} 
          ref={inputRef}
        />
      </div>

      {isUploading ? (
        <p className="text-gray-500">Uploading...</p>
      ) : (
        <p className="text-green-500">{uploadStatus}</p>
      )}
    </div>
  );
};

export default Upload_comp;
