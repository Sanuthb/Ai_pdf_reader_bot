import React, { useState } from "react";
import { useParams } from "react-router-dom";
import "../Style/Loading.css"
const ExtrachImages = () => {
  const { filename } = useParams();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleExtractImages = async () => {
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8000/extract_images/", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ pdf_name: filename }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.images && data.images.length > 0) {
        setImages(data.images);
        console.log(images);
      } else {
        setImages([]);
      }
    } catch (err) {
      console.error("Error extracting images:", err);
      setImages([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 flex gap-10 flex-col h-screen overflow-y-scroll">
      <button
        className="bg-primary p-2 rounded-lg w-fit"
        onClick={handleExtractImages}
      >
        Extract Images
      </button>
      {loading && (
        <div className="flex flex-col gap-2">
          <div className="loading-bar">
            <div className="loading-gradient bar1"></div>
          </div>
          <div className="loading-bar ">
            <div className="loading-gradient bar2"></div>
          </div>
          <div className="loading-bar">
            <div className="loading-gradient bar3"></div>
          </div>
        </div>
      )}
      <div style={{ marginTop: "20px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
          {images.length > 0 &&
            images.map((imagePath, index) => (
              <img
                key={index}
                src={`http://localhost:8000/${imagePath}`}
                alt={`Extracted Image ${index + 1}`}
                className="object-contain"
              />
            ))}
        </div>
      </div>
    </div>
  );
};

export default ExtrachImages;
