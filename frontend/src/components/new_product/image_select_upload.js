import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useTranslation } from "react-i18next";
import { FaCamera, FaTimes } from "react-icons/fa"; // Added Icons
import "./image_select_upload.css";

function ImageSelectUpload({ onImageChange, maximages }) {
  const { t } = useTranslation();
  const [selectedImages, setSelectedImages] = useState([]);

  const onDrop = useCallback(
    (acceptedFiles) => {
      const total = selectedImages.length + acceptedFiles.length;
      if (total > maximages) {
        alert(t("alter_max_images"));
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
      <div className="image-upload-section">
        <div {...getRootProps({ className: "custom-dropzone-zara" })}>
          <input {...getInputProps()} />
          <FaCamera className="camera-icon-zara" />
          {isDragActive ? (
            <span className="dropzone-text-zara">{t("drop_here")}</span>
          ) : (
            <span className="dropzone-text-zara">{t("choose_files")}</span>
          )}
        </div>

        {maximages === 3 && (
          <div className="upload-info-box">
            {selectedImages.length === maximages ? (
              <p className="max-images-warning-zara">{t("max_images_selected")}</p>
            ) : (
              <p className="images-infos-zara">{t("alter_max_images")}</p>
            )}
          </div>
        )}
      </div>

      <div className={`image-preview-zara ${maximages === 1 ? "single-preview-zara" : ""}`}>
        {selectedImages.map((image, index) => (
          <div key={index} className="preview-item-zara">
            <img
              src={URL.createObjectURL(image)}
              alt={`preview-${index}`}
              className="preview-img-zara"
            />
            <button
              className="delete-btn-zara"
              onClick={() => handleImageDelete(index)}
              title="Delete"
            >
              <FaTimes />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ImageSelectUpload;
