import React from "react";
import { useNavigate } from "react-router-dom";
import "./login.css";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


function Login() {
  const apiUrl = process.env.REACT_APP_API_URL;
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

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
      console.log(data);

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
      console.log("userData", userData);
      setLoading(false);
      localStorage.setItem("userData", JSON.stringify(userData));
      if (data.role === "seller") {
        navigate("/profile_seller");
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

  return (
    <div className="login-page">
      <div className="login-page-content">
        <div className="login-container" dir={i18n.language === "ar" ? "rtl" : "ltr"}>
          <form className="login-form" onSubmit={handleSubmit}>
            <h2>{t("login")}</h2>
            {error && <p className="error">{error}</p>}
            <label>{t("email")}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <label>{t("password")}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit" disabled={loading}>
              {loading ? t("loading") : t("login_start")}
            </button>
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
    </div>
  );
}

export default Login;
