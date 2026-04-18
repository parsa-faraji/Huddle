import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { friendlyAuthError } from "../../services/authErrors";

export default function Login() {
  const navigate = useNavigate();
  const { signIn, resetPassword } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
    setInfo("");
  };

  const handleSubmit = async () => {
    setError("");
    setInfo("");
    if (!form.email || !form.password) {
      setError("Please fill in all fields.");
      return;
    }
    setBusy(true);
    try {
      await signIn(form.email.trim(), form.password);
      navigate("/study-spots");
    } catch (e) {
      setError(friendlyAuthError(e));
    } finally {
      setBusy(false);
    }
  };

  const handleForgot = async () => {
    setError("");
    setInfo("");
    const email = form.email.trim() || window.prompt("Enter the email for password reset:");
    if (!email) return;
    try {
      await resetPassword(email);
      setInfo(`Password reset email sent to ${email}.`);
    } catch (e) {
      setError(friendlyAuthError(e));
    }
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

          <p
            onClick={handleForgot}
            className="text-right text-xs font-bold text-black cursor-pointer hover:underline"
          >
            Forgot Password
          </p>

          {error && (
            <p className="text-xs font-semibold text-red-700 bg-red-100 rounded px-3 py-2">{error}</p>
          )}
          {info && (
            <p className="text-xs font-semibold text-green-800 bg-green-100 rounded px-3 py-2">{info}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={busy}
            className="mt-4 py-3 rounded-full font-bold text-sm transition-transform disabled:opacity-60"
            style={{ backgroundColor: "#1C1008", color: "#F9C84A", cursor: busy ? "wait" : "pointer" }}
          >
            {busy ? "Signing in..." : "Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}