import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { friendlyAuthError } from "../../services/authErrors";
import HowItWorks from "../../components/HowItWorks";
import { useToast } from "../../context/ToastContext";

export default function Login() {
  const navigate = useNavigate();
  const toast = useToast();
  const { signIn, resetPassword } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);
  const [showTour, setShowTour] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
    setInfo("");
  };

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
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
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setBusy(false);
    }
  };

  const handleForgot = async () => {
    setError("");
    setInfo("");
    const email =
      form.email.trim() || window.prompt("Enter the email for password reset:");
    if (!email) return;
    try {
      await resetPassword(email);
      setInfo(`Password reset email sent to ${email}.`);
      toast.success(`Reset email sent to ${email}`);
    } catch (err) {
      setError(friendlyAuthError(err));
    }
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen bg-white dark:bg-[--huddle-bg]"
      style={{ fontFamily: "'Jost', sans-serif" }}
    >
      <div className="w-full max-w-96 h-screen relative huddle-frame shadow-2xl">
        <h1 className="absolute left-[20px] top-[60px] text-5xl font-['Marcellus_SC'] text-black dark:text-[--huddle-text]">
          Huddle
        </h1>

        <div className="absolute top-[250px] w-full flex flex-col items-center">
          <h2 className="text-3xl font-bold text-black dark:text-[--huddle-text]">
            Sign in
          </h2>
          <p className="text-xs text-black dark:text-[--huddle-text-sub] mt-2">
            New user?{" "}
            <button
              type="button"
              onClick={() => navigate("/signup")}
              className="font-bold cursor-pointer hover:underline text-black dark:text-[--huddle-text]"
            >
              Create an account
            </button>
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="absolute top-[320px] left-[50%] transform -translate-x-1/2 w-80 flex flex-col gap-4"
        >
          <div className="flex flex-col gap-1">
            <label
              htmlFor="login-email"
              className="text-xs font-bold text-black dark:text-[--huddle-text]"
            >
              Email
            </label>
            <input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Type your email"
              className="px-4 py-3 rounded-full border-none text-sm outline-none bg-[#FDD878] text-[#5B3B00] placeholder-[#A07A2F] dark:bg-[--huddle-card] dark:text-[--huddle-text] dark:placeholder-[--huddle-text-sub]"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="login-password"
              className="text-xs font-bold text-black dark:text-[--huddle-text]"
            >
              Password
            </label>
            <input
              id="login-password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={form.password}
              onChange={handleChange}
              placeholder="Type password"
              className="px-4 py-3 rounded-full border-none text-sm outline-none bg-[#FDD878] text-[#5B3B00] placeholder-[#A07A2F] dark:bg-[--huddle-card] dark:text-[--huddle-text] dark:placeholder-[--huddle-text-sub]"
            />
          </div>

          <button
            type="button"
            onClick={handleForgot}
            className="text-right text-xs font-bold text-black dark:text-[--huddle-text] cursor-pointer hover:underline self-end"
          >
            Forgot Password
          </button>

          {error && (
            <p
              role="alert"
              className="text-xs font-semibold text-red-700 bg-red-100 rounded px-3 py-2"
            >
              {error}
            </p>
          )}
          {info && (
            <p
              role="status"
              className="text-xs font-semibold text-green-800 bg-green-100 rounded px-3 py-2"
            >
              {info}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="mt-4 py-3 rounded-full font-bold text-sm transition-transform active:scale-[0.98] disabled:opacity-60 bg-[#1C1008] text-[#F9C84A] dark:bg-[--huddle-gold] dark:text-slate-900"
            style={{ cursor: busy ? "wait" : "pointer" }}
          >
            {busy ? "Signing in..." : "Sign in"}
          </button>

          <button
            type="button"
            onClick={() => setShowTour(true)}
            className="text-xs font-semibold text-black/70 dark:text-[--huddle-text-sub] hover:text-black dark:hover:text-[--huddle-text] cursor-pointer underline underline-offset-2"
          >
            See how Huddle works
          </button>
        </form>
      </div>

      <HowItWorks open={showTour} onClose={() => setShowTour(false)} />
    </div>
  );
}
