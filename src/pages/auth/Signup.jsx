import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = () => {
    if (!form.name || !form.email || !form.password || !form.confirm) {
      alert("Please fill in all fields!");
      return;
    }
    if (form.password !== form.confirm) {
      alert("Passwords don't match!");
      return;
    }
    navigate("/study-spots");
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
            { label: "Email", name: "email", placeholder: "name@berkeley.edu", type: "email" },
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

          <button
            onClick={handleSubmit}
            className="mt-4 py-3 rounded-full font-bold text-sm hover:scale-95 transition-transform"
            style={{ backgroundColor: "#1C1008", color: "#F9C84A", cursor: "pointer" }}
          >
            Create account
          </button>
        </div>
      </div>
    </div>
  );
}