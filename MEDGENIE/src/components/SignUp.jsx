import { useState } from "react";
import { useNavigate } from "react-router-dom";

const SignUp = () => {
  const nav = useNavigate();
  const [username, setUser] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPass] = useState("");

  const register = async () => {
    const res = await fetch("http://localhost:8000/api/register/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });

    if (res.status === 201) {
      nav("/login");
    } else {
      alert("Signup failed");
    }
  };

  return (
    <div className="max-w-md mx-auto p-10 bg-white shadow rounded mt-20">
      <h2 className="text-2xl font-semibold mb-4 text-center">Create Account</h2>

      <input className="w-full border px-3 py-2 mb-3 rounded"
        placeholder="Username" onChange={(e) => setUser(e.target.value)} />

      <input className="w-full border px-3 py-2 mb-3 rounded"
        placeholder="Email" onChange={(e) => setEmail(e.target.value)} />

      <input className="w-full border px-3 py-2 mb-3 rounded"
        placeholder="Password" type="password" onChange={(e) => setPass(e.target.value)} />

      <button
        className="w-full bg-green-600 text-white py-2 rounded"
        onClick={register}
      >
        Sign Up
      </button>
    </div>
  );
};

export default SignUp;
