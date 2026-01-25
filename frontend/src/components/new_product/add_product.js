import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./add_product.css";
import ImageSelectUpload from "./image_select_upload.js";
import { useTranslation } from "react-i18next";
import UploadStatus from "./upload_status";
import { FaPlus, FaTrash, FaPalette } from "react-icons/fa";
import { toast } from "react-toastify";
import { useSellerProductAddManager } from "../api_managers/useSellerProductAddManager";

/**
 * Initial state for the product form.
 * This structure matches the required data for creating a new product.
 */
const initialFormState = {
  name: "",
  description: "",
  price: "",
  shipment_price: "",
  category: "",
  subcategory: "",
  type: "",
  isStandard: false,
  sizes: [{ size: "", stock: 1, color: "#000000", customSize: "" }],
};

function AddProduct({ sellerId, token, seller }) {
  const { t, i18n } = useTranslation();
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [resetKey, setResetKey] = useState(0); // Key to force re-mounting components like image upload on reset
  const [error, setError] = useState("");

  // Custom hook that manages the API request and returns the upload status object (isSubmitting)
  const { addProduct, isSubmitting } = useSellerProductAddManager(sellerId, token);

  const isProfileComplete = seller?.shopName && seller?.phone && seller?.address &&
    seller?.city !== undefined && seller?.subCity !== undefined;

  const [formData, setFormData] = useState(initialFormState);

  // Mapping of category internal keys for translation and logic
  const categoryKeys = ["womens", "mens", "kids", "home"];
  const subCategories = {
    womens: ["clothes", "shoes", "bags", "accessories", "beauty", "other-women"],
    mens: ["clothes", "shoes", "accessories", "other-mens"],
    kids: ["girls-clothing", "boys-clothing", "baby-clothing", "other-kids"],
    home: ["kitchen", "furniture", "decor", "bath", "other-home"]
  };

  // Predefined list of sizes for the dropdown
  const sizesList = ["S", "M", "L", "XL", "XXL", "XXXXL", "XXXXXL", "30", "32", "34", "36", "38", "40", "42", "44", "46", "48", "50", t("custom_size")];

  /**
   * Handles changes for top-level form fields (name, price, etc.)
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /**
   * Updates specific fields within the 'sizes' (variants) array.
   * Logic handles standard sizes, custom sizes, and stock integers.
   */
  const handleSizeChange = (index, field, value) => {
    const newSizes = [...formData.sizes];

    if (field === "size" && value === t("custom_size")) {
      newSizes[index][field] = value;
      newSizes[index].customSize = ""; // Initialize custom size text field
    } else if (field === "customSize") {
      newSizes[index][field] = value;
    } else {
      // Convert stock string to integer, default to 0 if invalid
      newSizes[index][field] = field === "stock" ? parseInt(value) || 0 : value;
    }

    setFormData({ ...formData, sizes: newSizes });
  };

  /**
   * Adds a new variant row (Size, Stock, Color) to the product
   */
  const addSizeField = () => {
    setFormData((prev) => ({
      ...prev,
      sizes: [...prev.sizes, { size: prev.isStandard ? "OS" : "", stock: 1, color: "#000000" }],
    }));
  };

  /**
   * Removes a specific variant row by its index, ensuring at least one remains
   */
  const removeSizeField = (index) => {
    if (formData.sizes.length > 1) {
      const newSizes = formData.sizes.filter((_, i) => i !== index);
      setFormData({ ...formData, sizes: newSizes });
    }
  };

  /**
   * Process selected images and generate base64 previews for the UI
   */
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

  /**
   * Validates the form data and triggers the product creation API
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // --- Validation Checks ---
    if (!imageFiles.length) {
      toast.error(t("add_product_error.productImagesRequired"));
      return;
    }
    if (!formData.name) {
      toast.error(t("add_product_error.productNameRequired"));
      return;
    }
    if (!formData.price) {
      toast.error(t("add_product_error.productPriceRequired"));
      return;
    }
    if (!formData.shipment_price) {
      toast.error(t("add_product_error.productShipmentPriceRequired"));
      return;
    }
    if (!formData.description) {
      toast.error(t("add_product_error.productDescriptionRequired"));
      return;
    }
    if (formData.category === "" || formData.subcategory === "") {
      toast.error(t("add_product_error.productCategoryRequired"));
      return;
    }

    // --- Variant Validation Loop ---
    for (const s of formData.sizes) {
      if (!s.size || s.size.trim() === "") {
        toast.error(t("add_product_error.productSizeRequired"));
        return;
      }
      if (s.size === t("custom_size") && !s.customSize) {
        toast.error(t("add_product_error.productCustomSizeRequired"));
        return;
      }
      if (s.stock === 0) {
        toast.error(t("add_product_error.productStockRequired"));
        return;
      }
    }

    // --- Prepare Final Data Object ---
    const productData = {
      ...formData,
      variants: formData.sizes.map(s => ({
        size: s.size === t("custom_size") ? s.customSize : s.size,
        stock: s.stock,
        color: s.color
      }))
    };

    // Execute upload via manager hook
    const result = await addProduct(productData, imageFiles);

    // Reset form on success
    if (result.success) {
      setFormData(initialFormState);
      setImageFiles([]);
      setImagePreviews([]);
      setResetKey(prev => prev + 1);
    }
  };

  return (
    <div className="add-product-container" dir={i18n.language === "ar" ? "rtl" : "ltr"}>
      <div className="add-product-header">
        <h2>{t("post_product")}</h2>
        <p>{t("create_new_listing")}</p>
      </div>

      <form onSubmit={handleSubmit} className="add-product-form">
        {/* Product Images Section */}
        <div className="form-section">
          <h3>{t("product_images")}</h3>
          <ImageSelectUpload key={resetKey} onImageChange={handleImageChange} maximages={5} />
        </div>

        {/* Core Product Details */}
        <div className="form-section">
          <h3>{t("basic_information")}</h3>
          <div className="form-row">
            <div className="form-group">
              <label>{t("product_name")}</label>
              <input
                type="text"
                name="name"
                placeholder={t("example_product_name")} // Placeholder restored
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label>{t("product_price")}</label>
              <div className="price-input-wrapper">
                <input
                  type="number"
                  name="price"
                  placeholder="0.000" // Placeholder restored
                  value={formData.price}
                  onChange={handleChange}
                  min="0"
                  step="0.100" // Precision step to allow decimals like .200
                />
                <span className="currency-symbol">{t("price_suf")}</span>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>{t("product_shipement_price")}</label>
            <div className="price-input-wrapper">
              <input
                type="number"
                name="shipment_price"
                placeholder="0.000" // Placeholder restored
                value={formData.shipment_price || ""}
                onChange={handleChange}
                min="0"
                step="0.100"
              />
              <span className="currency-symbol">{t("price_suf")}</span>
            </div>
          </div>

          <div className="form-group">
            <label>{t("product_description")}</label>
            <textarea
              name="description"
              placeholder={t("describe_your_product")} // Placeholder restored
              value={formData.description}
              onChange={handleChange}
              rows="4"
            />
          </div>
        </div>

        {/* Category & Subcategory Selects */}
        <div className="form-section">
          <h3>{t("category")}</h3>
          <div className="form-row">
            <div className="form-group">
              <select
                name="category"
                value={formData.category}
                onChange={(e) => {
                  const val = e.target.value;
                  const catIndex = val === "" ? "" : parseInt(val);
                  setFormData(prev => ({
                    ...prev,
                    category: catIndex,
                    subcategory: "" // Reset subcategory when main category changes
                  }));
                }}
              >
                <option value="">{t("select_category")}</option>
                {categoryKeys.map((cat, index) => (
                  <option key={cat} value={index}>{t(`main-categories.${cat}`)}</option>
                ))}
              </select>
            </div>

            {formData.category !== "" && (
              <div className="form-group">
                <select
                  name="subcategory"
                  value={formData.subcategory}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData(prev => ({
                      ...prev,
                      subcategory: val === "" ? "" : parseInt(val)
                    }));
                  }}
                >
                  <option value="">{t("select_subcategory")}</option>
                  {subCategories[categoryKeys[formData.category]].map((sub, index) => (
                    <option key={index} value={index}>{t(`subcategories.${sub}`)}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Variants (Size/Stock/Color) Section */}
        <div className="form-section">
          <div className="section-header">
            <h3>{t("variants")}</h3>
            <div className="checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.isStandard}
                  onChange={(e) => {
                    const isStandard = e.target.checked;
                    setFormData(prev => ({
                      ...prev,
                      isStandard,
                      sizes: prev.sizes.map(s => ({ ...s, size: isStandard ? "OS" : "" }))
                    }));
                  }}
                />
                {t("Standard Size")}
              </label>
            </div>
          </div>

          <div className="variants-list">
            {formData.sizes.map((size, index) => (
              <div key={index} className="variant-row">
                {/* Logic for Category 3 (Home) which uses text input for size */}
                {formData.category === 3 ? (
                  <div className="form-group size-input">
                    <label>{t("product_size")}</label>
                    <input
                      type="text"
                      placeholder={t("exp_100_watt_30_cm")} // Placeholder restored
                      value={size.size}
                      onChange={(e) => handleSizeChange(index, "size", e.target.value)}
                    />
                  </div>
                ) : (
                  <div className="form-group size-input">
                    <label>{t("select_size")}</label>
                    <select
                      value={size.size}
                      onChange={(e) => handleSizeChange(index, "size", e.target.value)}
                      disabled={formData.isStandard}
                    >
                      {formData.isStandard && <option value="OS">OS</option>}
                      <option value="">{t("select_size")}</option>
                      {sizesList.map((sizeOption) => (
                        <option key={sizeOption} value={sizeOption}>{sizeOption}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Custom size input visible only when 'Custom' is selected */}
                {size.size === t("custom_size") && (
                  <div className="form-group size-input">
                    <label>{t("custom_size")}</label>
                    <input
                      type="text"
                      placeholder={t("enter_custom_size")} // Placeholder restored
                      value={size.customSize}
                      onChange={(e) => handleSizeChange(index, "customSize", e.target.value)}
                    />
                  </div>
                )}

                <div className="form-group stock-input">
                  <label>Stock</label>
                  <input
                    type="number"
                    placeholder="1" // Placeholder restored
                    value={size.stock}
                    onChange={(e) => handleSizeChange(index, "stock", e.target.value)}
                    min={1}
                  />
                </div>

                <div className="form-group color-input">
                  <label>{t("productColor")}</label>
                  <div className="color-picker-wrapper">
                    <input
                      type="color"
                      value={size.color}
                      onChange={(e) => handleSizeChange(index, "color", e.target.value)}
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

        {/* Submit Wrapper */}
        <div className="submit-area-wrapper">
          <button
            type="submit"
            className={`main-submit-btn ${!isProfileComplete ? "is-locked" : ""}`}
            disabled={isSubmitting?.loading || !isProfileComplete}
          >
            {isSubmitting?.loading ? t("processing") : t("post_product")}
          </button>

          {!isProfileComplete && (
            <div className="status-notice-container">
              <p className="status-notice-text">
                {t("profile_incomplete_text")}
              </p>
              <button
                type="button"
                className="status-action-link"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                {t("go_to_profile_settings")}
              </button>
            </div>
          )}
        </div>
      </form>

      {/* Upload Overlay - controlled by isSubmitting state */}
      {isSubmitting && isSubmitting.visible && <UploadStatus status={isSubmitting} />}
    </div>
  );
}

export default AddProduct;