import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useTranslation } from "react-i18next";
import "./image_select_upload.css"; // keep using this!

function ImageSelectUpload({ onImageChange, maximages }) {
  const { t } = useTranslation();
  const [selectedImages, setSelectedImages] = useState([]);

  const onDrop = useCallback(
    (acceptedFiles) => {
      const total = selectedImages.length + acceptedFiles.length;
      if (total > maximages) {
        alert(t("alter_max_images"));  // "You can only upload up to X images"
        return;
      }

      const newImages = [...selectedImages, ...acceptedFiles].slice(0, maximages);
      setSelectedImages(newImages);
      onImageChange(newImages);
    },
    [selectedImages, onImageChange, t]
  );

  const handleImageDelete = (index) => {
    const updated = selectedImages.filter((_, i) => i !== index);
    setSelectedImages(updated);
    onImageChange(updated);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": []
    },
    multiple: true,
    maxFiles: maximages
  });

  return (
    <div className="image-upload-container">
      <div className="image-upload">
        <div {...getRootProps({ className: "custom-dropzone" })}>
          <input {...getInputProps()} />
          {isDragActive ? (
            <p>{t("drop_here") /* "Drop images here..." */}</p>
          ) : (
            <p>{t("choose_files") /* "Drag & drop or click to select images" */}</p>
          )}
        </div>

        {maximages === 3 && (
          selectedImages.length === maximages ? (
            <p className="max-images-warning">{t("max_images_selected") /* "Maximum images selected" */}</p>
          ) : (
            <p className="images-infos">{t("alter_max_images") /* "You can upload up to 3 images" */}</p>
          )
        )}
      </div>

      <div className={`image-preview ${maximages === 1 ? "single-preview" : ""}`}>
        {selectedImages.map((image, index) => (
          <div key={index} className="image-container">
            <img
              src={URL.createObjectURL(image)}
              alt={`preview-${index}`}
              className="image-thumbnail"
            />
            <button
              className="delete-button-image"
              onClick={() => handleImageDelete(index)}
            >
              X
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ImageSelectUpload;
