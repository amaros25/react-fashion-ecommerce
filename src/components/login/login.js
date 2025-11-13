import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./login.css";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Beispiel-API-Aufruf zum Einloggen
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        throw new Error("Login fehlgeschlagen");
      }

        const data = await res.json();
        localStorage.setItem("token", data.token); // Token speichern
        localStorage.setItem("role", data.role);       // Rolle speichern
        localStorage.setItem("userId", data.userId);   // User ID speichern
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
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Login</h2>
        {error && <p className="error">{error}</p>}
        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <label>Passwort</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Einloggen</button>
        <p className="register-link">
          Noch kein Konto? <a href="/register">Registrieren</a>
        </p>
      </form>
    </div>
  );
}

export default Login;
