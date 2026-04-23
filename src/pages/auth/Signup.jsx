import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { friendlyAuthError } from "../../services/authErrors";
import { isStudentEmail } from "../../services/studentEmail";

const FIELDS = [
  {
    label: "First Name and Last Name",
    name: "name",
    placeholder: "Type full name",
    type: "text",
    autoComplete: "name",
  },
  {
    label: "School Email",
    name: "email",
    placeholder: "you@school.edu",
    type: "email",
    autoComplete: "email",
  },
  {
    label: "Password",
    name: "password",
    placeholder: "Type password",
    type: "password",
    autoComplete: "new-password",
  },
  {
    label: "Confirm Password",
    name: "confirm",
    placeholder: "Type password again",
    type: "password",
    autoComplete: "new-password",
  },
];

export default function Signup() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    setError("");
    if (!form.name || !form.email || !form.password || !form.confirm) {
      setError("Please fill in all fields.");
      return;
    }
    if (form.password !== form.confirm) {
      setError("Passwords don't match.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (!isStudentEmail(form.email)) {
      setError(
        "Huddle is limited to students — please use your school email (e.g. you@berkeley.edu).",
      );
      return;
    }
    setBusy(true);
    try {
      await signUp(form.name.trim(), form.email.trim(), form.password);
      navigate("/study-spots");
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen bg-white dark:bg-[--huddle-bg]"
      style={{ fontFamily: "'Jost', sans-serif" }}
    >
      <div className="w-full max-w-96 h-screen relative huddle-frame shadow-2xl overflow-y-auto">
        <h1 className="absolute left-[20px] top-[60px] text-5xl font-['Marcellus_SC'] text-black dark:text-[--huddle-text]">
          Huddle
        </h1>

        <div className="absolute top-[250px] w-full flex flex-col items-center">
          <h2 className="text-3xl font-bold text-black dark:text-[--huddle-text]">
            Sign up
          </h2>
          <p className="text-xs text-black dark:text-[--huddle-text-sub] mt-2">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/")}
              className="font-bold cursor-pointer hover:underline text-black dark:text-[--huddle-text]"
            >
              Sign in
            </button>
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="absolute top-[320px] left-[50%] transform -translate-x-1/2 w-80 flex flex-col gap-4 pb-10"
        >
          {FIELDS.map((field) => (
            <div key={field.name} className="flex flex-col gap-1">
              <label
                htmlFor={`signup-${field.name}`}
                className="text-xs font-bold text-black dark:text-[--huddle-text]"
              >
                {field.label}
              </label>
              <input
                id={`signup-${field.name}`}
                name={field.name}
                type={field.type}
                autoComplete={field.autoComplete}
                value={form[field.name]}
                onChange={handleChange}
                placeholder={field.placeholder}
                className="px-4 py-3 text-sm rounded-full outline-none border-none bg-[#FDD878] text-[#5B3B00] placeholder-[#A07A2F] dark:bg-[--huddle-card] dark:text-[--huddle-text] dark:placeholder-[--huddle-text-sub]"
              />
            </div>
          ))}

          {error && (
            <p
              role="alert"
              className="text-xs font-semibold text-red-700 bg-red-100 rounded px-3 py-2"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="mt-4 py-3 rounded-full font-bold text-sm transition-transform active:scale-[0.98] disabled:opacity-60 bg-[#1C1008] text-[#F9C84A] dark:bg-[--huddle-gold] dark:text-slate-900"
            style={{ cursor: busy ? "wait" : "pointer" }}
          >
            {busy ? "Creating..." : "Create account"}
          </button>
        </form>
      </div>
    </div>
  );
}
