import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Navigation hook for routing after login
import "./login.css"; // Styles for login form
import { useTranslation } from "react-i18next"; // Translation hook for i18n support

function Login({ closePopup, switchToRegister }) {
  const apiUrl = process.env.REACT_APP_API_URL; // Backend API base URL
  const { t, i18n } = useTranslation(); // Translation and language direction
  const navigate = useNavigate(); // For programmatic navigation

  // Local state for form inputs and error message
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  /**
   * Handles login form submission
   * Sends email and password to backend to authenticate
   */
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior

    try {
      // POST request to login endpoint with email and password
      const res = await fetch(`${apiUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      // If response is not OK, throw an error with localized message
      if (!res.ok) {
        throw new Error(t("login_failed"));
      }

      closePopup(); // Close the login popup/modal on success

      // Parse JSON response
      const data = await res.json();

      // Save auth token and user info in localStorage for session management
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("userId", data.userId);

      // Navigate user based on their role
      if (data.role === "seller") {
        navigate("/profile_seller");
      } else {
        navigate("/profile_user");
      }
    } catch (err) {
      // Display any error messages to user
      setError(err.message);
    }
  };

  return (
    <div className="login-container" dir={i18n.language === "ar" ? "rtl" : "ltr"}>
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>{t("login")}</h2>

        {/* Show error message if login fails */}
        {error && <p className="error">{error}</p>}

        {/* Email input */}
        <label>{t("email")}</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {/* Password input */}
        <label>{t("password")}</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {/* Submit button */}
        <button type="submit">{t("login_start")}</button>

        {/* Link to switch to Register component */}
        <p className="register-link">
          {t("register_quest")}{" "}
          <span
            onClick={switchToRegister}
            style={{ color: "#0077cc", cursor: "pointer", textDecoration: "underline" }}
          >
            {t("register.title")}
          </span>
        </p>
      </form>
    </div>
  );
}

export default Login;
