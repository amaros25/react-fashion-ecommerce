import React from "react";
import { useNavigate } from "react-router-dom";
import "./login.css";
import { useTranslation } from "react-i18next";
import { Header } from "../header/header.js";
import Foot from "../foot/foot";

function Login() {
  const apiUrl = process.env.REACT_APP_API_URL;
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${apiUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        throw new Error(t("login_failed"));
      }

      const data = await res.json();
      console.log("Login Data : ", data);

      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("userId", data.userId);

      localStorage.setItem("userData", JSON.stringify({
        email: data.email,
        phone: data.phone,
        address: data.address,
        firstName: data.firstName,
        lastName: data.lastName,
      }));

      if (data.role === "seller") {
        navigate("/profile_seller");
      } else {
        navigate("/profile_user");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-page">
      <Header />

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

            <button type="submit">{t("login_start")}</button>

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

      <Foot />
    </div>
  );
}

export default Login;
