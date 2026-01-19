import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import useLoginApi from "./hooks/useLoginApi";
import "./login.css";
import "./modal.css";

function Login() {

  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const { loginUser, requestPasswordReset } = useLoginApi();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await loginUser(email, password);
    if (result.success) {
      const { token, user } = result.data;

      login({
        token: token,
        role: user.role,
        userId: user.id,
        userData: {
          address: user.profile?.address,
          phone: user.profile?.phone,
          city: user.profile?.city,
          subCity: user.profile?.subCity
        }
      });


      const routes = {
        seller: "/profile_seller",
        admin: "/profile_admin",
        user: "/profile_user"
      };
      navigate(routes[user.role] || "/profile_user");

    } else {
      if (result.status === 403 && result.error === "already_logged_in") {
        toast.warn(t("already_logged_in"));
      } else {
        setError(t(result.error));
      }
    }
    setLoading(false);
  };


  const handleForgotPassword = () => {
    setShowForgotModal(true);
  };

  const handleResetRequest = async (e) => {
    e.preventDefault();
    setResetLoading(true);
    const result = await requestPasswordReset(resetEmail);
    if (result.success) {
      toast.success(t(result.message));
      setShowForgotModal(false);
      setResetEmail("");
    } else {
      toast.error(t(result.message));
    }
    setResetLoading(false);
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
