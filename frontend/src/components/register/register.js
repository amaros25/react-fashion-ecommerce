import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import ValidateRegisterForm from "./validateregisterform";
import "./register.css";
import { useAuthManager } from "../api_managers/useAuthManager";
import useUploadImageApi from "../upload_image_profile/hooks/upload_image_api";

function Register() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const authManager = useAuthManager();

  // States
  const [role, setRole] = useState("user");
  const [error, setError] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "", lastName: "", email: "", password: "",
    confirmPassword: "", phone: ""
  });


  const cloudName = process.env.REACT_APP_CLOUD_NAME;
  const uploadPreset = process.env.REACT_APP_UPLOAD_PRESET;
  const { uploadImage } = useUploadImageApi(cloudName, uploadPreset);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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

    const validationError = ValidateRegisterForm(cleanFormData, role, acceptedTerms, t);

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
        role: role,
      };

      const response = await authManager.register(payload);

      if (response.success) {
        toast.success(t("register.user_created_successfully"));
        setTimeout(() => navigate("/login"), 1500);
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
              <div className={`role-option ${role === 'user' ? 'active' : ''}`} onClick={() => setRole('user')}>{t("register.shoper")}</div>
              <div className={`role-option ${role === 'seller' ? 'active' : ''}`} onClick={() => setRole('seller')}>{t("register.seller")}</div>
            </div>

            <label>{t("register.firstName")}</label>
            <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} />

            <label>{t("register.lastName")}</label>
            <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} />

            <label>{t("register.email")}</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} />

            <label>{t("register.password")}</label>
            <div className="password-input-container">
              <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} />
              <span className="password-toggle-icon" onClick={() => setShowPassword(!showPassword)}  >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>



            <label>{t("register.confirmPassword")}</label>
            <div className="password-input-container">
              <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} />
              <span className="password-toggle-icon" onClick={() => setShowConfirmPassword(!showConfirmPassword)} >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            <label>{t("register.phone")}</label>
            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} />
            {/* Simplify registration fields as requested */}

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