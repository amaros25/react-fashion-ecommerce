import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./register.css";
import { useTranslation } from "react-i18next";
import ImageSelectUpload from '../new_product/image_select_upload.js';
import { toast } from "react-toastify";
import { cities, citiesData } from '../utils/const/cities.js';
import useRegisterApi from "./hooks/useRegisterApi";
import { Link } from "react-router-dom";
import ValidateRegisterForm from "./validateregisterform";
import { generateRegisterPayload } from "./generate_payload";

function Register() {
  const apiUrl = process.env.REACT_APP_API_URL;
  const cloudName = process.env.REACT_APP_CLOUD_NAME;
  const uploadPreset = process.env.REACT_APP_UPLOAD_PRESET;
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [role, setRole] = useState("shoper");
  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedSubCity, setSelectedSubCity] = useState(null);
  const [subCities, setSubCities] = useState([]);
  const [selectedCityIndex, setSelectedCityIndex] = useState(null);
  const [selectedSubCityIndex, setSelectedSubCityIndex] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const { uploadImage, registerUser, updateImage } = useRegisterApi(cloudName, uploadPreset);

  const cmandiLink = "/agb";
  const privacyLink = "/data_protection";

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    shopName: "",
    address: "",
  });

  const handleCheckboxChange = () => {
    setAcceptedTerms(!acceptedTerms);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCityChange = (e) => {
    const cityIndex = e.target.selectedIndex - 1;
    setSelectedCityIndex(cityIndex);
    const selectedCityName = cities[cityIndex];
    setSelectedCity(selectedCityName);
    setSubCities(citiesData[cities[cityIndex]] || []);
    setSelectedSubCityIndex(null);
  };

  const handleSubCityChange = (e) => {
    const subCityIndex = e.target.selectedIndex - 1;
    const selectedSubCityName = subCities[subCityIndex];
    setSelectedSubCity(selectedSubCityName);
    setSelectedSubCityIndex(subCityIndex);
  };

  const handleRoleChange = (newRole) => {
    setRole(newRole);
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

  const handleValidationError = (message) => {
    setError(message);
    toast.error(message);
  };

  const upload_profile_image = async (userId) => {
    if (!imageFile) {
      console.log("No Image Selected");
      return;
    }
    try {
      const imageUrl = imageFile ? await uploadImage(imageFile) : "";
      if (!imageUrl) {
        console.error("Image upload failed");
        toast.error(t("register.error.image_upload_failed"));
        return;
      }
      let endpoint = "";
      if (role === "seller") {
        endpoint = `${apiUrl}/sellers/${userId}/updateImage`;
      } else {
        endpoint = `${apiUrl}/users/${userId}/updateImage`;
      }
      const updateResponse = await updateImage(endpoint, { imageUrl });
      if (!updateResponse.success) {
        console.error("Error updating image URL in DB:", updateResponse.error);
      } else {
        console.log("Image updated successfully");
        toast.success(t("register.image_updated_successfully"));
      }
    } catch (error) {
      console.error("Error uploading image:", error.message);
      toast.error(t("register.error.image_upload_failed"));
    }
  };

  const handleSubmit = async (e) => {
    console.log("handleSubmit formData: ", formData);
    e.preventDefault();
    setError("");
    const error = ValidateRegisterForm(formData, role, acceptedTerms, imageFile, selectedCity, selectedSubCity, t);
    if (error) {
      handleValidationError(error);
      return;
    }
    try {
      const { endpoint, payload } = generateRegisterPayload(apiUrl, formData, role, selectedCityIndex, selectedSubCityIndex);
      const response = await registerUser(endpoint, payload);
      console.log("response: ", response);
      if (response.success) {
        upload_profile_image(response.userId);
        toast.success(t("register.user_created_successfully"));
        navigate("/login");
      } else {
        if (response.error === "shop_name_taken") {
          setError(t("register.error.shop_name_taken"));
          toast.error(t("register.error.shop_name_taken"));
        } else {
          setError(t("register.error." + response.error));
          toast.error(t("register.error." + response.error));
        }
      }
    } catch (err) {
      setError(t("register.registrationFailed") + err.message);
      toast.error(t("register.registrationFailed") + err.message);
    }
  };

  return (
    <div className="register-page">

      <div className="register-page-content">
        <div className="register-container" dir={i18n.language === "ar" ? "rtl" : "ltr"} >
          <form className="register-form" onSubmit={handleSubmit} lang={i18n.language}>
            <h2>{t("register.title")}</h2>
            {error && <p className="error">{error}</p>}

            <div className="role-selection">
              <div
                className={`role-option ${role === 'shoper' ? 'active' : ''}`}
                onClick={() => handleRoleChange('shoper')}
              >
                {t("register.shoper")}
              </div>
              <div
                className={`role-option ${role === 'seller' ? 'active' : ''}`}
                onClick={() => handleRoleChange('seller')}
              >
                {t("register.seller")}
              </div>
            </div>

            <label>{t("register.firstName")}</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
            />
            <label>{t("register.lastName")}</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
            />
            <label>{t("register.email")}</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
            <label>{t("register.password")}</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
            />
            <label>{t("register.phone")}</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />
            <label>{t("register.address")}</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
            />
            <label>{t("register.city")}</label>
            <select name="city" value={selectedCity || ''} onChange={handleCityChange}>
              <option value="">{t("selectCity")}</option>
              {cities.map((city, index) => (
                <option key={index} value={city}>
                  {city}
                </option>
              ))}
            </select>

            {selectedCity && (
              <>
                <label>{t("register.subCity")}</label>
                <select name="subCity" value={selectedSubCity || ''} onChange={handleSubCityChange}>
                  <option value="">{t("selectSubCity")}</option>
                  {subCities.map((subCity, index) => (
                    <option key={index} value={subCity}>
                      {subCity}
                    </option>
                  ))}
                </select>
              </>
            )}

            {role === "shoper" && (
              <>
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
                />
                <label>{t("register.profileImageRequired")}</label>
                <ImageSelectUpload onImageChange={handleImageChange} maximages={1} />
              </>
            )}

            <div className="terms-checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={handleCheckboxChange}
                />

                <p>
                  {t("register.acceptTermsPart1")}
                  <Link to={cmandiLink}>{t("register.acceptTermsLink1")}</Link>
                  {t("register.acceptTermsPart2")}
                  <Link to={privacyLink}>{t("register.acceptTermsLink2")}</Link>
                  {t("register.acceptTermsPart3")}
                </p>

              </label>
            </div>

            <button type="submit">{t("register.submit")}</button>

            <p className="login-link">
              {t("register.alreadyRegistered")}
              <span
                onClick={() => navigate("/login")}
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
