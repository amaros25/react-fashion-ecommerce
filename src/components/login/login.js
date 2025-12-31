import React from "react";
import { useNavigate } from "react-router-dom";
import "./login.css";
import "./modal.css";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";


function Login() {
  const apiUrl = process.env.REACT_APP_API_URL;
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [showForgotModal, setShowForgotModal] = React.useState(false);
  const [resetEmail, setResetEmail] = React.useState("");
  const [resetLoading, setResetLoading] = React.useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      console.log("Login data: ", data);

      if (!res.ok) {
        if (res.status === 403 && data.error === "ALREADY_LOGGED_IN") {
          // Yellow toast for already logged in
          const errorMsg = t("already_logged_in");
          throw { message: errorMsg, isWarning: true };
        }
        throw new Error(t("login_failed"));
      }
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("userId", data.userId);
      //TODO when token none show error toast, login failed
      if (!data.token) {
        toast.error(t("login_failed"));
        return;
      }
      const userData = {
        address: data.address,
        phone: data.phone,
        city: data.city,
        subCity: data.subCity
      };
      console.log("Login userData", userData);
      setLoading(false);
      localStorage.setItem("userData", JSON.stringify(userData));
      if (data.role === "seller") {
        navigate("/profile_seller");
      } else if (data.role === "admin") {
        navigate("/profile_admin");
      } else {
        navigate("/profile_user");
      }
    } catch (err) {
      if (err.isWarning) {
        toast.warn(err.message, {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
        });
        setError(""); // Clear generic error if specific warning shown
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    setShowForgotModal(true);
  };

  const handleResetRequest = async (e) => {
    e.preventDefault();
    setResetLoading(true);
    try {
      const res = await fetch(`${apiUrl}/auth/request-password-reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail }),
      });
      const data = await res.json();

      toast.success(t("reset_email_sent"), {
        position: "top-center",
        autoClose: 5000,
      });

      setShowForgotModal(false);
      setResetEmail("");
    } catch (err) {
      toast.error(t("reset_email_error"));
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-page-content">
        <div className="login-container" dir={i18n.language === "ar" ? "rtl" : "ltr"}>
          <form className="login-form" onSubmit={handleSubmit}>
            <h2>{t("login")}</h2>
            {error && <p className="error">{error}</p>}
            <label>{t("email_or_phone")}</label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <label>{t("password")}</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <span
                className="password-toggle-icon"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
            <button type="submit" disabled={loading}>
              {loading ? t("loading") : t("login_start")}
            </button>
            <p className="forgot-password-link" onClick={handleForgotPassword}>
              {t("forgot_password")}
            </p>
            <p className="register-link">
              {t("register_quest")}{" "}
              <span
                onClick={() => navigate("/register")}
                style={{ color: "#151718ff", cursor: "pointer", textDecoration: "underline" }}
              >
                {t("register.title")}
              </span>
            </p>
          </form>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="modal-overlay" onClick={() => setShowForgotModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{t("reset_password_title")}</h3>
            <p>{t("reset_password_desc")}</p>
            <form onSubmit={handleResetRequest}>
              <label>{t("email")}</label>
              <input
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                required
                placeholder={t("enter_email")}
              />
              <div className="modal-buttons">
                <button type="button" onClick={() => setShowForgotModal(false)} className="btn-cancel">
                  {t("cancel")}
                </button>
                <button type="submit" disabled={resetLoading} className="btn-submit">
                  {resetLoading ? t("loading") : t("send_reset_link")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;
