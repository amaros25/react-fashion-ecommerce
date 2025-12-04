import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./register.css";
import { useTranslation } from "react-i18next";
import ImageSelectUpload from '../new_product/image_select_upload.js';
import { toast } from "react-toastify";
import { cities, citiesData } from '../utils/const/cities.js';
import useRegisterApi from "./hooks/useRegisterApi";

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

  const { uploadImage, registerUser } = useRegisterApi(apiUrl, cloudName, uploadPreset);

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


  const isValidEmail = (email) => /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(email);
  const isStrongPassword = (password) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);
  const isValidPhone = (phone) => /^[0-9]{8,15}$/.test(phone);
  const isValidName = (name) => /^[a-zA-Z\s]+$/.test(name);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.firstName) {
      setError(t("register.error.firstNameRequired"));
      toast.error(t("register.error.firstNameRequired"));
      return;
    }

    if (formData.firstName.length < 4 || !isValidName(formData.firstName)) {
      setError(t("register.error.invalidFirstName"));
      toast.error(t("register.error.invalidFirstName"));
      return;
    }
    if (!formData.lastName) {
      setError(t("register.error.lastNameRequired"));
      toast.error(t("register.error.lastNameRequired"));
      return;
    }
    if (formData.lastName.length < 4 || !isValidName(formData.lastName)) {
      setError(t("register.error.invalidLastName"));
      toast.error(t("register.error.invalidLastName"));
      return;
    }

    if (!formData.email || !isValidEmail(formData.email)) {
      setError(t("register.error.emailRequired"));
      toast.error(t("register.error.emailRequired"));
      return;
    }

    if (!formData.password) {
      setError(t("register.error.passwordRequired"));
      toast.error(t("register.error.passwordRequired"));
      return;
    }

    if (!isStrongPassword(formData.password)) {
      setError(t("register.error.passwordStrength"));
      toast.error(t("register.error.passwordStrength"));
      return;
    }
    if (!formData.phone) {
      setError(t("register.error.phoneRequired"));
      toast.error(t("register.error.phoneRequired"));
      return;
    }

    if (!isValidPhone(formData.phone)) {
      setError(t("register.error.invalidPhone"));
      toast.error(t("register.error.invalidPhone"));
      return;
    }

    if (!formData.address) {
      setError(t("register.error.addressRequired"));
      toast.error(t("register.error.addressRequired"));
      return;
    }

    if (!selectedCity) {
      setError(t("register.error.cityRequired"));
      toast.error(t("register.error.cityRequired"));
      return;
    }

    if (!selectedSubCity) {
      setError(t("register.error.subCityRequired"));
      toast.error(t("register.error.subCityRequired"));
      return;
    }



    if (role === "seller") {
      if (!formData.shopName) {
        setError(t("register.error.fillShopNameAddress"));
        toast.error(t("register.error.fillShopNameAddress"));
        return;
      }
      if (!imageFile) {
        setError(t("register.error.uploadProfileImage"));
        toast.error(t("register.error.uploadProfileImage"));
        return;
      }
    }
    if (!acceptedTerms) {
      setError(t("register.error.acceptTerms"));
      toast.error(t("register.error.acceptTerms"));
      return;
    }
    try {

      const imageUrl = imageFile ? await uploadImage(imageFile) : "";
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
          address: formData.address ? [{
            address: formData.address,
            city: selectedCityIndex,
            subCity: selectedSubCityIndex,
            dateModified: new Date()
          }
          ] : [],
          phone: formData.phone ? [{
            phone: formData.phone,
            dateModified: new Date()
          }] : [],
          image: imageUrl,
          active: false,
          lastOnline: new Date(),
        };
      } else {
        endpoint = `${apiUrl}/users/create`;
        payload = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          address: formData.address ? [{
            address: formData.address,
            city: selectedCityIndex,
            subCity: selectedSubCityIndex,
            dateModified: new Date()
          }
          ] : [],
          phone: formData.phone ? [{
            phone: formData.phone,
            dateModified: new Date()
          }] : [],
          image: imageUrl || "",
          active: true,
          lastOnline: new Date(),
        };
      }

      await registerUser(endpoint, payload);
      toast.success(t("register.success"));
      navigate("/login");
    } catch (err) {
      if (err.message === "user already exists") {
        setError(t("register.error.userAlreadyExists"));
        toast.error(t("register.error.userAlreadyExists"));
      } else {
        setError(err.message);
        toast.error(err.message)
      }
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
                <span
                  dangerouslySetInnerHTML={{
                    __html: t("register.acceptTerms", {
                      cmandiLink: "/agb",
                      privacyLink: "/data_protection"
                    })
                  }}
                />
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
