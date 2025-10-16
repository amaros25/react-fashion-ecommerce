import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./add_product.css";
import ImageSelectUpload from './image_select_upload.js';

function AddProduct() {
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

  const colors = [
    "Red", "Blue", "Green", "Yellow", "Black", "White", "Orange", "Purple",
    "Pink", "Brown", "Gray", "Beige", "Teal", "Violet", "Indigo", "Turquoise"
  ]; // List of standard colors

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSizeChange = (index, field, value) => {
    const newSizes = [...formData.sizes];
    newSizes[index][field] = field === "stock" ? parseInt(value) : value;
    setFormData({ ...formData, sizes: newSizes });
  };

  const addSizeField = () => {
    setFormData(prev => ({
      ...prev,
      sizes: [...prev.sizes, { size: "", stock: 0, color: "" }]
    }));
  };

  const handleImageChange = (files) => {
    setImageFiles(files);
    const previewPromises = files.map(file => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });

    Promise.all(previewPromises).then(imgs => {
      setImagePreviews(imgs);
    });
  };

  const removeImage = (index) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      console.log("🟡apiUrl", apiUrl);
      console.log("🟡 cloudName:", cloudName);
      console.log("🟡 uploadPreset:", uploadPreset);

      for (const file of imageFiles) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", uploadPreset);

        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: "POST",
          body: formData,
        });

        if (!res.ok) throw new Error("Image upload failed");

        const data = await res.json();
        imageUrls.push(data.secure_url);
      }

      const productData = {
        ...formData,
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
    <div className="add-product-container">
      <form onSubmit={handleSubmit} className="add-product-form">
        <ImageSelectUpload onImageChange={handleImageChange} maximages={3} />

        <select name="category" value={formData.category} onChange={handleChange} required>
          <option value="">Select a category</option>
          <option value="womensClothing">Women's clothing</option>
          <option value="mensClothing">Men's clothing</option>
          <option value="shoes">Shoes</option>
          <option value="womensUnderwear">Women's underwear</option>
          <option value="mensUnderwear">Men's underwear</option>
          <option value="bags">Bags and accessories</option>
          <option value="kidsClothing">Kids' clothing</option>
          <option value="babyClothing">Baby clothing</option>
        </select>

        <input type="text" name="name" placeholder="Product Name" required onChange={handleChange} />
        <textarea name="description" placeholder="Description" required onChange={handleChange} />
        <input type="number" name="price" placeholder="Price (€)" required onChange={handleChange} />

        <h4>Sizes & Stock</h4>
        {formData.sizes.map((size, index) => (
          <div key={index} className="size-field">
            <input
              type="text"
              placeholder="Size (e.g. M, 36)"
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
              <option value="">Select color</option>
              {colors.map((color, i) => (
                <option key={i} value={color}>{color}</option>
              ))}
              <option value="other">Other</option>
            </select>

            {/* Input for custom color */}
            {size.color === "other" && (
              <input
                type="text"
                placeholder="Enter custom color"
                value={size.customColor || ""}
                onChange={(e) => handleSizeChange(index, "customColor", e.target.value)}
              />
            )}
          </div>
        ))}

        <button type="button" onClick={addSizeField}>+ Add Another Size</button>

        <div className="submit-button-wrapper">
          <button type="submit">Create Product</button>
        </div>
      </form>
    </div>
  );
}

export default AddProduct;
