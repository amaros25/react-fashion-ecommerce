import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./reset_password.css";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { FaEye, FaEyeSlash } from "react-icons/fa";

function ResetPassword() {
    const { token } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const apiUrl = process.env.REACT_APP_API_URL;

    const [password, setPassword] = React.useState("");
    const [confirmPassword, setConfirmPassword] = React.useState("");
    const [showPassword, setShowPassword] = React.useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState("");

    // Password validation regex (same as register.js)
    const isPasswordStrong = (pwd) => {
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return regex.test(pwd);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        // Validate passwords match
        if (password !== confirmPassword) {
            setError(t("passwords_not_match"));
            return;
        }

        // Validate password strength
        if (!isPasswordStrong(password)) {
            setError(t("register.error.passwordStrength"));
            return;
        }

        setLoading(true);

        try {
            const res = await fetch(`${apiUrl}/auth/reset-password/${token}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || t("reset_password_failed"));
            }

            toast.success(t("password_reset_success"), {
                position: "top-center",
                autoClose: 3000,
            });

            // Redirect to login after 2 seconds
            setTimeout(() => {
                navigate("/login");
            }, 2000);
        } catch (err) {
            setError(err.message || t("reset_password_failed"));
            toast.error(err.message || t("reset_password_failed"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="reset-password-page">
            <div className="reset-password-content">
                <div className="reset-password-container">
                    <form className="reset-password-form" onSubmit={handleSubmit}>
                        <h2>{t("reset_password_title")}</h2>
                        <p className="reset-description">{t("enter_new_password")}</p>

                        {error && <p className="error">{error}</p>}

                        <label>{t("password")}</label>
                        <div className="password-input-wrapper">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder={t("register.password")}
                            />
                            <span
                                className="password-toggle-icon"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </span>
                        </div>

                        <label>{t("confirm_password")}</label>
                        <div className="password-input-wrapper">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                placeholder={t("confirm_password")}
                            />
                            <span
                                className="password-toggle-icon"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                            </span>
                        </div>

                        <div className="password-requirements">
                            <p>{t("password_requirements")}:</p>
                            <ul>
                                <li>{t("password_req_length")}</li>
                                <li>{t("password_req_uppercase")}</li>
                                <li>{t("password_req_lowercase")}</li>
                                <li>{t("password_req_number")}</li>
                                <li>{t("password_req_special")}</li>
                            </ul>
                        </div>

                        <button type="submit" disabled={loading}>
                            {loading ? t("loading") : t("reset_password_button")}
                        </button>

                        <p className="back-to-login">
                            {t("remember_password")}{" "}
                            <span onClick={() => navigate("/login")}>
                                {t("login_start")}
                            </span>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default ResetPassword;
