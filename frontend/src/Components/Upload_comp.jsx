import { useRef, useState } from "react";
import { FilePlus2, Upload } from "lucide-react";
import { useDispatch } from "react-redux";
import { addMessage } from "../store/slices/chatSlice";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Upload_comp = () => {
  const [files, setFiles] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const inputRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const formatSummary = (summary) => {
    return summary
      .trim()
      .replace(/^Summary:|\n{2,}/g, "")
      .replace(/\n/g, " ")
      .trim();
  };

  const handleUploadSuccess = (results) => {
    results.forEach((result) => {
      const formattedSummary = formatSummary(result.summary);

      dispatch(
        addMessage({
          pdfName: result.file_name,
          message: {
            type: "response",
            text: `✨ PDF "${result.file_name}" has been successfully uploaded! Here's a summary of its contents:`,
          },
        })
      );

      dispatch(
        addMessage({
          pdfName: result.file_name,
          message: {
            type: "response",
            text: formattedSummary,
          },
        })
      );

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

    if (results.length > 0) {
      navigate(`/dashboard/chat/${results[0].file_name}`);
    }
  };

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
      const response = await axios.post(
        "http://localhost:8000/upload/",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setUploadStatus("Files uploaded successfully!");
      handleUploadSuccess(response.data.results);
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
        <h1 className="font-semibold text-xl">
          Click to upload, or drag PDF here
        </h1>
        <button
          onClick={(e) => {
            e.stopPropagation();
            inputRef.current.click();
          }}
          className="bg-primary font-semibold py-2 px-5 rounded-lg text-white flex gap-4 items-center justify-center"
        >
          <Upload size={18} /> Upload
        </button>
        <input
          type="file"
          multiple
          accept=".pdf"
          className="hidden"
          onChange={handleFileSelect}
          ref={inputRef}
        />
      </div>
      <div className="mt-4 text-center">
        {isUploading ? (
          <p className="text-gray-500">Uploading files, please wait...</p>
        ) : (
          <p
            className={
              uploadStatus.includes("Error") ? "text-red-500" : "text-green-500"
            }
          >
            {uploadStatus}
          </p>
        )}
      </div>
    </div>
  );
};

export default Upload_comp;
