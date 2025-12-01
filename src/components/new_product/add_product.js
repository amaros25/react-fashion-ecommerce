import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./add_product.css";
import ImageSelectUpload from "./image_select_upload.js";
import { useTranslation } from "react-i18next";
import UploadStatus from "./upload_status";
import { FaPlus, FaTrash, FaPalette } from "react-icons/fa";

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
    type: "",
    sizes: [{ size: "", stock: 0, color: "#000000" }], // Default color black
  });

  const categoryKeys = ["womens", "mens", "kids"];

  const subCategories = {
    womens: ["clothes", "shoes", "bags", "accessories", "beauty", "other-women"],
    mens: ["clothes", "shoes", "accessories", "other-mens"],
    kids: ["girls-clothing", "boys-lothing", "baby-clothing", "other-kids"]
  };
  const [status, setStatus] = useState({
    visible: false,
    loading: false,
    success: false,
    error: false,
  });


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSizeChange = (index, field, value) => {
    const newSizes = [...formData.sizes];
    newSizes[index][field] = field === "stock" ? parseInt(value) || 0 : value;
    setFormData({ ...formData, sizes: newSizes });
  };

  const addSizeField = () => {
    setFormData((prev) => ({
      ...prev,
      sizes: [...prev.sizes, { size: "", stock: 0, color: "#000000" }],
    }));
  };

  const removeSizeField = (index) => {
    if (formData.sizes.length > 1) {
      const newSizes = formData.sizes.filter((_, i) => i !== index);
      setFormData({ ...formData, sizes: newSizes });
    }
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ visible: true, loading: true, success: false, error: false });
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

      const productData = {
        ...formData,
        category: Number(formData.category),
        subcategory: Number(formData.subcategory),
        sizes: formData.sizes, // Sizes now contain hex codes directly
        sellerId: userId,
        price: parseFloat(formData.price),
        image: imageUrls,
        delprice: parseFloat(formData.shipment_price),
        state: 0
      };
      const res = await fetch(`${apiUrl}/products/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });
      if (!res.ok) throw new Error("Product add error");
      setStatus({ visible: true, loading: false, success: true, error: false });
      setTimeout(() => {
        setStatus({ visible: false, loading: false, success: false, error: false });
        navigate("/profile_seller");
      }, 3000);
    } catch (err) {
      console.log("🟢 : Error", err.message);
      setStatus({ visible: true, loading: false, success: false, error: true });
    }
  };

  return (
    <div
      className="add-product-container"
      dir={i18n.language === "ar" ? "rtl" : "ltr"}
    >
      <div className="add-product-header">
        <h2>{t("post_product")}</h2>
        <p>Create a new listing for your shop</p>
      </div>

      <form onSubmit={handleSubmit} className="add-product-form">
        <div className="form-section">
          <h3>Product Images</h3>
          <ImageSelectUpload onImageChange={handleImageChange} maximages={5} />
        </div>

        <div className="form-section">
          <h3>Basic Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label>{t("product_name")}</label>
              <input
                type="text"
                name="name"
                placeholder="e.g. Summer Floral Dress"
                required
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>{t("product_price")}</label>
              <div className="price-input-wrapper">
                <input
                  type="number"
                  name="price"
                  placeholder="0.00"
                  required
                  onChange={handleChange}
                />
                <span className="currency-symbol">TND</span>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>{t("product_shipement_price")}</label>
            <div className="price-input-wrapper">
              <input
                type="number"
                name="shipment_price"
                placeholder="0.00"
                required
                onChange={handleChange}
              />
              <span className="currency-symbol">TND</span>
            </div>
          </div>

          <div className="form-group">
            <label>{t("product_description")}</label>
            <textarea
              name="description"
              placeholder="Describe your product..."
              required
              onChange={handleChange}
              rows="4"
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Category</h3>
          <div className="form-row">
            <div className="form-group">
              <label>{t("select_category")}</label>
              <select
                name="category"
                value={formData.category}
                onChange={(e) => {
                  const catIndex = parseInt(e.target.value);
                  setFormData(prev => ({
                    ...prev,
                    category: catIndex,
                    subcategory: ""
                  }));
                }}
                required
              >
                <option value="">Select Category</option>
                {categoryKeys.map((cat, index) => (
                  <option key={cat} value={index}>
                    {t(`categories.${cat}`)}
                  </option>
                ))}
              </select>
            </div>

            {formData.category !== "" && (
              <div className="form-group">
                <label>{t("select_subcategory")}</label>
                <select
                  name="subcategory"
                  value={formData.subcategory}
                  onChange={(e) =>
                    setFormData(prev => ({
                      ...prev,
                      subcategory: parseInt(e.target.value)
                    }))
                  }
                  required
                >
                  <option value="">Select Subcategory</option>
                  {subCategories[categoryKeys[formData.category]].map((sub, index) => (
                    <option key={index} value={index}>
                      {t(`subcategories.${sub}`)}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        <div className="form-section">
          <div className="section-header">
            <h3>Variants (Size & Color)</h3>
          </div>

          <div className="variants-list">
            {formData.sizes.map((size, index) => (
              <div key={index} className="variant-row">
                <div className="form-group size-input">
                  <label>{t("size_exp")}</label>
                  <input
                    type="text"
                    placeholder="e.g. M, 38"
                    value={size.size}
                    onChange={(e) => handleSizeChange(index, "size", e.target.value)}
                    required
                  />
                </div>
                <div className="form-group stock-input">
                  <label>Stock</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={size.stock}
                    onChange={(e) => handleSizeChange(index, "stock", e.target.value)}
                    required
                  />
                </div>
                <div className="form-group color-input">
                  <label>{t("productColor")}</label>
                  <div className="color-picker-wrapper">
                    <input
                      type="color"
                      value={size.color}
                      onChange={(e) => handleSizeChange(index, "color", e.target.value)}
                      required
                    />
                    <span className="color-code">{size.color}</span>
                  </div>
                </div>
                {formData.sizes.length > 1 && (
                  <button type="button" className="remove-variant-btn" onClick={() => removeSizeField(index)}>
                    <FaTrash />
                  </button>
                )}
              </div>
            ))}
          </div>

          <button type="button" className="add-variant-btn" onClick={addSizeField}>
            <FaPlus /> {t("add_another_size")}
          </button>
        </div>

        <div className="submit-button-wrapper">
          <button type="submit" className="submit-btn">{t("post_product")}</button>
        </div>
      </form>
      <UploadStatus status={status} />
    </div>
  );
}

export default AddProduct;
