import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./add_product.css";
import ImageSelectUpload from "./image_select_upload.js";
import { useTranslation } from "react-i18next";
import UploadStatus from "./upload_status";
import { FaPlus, FaTrash, FaPalette } from "react-icons/fa";
import { useProductUpload } from './hooks/useProductUpload';
import { toast } from "react-toastify";

function AddProduct() {
  const { t, i18n } = useTranslation();
  const userId = localStorage.getItem("userId");
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [resetKey, setResetKey] = useState(0);
  const [error, setError] = useState("");
  const { status, createProduct } = useProductUpload(userId);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    shipment_price: "",
    category: "",
    subcategory: "",
    type: "",
    isStandard: false,
    sizes: [{ size: "", stock: 0, color: "#000000", customSize: "" }],
  });
  const categoryKeys = ["womens", "mens", "kids", "home"];
  const subCategories = {
    womens: ["clothes", "shoes", "bags", "accessories", "beauty", "other-women"],
    mens: ["clothes", "shoes", "accessories", "other-mens"],
    kids: ["girls-clothing", "boys-clothing", "baby-clothing", "other-kids"],
    home: ["kitchen", "furniture", "decor", "bath", "other-home"]
  };


  const sizesList = ["S", "M", "L", "XL", "XXL", "XXXXL", "XXXXXL", "30", "32", "34", "36", "38", "40", "42", "44", "46", "48", "50", t("custom_size")];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSizeChange = (index, field, value) => {
    const newSizes = [...formData.sizes];

    if (field === "size" && value === t("custom_size")) {
      newSizes[index][field] = value;
      newSizes[index].customSize = "";
    } else if (field === "customSize") {
      newSizes[index][field] = value;
    } else {
      newSizes[index][field] = field === "stock" ? parseInt(value) || 0 : value;
    }

    setFormData({ ...formData, sizes: newSizes });
  };

  const addSizeField = () => {
    setFormData((prev) => ({
      ...prev,
      sizes: [...prev.sizes, { size: prev.isStandard ? "OS" : "", stock: 0, color: "#000000" }],
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
    setError("");
    if (!imageFiles.length) {
      setError(t("add_product_error.productImagesRequired"));
      toast.error(t("add_product_error.productImagesRequired"));
      return;
    }

    if (!formData.name) {
      setError(t("add_product_error.productNameRequired"));
      toast.error(t("add_product_error.productNameRequired"));
      return;
    }

    if (!formData.price) {
      setError(t("add_product_error.productPriceRequired"));
      toast.error(t("add_product_error.productPriceRequired"));
      return;
    }
    if (!formData.shipment_price) {
      setError(t("add_product_error.productShipmentPriceRequired"));
      toast.error(t("add_product_error.productShipmentPriceRequired"));
      return;
    }
    if (!formData.description) {
      setError(t("add_product_error.productDescriptionRequired"));
      toast.error(t("add_product_error.productDescriptionRequired"));
      return;
    }
    if (formData.category === "") {
      setError(t("add_product_error.productCategoryRequired"));
      toast.error(t("add_product_error.productCategoryRequired"));
      return;
    }
    if (formData.subcategory === "") {
      setError(t("add_product_error.productSubcategoryRequired"));
      toast.error(t("add_product_error.productSubcategoryRequired"));
      return;
    }

    if (formData.sizes.length === 0) {
      setError(t("add_product_error.productSizesRequired"));
      toast.error(t("add_product_error.productSizesRequired"));
      return;
    }

    for (const s of formData.sizes) {
      if (!s.size || s.size.trim() === "") {
        setError(t("add_product_error.productSizeRequired"));
        toast.error(t("add_product_error.productSizeRequired"));
        return;
      }

      if (s.size === t("custom_size") && !s.customSize) {
        setError(t("add_product_error.productCustomSizeRequired"));
        toast.error(t("add_product_error.productCustomSizeRequired"));
        return;
      }

      if (s.stock === 0) {
        setError(t("add_product_error.productStockRequired"));
        toast.error(t("add_product_error.productStockRequired"));
        return;
      }
    }


    const success = await createProduct(formData, imageFiles);
    if (success) {
      setFormData({
        name: "",
        description: "",
        price: "",
        shipment_price: "",
        category: "",
        subcategory: "",
        type: "",
        isStandard: false,
        sizes: [{ size: "", stock: 1, color: "#000000" }],
      });
      setImageFiles([]);
      setImagePreviews([]);
      setResetKey(prev => prev + 1);
    }
  };

  return (
    <div
      className="add-product-container"
      dir={i18n.language === "ar" ? "rtl" : "ltr"}
    >
      <div className="add-product-header">
        <h2>{t("post_product")}</h2>
        <p>{t("create_new_listing")}</p>
      </div>

      <form onSubmit={handleSubmit} className="add-product-form">
        <div className="form-section">
          <h3>{t("product_images")}</h3>
          <ImageSelectUpload key={resetKey} onImageChange={handleImageChange} maximages={5} />
        </div>

        <div className="form-section">
          <h3>{t("basic_information")}</h3>
          <div className="form-row">
            <div className="form-group">
              <label>{t("product_name")}</label>
              <input
                type="text"
                name="name"
                placeholder={t("example_product_name")}
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
                  placeholder="0.000"
                  value={formData.price}
                  onChange={handleChange}
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
                placeholder="0.000"
                value={formData.shipment_price || ""}
                onChange={handleChange}
              />
              <span className="currency-symbol">{t("price_suf")}</span>
            </div>
          </div>

          <div className="form-group">
            <label>{t("product_description")}</label>
            <textarea
              name="description"
              placeholder={t("describe_your_product")}
              value={formData.description}
              onChange={handleChange}
              rows="4"
            />
          </div>
        </div>

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
                    subcategory: ""
                  }));
                }}
              >
                <option value="">{t("select_category")}</option>
                {categoryKeys.map((cat, index) => (
                  <option key={cat} value={index}>
                    {t(`main-categories.${cat}`)}
                  </option>
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
                      sizes: prev.sizes.map(s => ({
                        ...s,
                        size: isStandard ? "OS" : ""
                      }))
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
                {formData.category === 3 ? (
                  <div className="form-group size-input">
                    <label>{t("product_size")}</label>
                    <input
                      type="text"
                      placeholder={t("exp_100_watt_30_cm")}
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
                      <option value="">{t("select_size")}</option>
                      {sizesList.map((sizeOption) => (
                        <option key={sizeOption} value={sizeOption}>
                          {sizeOption}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                {size.size === t("custom_size") && (
                  <div className="form-group size-input">
                    <label>{t("custom_size")}</label>
                    <input
                      type="text"
                      placeholder={t("enter_custom_size")}
                      value={size.customSize}
                      onChange={(e) => handleSizeChange(index, "customSize", e.target.value)}
                    />
                  </div>
                )}
                <div className="form-group stock-input">
                  <label>Stock</label>
                  <input
                    type="number"
                    placeholder="1"
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

        <div className="submit-button-wrapper">
          <button type="submit" className="submit-btn">{t("post_product")}</button>
        </div>
      </form>
      <UploadStatus status={status} />
    </div>
  );
}

export default AddProduct;
