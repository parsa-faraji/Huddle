import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = () => {
    if (!form.email || !form.password) {
      alert("Please fill in all fields!");
      return;
    }
    navigate("/study-spots");
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen bg-white"
      style={{ fontFamily: "'Jost', sans-serif" }} 
    >
      {/* Phone-sized yellow block */}
      <div
        className="w-96 h-screen relative bg-[radial-gradient(ellipse_at_50%_50%,_#FFB000_0%,_#FFDC90_81%,_#FFECC1_100%)] shadow-2xl"
      >
        {/* Huddle header (kept as Marcellus) */}
        <h1 className="absolute left-[20px] top-[60px] text-5xl font-['Marcellus_SC'] text-black">
          Huddle
        </h1>

        {/* Sign in centered lower */}
        <div className="absolute top-[250px] w-full flex flex-col items-center">
          <h2 className="text-3xl font-bold text-black">Sign in</h2>
          <p className="text-xs text-black mt-2">
            New user?{" "}
            <span
              className="font-bold cursor-pointer hover:underline"
              onClick={() => navigate("/signup")}
            >
              Create an account
            </span>
          </p>
        </div>

        {/* Form block */}
        <div className="absolute top-[320px] left-[50%] transform -translate-x-1/2 w-80 flex flex-col gap-4">
          <label className="text-xs font-bold text-black">Email / Username</label>
          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Type your email"
            className="px-4 py-3 rounded-full border-none text-sm outline-none"
            style={{ backgroundColor: "#FDD878", color: "#B07A00" }}
          />

          <label className="text-xs font-bold text-black">Password</label>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Type password"
            className="px-4 py-3 rounded-full border-none text-sm outline-none"
            style={{ backgroundColor: "#FDD878", color: "#B07A00" }}
          />

          <p className="text-right text-xs font-bold text-black cursor-pointer hover:underline">
            Forgot Password
          </p>

          <button
            onClick={handleSubmit}
            className="mt-4 py-3 rounded-full font-bold text-sm transition-transform"
            style={{ backgroundColor: "#1C1008", color: "#F9C84A", cursor: "pointer" }}
          >
            Sign in
          </button>
        </div>
      </div>
    </div>
  );
}