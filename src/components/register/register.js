import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./register.css";
import { useTranslation } from "react-i18next";
import ImageSelectUpload from '../new_product/image_select_upload.js';


function Register() {
  const apiUrl = process.env.REACT_APP_API_URL;
  const cloudName = process.env.REACT_APP_CLOUD_NAME;
  const uploadPreset = process.env.REACT_APP_UPLOAD_PRESET;
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [role, setRole] = useState("shoper");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    shopName: "",
    address: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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

  const handleImageChange = (files) => {
    const file = files && files.length > 0 ? files[0] : null;
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setImageFile(null);
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (role === "seller") {
      if (!formData.shopName || !formData.address) {
        setError(t("register.error.fillShopNameAddress"));
        return;
      }
      if (!imageFile) {
        setError(t("register.error.uploadProfileImage"));
        return;
      }
    }
    if (role === "shoper") {
      if (!formData.phone) {
        setError(t("register.error.enterPhone"));
        return;
      }
    }

    try {
      let imageUrl = "";

      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);
        formData.append("upload_preset", uploadPreset);

        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: "POST",
          body: formData,
        });

        if (!res.ok) throw new Error("Image upload failed");

        const data = await res.json();
        imageUrl = data.secure_url;
      }

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
          image: imageUrl || "",
        };
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(t("register.error.registrationFailed"));

      navigate("/login");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="register-page">

      <div className="register-page-content">
        <div className="register-container" dir={i18n.language === "ar" ? "rtl" : "ltr"}>
          <form className="register-form" onSubmit={handleSubmit}>
            <h2>{t("register.title")}</h2>
            {error && <p className="error">{error}</p>}

            <label>{t("register.role")}</label>
            <select value={role} onChange={handleRoleChange}>
              <option value="shoper">{t("register.shoper")}</option>
              <option value="seller">{t("register.seller")}</option>
            </select>

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
                onClick={() => navigate("/login")}
                style={{ color: "#0077cc", cursor: "pointer", textDecoration: "underline" }}
              >
                {t("login")}
              </span>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Register;
