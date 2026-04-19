import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { friendlyAuthError } from "../../services/authErrors";

export default function Signup() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async () => {
    setError("");
    if (!form.name || !form.email || !form.password || !form.confirm) {
      setError("Please fill in all fields.");
      return;
    }
    if (form.password !== form.confirm) {
      setError("Passwords don't match.");
      return;
    }
    setBusy(true);
    try {
      await signUp(form.name.trim(), form.email.trim(), form.password);
      navigate("/study-spots");
    } catch (e) {
      setError(friendlyAuthError(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen bg-white"
      style={{ fontFamily: "'Jost', sans-serif" }} // ✅ global Jost
    >
      {/* Phone-sized yellow block */}
      <div
        className="w-96 h-screen relative bg-[radial-gradient(ellipse_at_50%_50%,_#FFB000_0%,_#FFDC90_81%,_#FFECC1_100%)] shadow-2xl"
      >
        {/* Huddle header (kept Marcellus) */}
        <h1 className="absolute left-[20px] top-[60px] text-5xl font-['Marcellus_SC'] text-black">
          Huddle
        </h1>

        {/* Sign up heading */}
        <div className="absolute top-[250px] w-full flex flex-col items-center">
          <h2 className="text-3xl font-bold text-black">Sign up</h2>
          <p className="text-xs text-black mt-2">
            Already have an account?{" "}
            <span
              className="font-bold cursor-pointer hover:underline"
              onClick={() => navigate("/")}
            >
              Sign in
            </span>
          </p>
        </div>

        {/* Form block */}
        <div className="absolute top-[320px] left-[50%] transform -translate-x-1/2 w-80 flex flex-col gap-4">
          {[
            { label: "First Name and Last Name", name: "name", placeholder: "Type full name", type: "text" },
            { label: "Email", name: "email", placeholder: "your.email@school.edu", type: "email" },
            { label: "Password", name: "password", placeholder: "Type password", type: "password" },
            { label: "Confirm Password", name: "confirm", placeholder: "Type password again", type: "password" },
          ].map((field) => (
            <div key={field.name} className="flex flex-col">
              <label className="text-xs font-bold text-black mb-1">{field.label}</label>
              <input
                name={field.name}
                type={field.type}
                value={form[field.name]}
                onChange={handleChange}
                placeholder={field.placeholder}
                className="px-4 py-3 text-sm rounded-full outline-none border-none"
                style={{ backgroundColor: "#FDD878", color: "#B07A00" }}
              />
            </div>
          ))}

          {error && (
            <p className="text-xs font-semibold text-red-700 bg-red-100 rounded px-3 py-2">{error}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={busy}
            className="mt-4 py-3 rounded-full font-bold text-sm hover:scale-95 transition-transform disabled:opacity-60"
            style={{ backgroundColor: "#1C1008", color: "#F9C84A", cursor: busy ? "wait" : "pointer" }}
          >
            {busy ? "Creating..." : "Create account"}
          </button>
        </div>
      </div>
    </div>
  );
}