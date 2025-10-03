import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useTranslation } from "react-i18next";
import "./image_select_upload.css"; // weiter verwenden!

function ImageSelectUpload({ onImageChange }) {
  const { t } = useTranslation();
  const [selectedImages, setSelectedImages] = useState([]);

  const onDrop = useCallback(
    (acceptedFiles) => {
      const total = selectedImages.length + acceptedFiles.length;
      if (total > 3) {
        alert(t("alter_max_images"));
        return;
      }

      const newImages = [...selectedImages, ...acceptedFiles].slice(0, 3);
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
    maxFiles: 3
  });

  return (
    <div className="image-upload-container">
      <div className="image-upload">
        <div {...getRootProps({ className: "custom-dropzone" })}>
          <input {...getInputProps()} />
          {isDragActive ? (
            <p>{t("drop_here")}</p>
          ) : (
            <p>{t("choose_files")}</p>
          )}
        </div>

 

        {selectedImages.length === 3 ? (
          <p className="max-images-warning">{t("max_images_selected")}</p>
        ) : (
          <p className="images-infos">{t("alter_max_images")}</p>
        )}
      </div>

      <div className="image-preview">
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
