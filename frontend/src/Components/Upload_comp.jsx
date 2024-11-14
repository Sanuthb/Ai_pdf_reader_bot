import React, { useRef } from "react";
import { FilePlus2, Upload } from "lucide-react";
import { useState } from "react";
const Upload_comp = () => {
  const [files, setFiles] = useState(null);
  const inputref = useRef(null);
  const handledragover = (event) => {
    event.preventDefault();
  };

  const handledrag = (event) => {
    event.preventDefault();
  };

  return (
    <div className="bg-white w-1/2 rounded-lg shadow-md shadow-gray-500  p-5 font-primaryFontFamily">
      <div
        onDrag={handledrag}
        onDragOver={handledragover}
        onClick={() => {inputref.current.click()}}
        className="hover:cursor-pointer hover:bg-purple-200 border-2 border-primary border-dashed rounded-lg  w-full  h-[18rem] p-5 flex gap-10 items-center justify-center flex-col"
      >
        <FilePlus2 size={50} stroke="gray" />
        <h1 className="font-semibold text-xl">
          Click to upload, or drag PDF here
        </h1>
        <button
          onClick={() => {inputref.current.click()}}
          className="bg-primary font-semibold py-2 px-5 rounded-lg text-white flex gap-4 items-center justify-center"
        >
          <Upload size={18} /> Upload
        </button>
        <input
          type="file"
          multiple
          className="hidden"
          onChange={(e) => {
            setFiles(e.target.files);
          }}
          ref={inputref}
        />
      </div>
    </div>
  );
};

export default Upload_comp;
