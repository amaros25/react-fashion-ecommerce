import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import ImageSelectUpload from '../new_product/image_select_upload.js';
import { toast } from "react-toastify";
import { cities, citiesData } from '../utils/const/cities.js';
import { Link } from "react-router-dom";
import ValidateRegisterForm from "./validateregisterform";
import "./register.css";
import { useAuthManager } from "../api_managers/useAuthManager";

import useUploadImageApi from "../upload_image_profile/hooks/upload_image_api";
import { updateImage } from '../api/user_api';
function Register() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const authManager = useAuthManager();

  // States
  const [role, setRole] = useState("user");
  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedSubCity, setSelectedSubCity] = useState(null);
  const [subCities, setSubCities] = useState([]);
  const [selectedCityIndex, setSelectedCityIndex] = useState(null);
  const [selectedSubCityIndex, setSelectedSubCityIndex] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [error, setError] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "", password: "",
    phone: "", shopName: "", address: "", confirmPassword: "",
  });


  const cloudName = process.env.REACT_APP_CLOUD_NAME;
  const uploadPreset = process.env.REACT_APP_UPLOAD_PRESET;
  const { uploadImage } = useUploadImageApi(cloudName, uploadPreset);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCityChange = (e) => {
    const cityIndex = e.target.selectedIndex - 1;
    setSelectedCityIndex(cityIndex);
    const cityName = cities[cityIndex];
    setSelectedCity(cityName);
    setSubCities(citiesData[cityName] || []);
    setSelectedSubCityIndex(null);
  };

  const handleSubCityChange = (e) => {
    const subCityIndex = e.target.selectedIndex - 1;
    setSelectedSubCity(subCities[subCityIndex]);
    setSelectedSubCityIndex(subCityIndex);
  };

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setImageFile(null);
    setFormData({
      firstName: "", lastName: "", email: "", password: "",
      confirmPassword: "", phone: "", shopName: "", address: "",
    });
    setError("");
  };

  // Diese Funktion nutzt die übergebenen IDs direkt (kein State-Warten!)
  const uploadAndSaveImage = async (file, newUserId, newToken) => {
    try {
      const imageUrl = await uploadImage(file);
      if (!imageUrl) throw new Error("Cloudinary Upload failed");
      const res = await updateImage({ userId: newUserId, imageUrl, token: newToken });
      console.log("Image Update Response:", res);
      return res.success;
    } catch (err) {
      console.error("Image Step Error:", err);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    // Bug-Fix: Leerzeichen entfernen für den Passwort-Vergleich
    const cleanFormData = {
      ...formData,
      password: formData.password.trim(),
      confirmPassword: formData.confirmPassword.trim()
    };

    const validationError = ValidateRegisterForm(cleanFormData, role, acceptedTerms, imageFile, selectedCity, selectedSubCity, t);

    if (validationError) {
      setIsSubmitting(false);
      setError(validationError);
      toast.error(validationError);
      return;
    }

    try {
      const payload = {
        firstName: cleanFormData.firstName,
        lastName: cleanFormData.lastName,
        email: cleanFormData.email,
        password: cleanFormData.password,
        phone: cleanFormData.phone,
        address: cleanFormData.address,
        city: selectedCityIndex,
        subCity: selectedSubCityIndex,
        role: role,
        ...(role === "seller" && { shopName: cleanFormData.shopName })
      };

      const response = await authManager.register(payload);

      if (response.success) {
        // Falls ein Bild ausgewählt wurde
        if (imageFile) {
          // Wir nutzen DIREKT response.userId und response.token
          await uploadAndSaveImage(imageFile, response.userId, response.token);

          toast.success(t("register.user_created_successfully"));
          setTimeout(() => navigate("/login"), 1500);
        } else {
          const errorKey = response.error || "default";
          setError(t(`register.error.${errorKey}`));
          toast.error(t(`register.error.${errorKey}`));
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      setError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-page-content">
        <div className="register-container" dir={i18n.language === "ar" ? "rtl" : "ltr"}>
          <form className="register-form" onSubmit={handleSubmit}>
            <h2>{t("register.title")}</h2>
            {error && <p className="error">{error}</p>}

            <div className="role-selection">
              <div className={`role-option ${role === 'user' ? 'active' : ''}`} onClick={() => handleRoleChange('user')}>{t("register.shoper")}</div>
              <div className={`role-option ${role === 'seller' ? 'active' : ''}`} onClick={() => handleRoleChange('seller')}>{t("register.seller")}</div>
            </div>

            <label>{t("register.firstName")}</label>
            <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} />

            <label>{t("register.lastName")}</label>
            <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} />

            <label>{t("register.email")}</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} />

            <div style={{ position: "relative" }}>
              <label>{t("register.password")}</label>
              <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} />
              <span onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", top: "38px", [i18n.dir() === "rtl" ? "left" : "right"]: "10px", cursor: "pointer" }}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            <div style={{ position: "relative" }}>
              <label>{t("register.confirmPassword")}</label>
              <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} />
              <span onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{ position: "absolute", top: "38px", [i18n.dir() === "rtl" ? "left" : "right"]: "10px", cursor: "pointer" }}>
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            <label>{t("register.phone")}</label>
            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} />

            <label>{t("register.address")}</label>
            <input type="text" name="address" value={formData.address} onChange={handleChange} />

            <label>{t("register.city")}</label>
            <select name="city" value={selectedCity || ''} onChange={handleCityChange}>
              <option value="">{t("selectCity")}</option>
              {cities.map((c, i) => <option key={i} value={c}>{c}</option>)}
            </select>

            {selectedCity && (
              <>
                <label>{t("register.subCity")}</label>
                <select name="subCity" value={selectedSubCity || ''} onChange={handleSubCityChange}>
                  <option value="">{t("selectSubCity")}</option>
                  {subCities.map((sc, i) => <option key={i} value={sc}>{sc}</option>)}
                </select>
              </>
            )}

            {role === "seller" && (
              <>
                <label>{t("register.shopName")}</label>
                <input type="text" name="shopName" value={formData.shopName} onChange={handleChange} />
              </>
            )}

            <label>{role === "seller" ? t("register.profileImageRequired") : t("register.profileImageOptional")}</label>
            <ImageSelectUpload onImageChange={(files) => setImageFile(files?.[0])} maximages={1} />

            <div className="terms-checkbox">
              <label>
                <input type="checkbox" checked={acceptedTerms} onChange={() => setAcceptedTerms(!acceptedTerms)} />
                <p>
                  {t("register.acceptTermsPart1")} <Link to="/agb">{t("register.acceptTermsLink1")}</Link>
                  {t("register.acceptTermsPart2")} <Link to="/data_protection">{t("register.acceptTermsLink2")}</Link>
                </p>
              </label>
            </div>

            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? t("register.processing") : t("register.submit")}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Register;