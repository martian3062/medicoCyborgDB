import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const nav = useNavigate();
  const [username, setUser] = useState("");
  const [password, setPass] = useState("");

  const loginUser = async () => {
    const res = await fetch("http://localhost:8000/api/login/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();
    if (data.access) {
      localStorage.setItem("token", data.access);
      nav("/dashboard");
    } else {
      alert("Login failed");
    }
  };

  return (
    <div className="max-w-md mx-auto p-10 bg-white shadow rounded mt-20">
      <h2 className="text-2xl font-semibold mb-4 text-center">Login</h2>

      <input
        className="w-full border px-3 py-2 mb-3 rounded"
        placeholder="Username"
        onChange={(e) => setUser(e.target.value)}
      />

      <input
        className="w-full border px-3 py-2 mb-3 rounded"
        placeholder="Password"
        type="password"
        onChange={(e) => setPass(e.target.value)}
      />

      <button
        onClick={loginUser}
        className="w-full bg-blue-600 text-white py-2 rounded"
      >
        Login
      </button>
    </div>
  );
};

export default Login;
