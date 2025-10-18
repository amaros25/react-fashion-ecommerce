import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./add_product.css";
import ImageSelectUpload from "./image_select_upload.js";
import { useTranslation } from "react-i18next";

function AddProduct() {
  const { t, i18n } = useTranslation();
  const apiUrl = process.env.REACT_APP_API_URL;
  const cloudName = process.env.REACT_APP_CLOUD_NAME;
  const uploadPreset = process.env.REACT_APP_UPLOAD_PRESET;
  const imageUrls = [];
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    type: "test",
    sizes: [{ size: "", stock: 0, color: "" }],
  });

  const colors = t("product_colors", { returnObjects: true });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSizeChange = (index, field, value) => {
    const newSizes = [...formData.sizes];
    newSizes[index][field] = field === "stock" ? parseInt(value) : value;
    setFormData({ ...formData, sizes: newSizes });
  };

  const addSizeField = () => {
    setFormData((prev) => ({
      ...prev,
      sizes: [...prev.sizes, { size: "", stock: 0, color: "" }],
    }));
  };

  const handleImageChange = (files) => {
    setImageFiles(files);
    const previewPromises = files.map((file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });

    Promise.all(previewPromises).then((imgs) => {
      setImagePreviews(imgs);
    });
  };

  const removeImage = (index) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      for (const file of imageFiles) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", uploadPreset);
        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          {
            method: "POST",
            body: formData,
          }
        );
        if (!res.ok) throw new Error("Image upload failed");
        const data = await res.json();
        imageUrls.push(data.secure_url);
      }

      const productSizes = formData.sizes.map(size => {
        // Wenn "other" ausgewählt und eine benutzerdefinierte Farbe eingegeben wurde, dann die customColor verwenden
        if (size.color === "other" && size.customColor) {
          return { ...size, color: size.customColor };  // Die benutzerdefinierte Farbe ersetzen
        }
        return size;
      });

      const productData = {
        ...formData,
        sizes: productSizes,
        sellerId: userId,
        price: parseFloat(formData.price),
        image: imageUrls,
      };
      const res = await fetch(`${apiUrl}/products/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });
      if (!res.ok) throw new Error("Product add error");
      alert("Product added successfully!");
      navigate("/profile_seller");
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  return (
    <div
      className="add-product-container"
      dir={i18n.language === "ar" ? "rtl" : "ltr"}
    >
      <form onSubmit={handleSubmit} className="add-product-form">
        <ImageSelectUpload onImageChange={handleImageChange} maximages={3} />
        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          required
        >
          <option value="">{t("select_category")}</option>
          <option value="womensClothing">
            {t("categories.womensClothing")}
          </option>
          <option value="mensClothing">{t("categories.mensClothing")}</option>
          <option value="shoes">{t("categories.shoes")}</option>
          <option value="womensUnderwear">
            {t("categories.womensUnderwear")}
          </option>
          <option value="mensUnderwear">{t("categories.mensUnderwear")}</option>
          <option value="bags">{t("categories.bags")}</option>
          <option value="kidsClothing">{t("categories.kidsClothing")}</option>
          <option value="babyClothing">{t("categories.babyClothing")}</option>
        </select>

        <input
          type="text"
          name="name"
          placeholder={t("product_name")}
          required
          onChange={handleChange}
        />
        <textarea
          name="description"
          placeholder={t("product_description")}
          required
          onChange={handleChange}
        />
        <input
          type="number"
          name="price"
          placeholder={t("product_price")}
          required
          onChange={handleChange}
        />

        <h4>{t("size_stock_color")}</h4>
        {formData.sizes.map((size, index) => (
          <div key={index} className="size-field">
            <input
              type="text"
              placeholder={t("size_exp")}
              value={size.size}
              onChange={(e) => handleSizeChange(index, "size", e.target.value)}
              required
            />
            <input
              type="number"
              placeholder="Stock"
              value={size.stock}
              onChange={(e) => handleSizeChange(index, "stock", e.target.value)}
              required
            />

            {/* Color Dropdown */}
            <select
              name="color"
              value={size.color}
              onChange={(e) => handleSizeChange(index, "color", e.target.value)}
              required
            >
              <option value="">{t("select_color")}</option>
              {Object.keys(colors).map((colorKey) => (
                <option key={colorKey} value={colorKey}>
                  {colors[colorKey]}{" "}
                  {/* Zeigt den Namen der Farbe in der aktuellen Sprache */}
                </option>
              ))}
              <option value="other">{t("other")}</option>
            </select>

            {/* Input for custom color */}
            {size.color === "other" && (
              <input
                type="text"
                placeholder={t("enter_custom_color")}
                value={size.customColor || ""}
                onChange={(e) =>
                  handleSizeChange(index, "customColor", e.target.value)
                }
              />
            )}
          </div>
        ))}

        <button type="button" onClick={addSizeField}>
          + {t("add_another_size")}
        </button>

        <div className="submit-button-wrapper">
          <button type="submit">{t("post_product")}</button>
        </div>
      </form>
    </div>
  );
}

export default AddProduct;
