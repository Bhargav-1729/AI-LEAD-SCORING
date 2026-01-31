import { useState } from "react";
import "./admin.css"

const API_URL = import.meta.env.VITE_API_URL;

export default function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const login = async () => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    if (!res.ok) {
      setError("Invalid credentials");
      return;
    }

    const data = await res.json();
    localStorage.setItem("token", data.access_token);
    onLogin();
  };

  return (
    <div className="login-box">
      <h2>Admin Login</h2>
      <input placeholder="Email" onChange={e => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />
      <button onClick={login}>Login</button>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <div className="demo-credentials">
        <p><strong>Demo credentials:</strong></p>
        <p>Email: admin@example.com</p>
        <p>Password: admin123</p>
      </div>
    </div>
  );
}
