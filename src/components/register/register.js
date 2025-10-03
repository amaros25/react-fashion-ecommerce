import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./register.css";

function Register() {
  const navigate = useNavigate();
  const [role, setRole] = useState("shoper"); // Default Rolle
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
    // Reset image and form fields when role changes
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);

      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validierung
    if (role === "seller") {
      if (!formData.shopName || !formData.address) {
        setError("Bitte Shop Name und Adresse ausfüllen.");
        return;
      }
      if (!imageFile) {
        setError("Bitte ein Profilbild hochladen.");
        return;
      }
    }
    if (role === "shoper") {
      if (!formData.phone) {
        setError("Bitte Telefonnummer eingeben.");
        return;
      }
    }

    try {
      // Bild hochladen (falls vorhanden)
      let imageUrl = "";
      if (imageFile) {
        const uploadData = new FormData();
        uploadData.append("images", imageFile);

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: uploadData,
        });

        if (!uploadRes.ok) {
          const errText = await uploadRes.text();
          throw new Error("Image upload failed: " + errText);
        }

        const uploadJson = await uploadRes.json();
        imageUrl = uploadJson.urls[0];  // erstes Bild aus dem Array

      }

      // Payload vorbereiten
      let endpoint = "";
      let payload = {};

      if (role === "seller") {
        endpoint = "/api/sellers/create";
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
        endpoint = "/api/users/create";
        payload = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          image: imageUrl || "", // optional
        };
      }

      // Request an Backend
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Registrierung fehlgeschlagen");

      navigate("/login"); // Nach Registrierung zum Login
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="register-container">
      <form className="register-form" onSubmit={handleSubmit}>
        <h2>Registrierung</h2>
        {error && <p className="error">{error}</p>}

        <label>Rolle:</label>
        <select value={role} onChange={handleRoleChange}>
          <option value="shoper">Shoper (normaler Nutzer)</option>
          <option value="seller">Seller</option>
        </select>

        <label>Vorname:</label>
        <input
          type="text"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          required
        />

        <label>Nachname:</label>
        <input
          type="text"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          required
        />

        <label>Email:</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <label>Passwort:</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        {role === "shoper" && (
          <>
            <label>Telefonnummer:</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
            />
            <label>Profilbild (optional):</label>
            <input type="file" accept="image/*" onChange={handleImageChange} />
            {imagePreview && (
              <div className="image-preview">
                <img
                  src={imagePreview}
                  alt="Preview"
                  style={{ width: "150px", height: "150px", objectFit: "cover" }}
                />
                <button type="button" onClick={removeImage}>
                  Bild entfernen
                </button>
              </div>
            )}
          </>
        )}

        {role === "seller" && (
          <>
            <label>Shop Name:</label>
            <input
              type="text"
              name="shopName"
              value={formData.shopName}
              onChange={handleChange}
              required
            />
            <label>Adresse:</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
            />
            <label>Profilbild (Pflicht):</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              required
            />
            {imagePreview && (
              <div className="image-preview">
                <img
                  src={imagePreview}
                  alt="Preview"
                  style={{ width: "150px", height: "150px", objectFit: "cover" }}
                />
                <button type="button" onClick={removeImage}>
                  Bild entfernen
                </button>
              </div>
            )}
          </>
        )}

        <button type="submit">Registrieren</button>
        <p className="login-link">
          Schon registriert? <a href="/login">Login</a>
        </p>
      </form>
    </div>
  );
}

export default Register;
