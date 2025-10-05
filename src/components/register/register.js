import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./register.css";
import { useTranslation } from "react-i18next";
import ImageSelectUpload from '../new_product/image_select_upload.js';

function Register({ closePopup, switchToLogin }) {
  const apiUrl = process.env.REACT_APP_API_URL;
  const { t, i18n } = useTranslation();  // i18n hook for translations and language direction
  const navigate = useNavigate(); // navigate for routing (not currently used)

  // State for user role, default to "shoper"
  const [role, setRole] = useState("shoper");

  // State to hold form input values
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    shopName: "",
    address: "",
  });

  // State for selected image file and its preview URL
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // State to store and display error messages
  const [error, setError] = useState("");

  // Generic input change handler for form fields
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle role change - reset form and image states
  const handleRoleChange = (e) => {
    setRole(e.target.value);
    setImageFile(null);
    setImagePreview(null);
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      phone: "",
      shopName: "",
      address: "",
    });
    setError("");
  };

  // Handle image selection from child component
  // Receives an array of files; use the first one if available
  const handleImageChange = (files) => {
    const file = files && files.length > 0 ? files[0] : null;
    if (file) {
      setImageFile(file);
      // Create a preview image URL using FileReader
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setImageFile(null);
      setImagePreview(null);
    }
  };

  // Form submission handler - validates, uploads image, sends data to backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation depending on role
    if (role === "seller") {
      if (!formData.shopName || !formData.address) {
        setError("Bitte Shop Name und Adresse ausfüllen."); // "Please fill shop name and address."
        return;
      }
      if (!imageFile) {
        setError("Bitte ein Profilbild hochladen."); // "Please upload a profile image."
        return;
      }
    }
    if (role === "shoper") {
      if (!formData.phone) {
        setError("Bitte Telefonnummer eingeben."); // "Please enter a phone number."
        return;
      }
    }

    try {
      // Upload image if selected
      let imageUrl = "";
      if (imageFile) {
        const uploadData = new FormData();
        uploadData.append("images", imageFile);

        const uploadRes = await fetch(`${apiUrl}/upload`, {
          method: "POST",
          body: uploadData,
        });

        if (!uploadRes.ok) {
          const errText = await uploadRes.text();
          throw new Error("Image upload failed: " + errText);
        }

        const uploadJson = await uploadRes.json();
        imageUrl = uploadJson.urls[0];  // Use first image URL from response
      }

      // Prepare API endpoint and payload based on role
      let endpoint = "";
      let payload = {};

      if (role === "seller") {
        endpoint = `${apiUrl}/sellers/create`;
        payload = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          shopName: formData.shopName,
          address: formData.address,
          image: imageUrl,
        };
      } else {
        endpoint = `${apiUrl}/users/create`;
        payload = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          image: imageUrl || "", // image is optional here
        };
      }

      // Send registration data to backend
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Registrierung fehlgeschlagen"); // "Registration failed"
      closePopup();
      switchToLogin(); // switch to login view after success
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="register-container" dir={i18n.language === "ar" ? "rtl" : "ltr"}>
      <form className="register-form" onSubmit={handleSubmit}>
        <h2>{t("register.title")}</h2>
        {error && <p className="error">{error}</p>}

        {/* Role selection */}
        <label>{t("register.role")}</label>
        <select value={role} onChange={handleRoleChange}>
          <option value="shoper">{t("register.shoper")}</option>
          <option value="seller">{t("register.seller")}</option>
        </select>

        {/* Basic user info inputs */}
        <label>{t("register.firstName")}</label>
        <input
          type="text"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          required
        />
        <label>{t("register.lastName")}</label>
        <input
          type="text"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          required
        />
        <label>{t("register.email")}</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <label>{t("register.password")}</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        {/* Role-specific fields */}
        {role === "shoper" && (
          <>
            <label>{t("register.phone")}</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
            />
            <label>{t("register.profileImageOptional")}</label>
            <ImageSelectUpload onImageChange={handleImageChange} maximages={1} />
          </>
        )}

        {role === "seller" && (
          <>
            <label>{t("register.shopName")}</label>
            <input
              type="text"
              name="shopName"
              value={formData.shopName}
              onChange={handleChange}
              required
            />
            <label>{t("register.address")}</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
            />
            <label>{t("register.profileImageRequired")}</label>
            <ImageSelectUpload onImageChange={handleImageChange} maximages={1} />
          </>
        )}

        <button type="submit">{t("register.submit")}</button>

        <p className="login-link">
          {t("register.alreadyRegistered")}
          <span
            onClick={switchToLogin}
            style={{ color: "#0077cc", cursor: "pointer", textDecoration: "underline" }}
          >
            {t("login")}
          </span>
        </p>
      </form>
    </div>
  );
}

export default Register;
