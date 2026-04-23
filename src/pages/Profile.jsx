import { useEffect, useState } from "react";
import { LogOut } from "lucide-react";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useTheme } from "../context/ThemeContext";
import { extractDomain, isStudentEmail } from "../services/studentEmail";
import { updateThemePreference } from "../services/users";
import ThemeToggle from "../components/ThemeToggle";

const PREF_FIELDS = [
  {
    label: "Noise Level",
    name: "noiseLevel",
    options: ["Silent", "Medium", "Loud"],
  },
  {
    label: "Seating",
    name: "seating",
    options: ["Plenty", "Limited", "Scarce"],
  },
  { label: "Outlets", name: "outlets", options: ["Yes", "No"] },
  { label: "WiFi", name: "wifi", options: ["Strong", "Spotty", "None"] },
  { label: "Lighting", name: "lighting", options: ["Bright", "Medium", "Dim"] },
  { label: "Crowded", name: "crowded", options: ["Low", "Medium", "High"] },
];

const EMPTY = {
  noiseLevel: "",
  seating: "",
  outlets: "",
  wifi: "",
  lighting: "",
  crowded: "",
};

export default function Profile() {
  const { user, signOut } = useAuth();
  const { userDoc, updatePreferences } = useApp();
  const toast = useToast();
  const { pref: themePref } = useTheme();

  const [prefs, setPrefs] = useState(EMPTY);
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (userDoc?.preferences) {
      setPrefs({ ...EMPTY, ...userDoc.preferences });
    }
  }, [userDoc]);

  useEffect(() => {
    if (!user) return;
    if (userDoc && userDoc.themePreference === themePref) return;
    updateThemePreference(user.uid, themePref).catch(() => {
      /* non-fatal — localStorage is the source of truth */
    });
  }, [user, userDoc, themePref]);

  const handleChange = (e) => {
    setPrefs((p) => ({ ...p, [e.target.name]: e.target.value }));
    setStatus("");
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatus("");
    try {
      await updatePreferences(prefs);
      setStatus("Preferences saved.");
      toast.success("Saved ✓");
    } catch (err) {
      const msg = err?.message || "Could not save preferences.";
      setStatus(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex justify-center items-start min-h-screen bg-white dark:bg-[--huddle-bg]">
      <div className="w-full max-w-96 h-screen relative huddle-frame shadow-2xl overflow-y-auto flex flex-col items-center">
        <h1 className="absolute left-6 top-6 text-5xl font-['Marcellus_SC'] text-black dark:text-[--huddle-text]">
          Huddle
        </h1>

        <form
          onSubmit={handleSave}
          className="mt-28 mb-24 w-80 bg-white dark:bg-[--huddle-card] rounded-2xl p-6 flex flex-col gap-5 shadow-lg"
        >
          <div>
            <h2 className="text-black dark:text-[--huddle-text] text-lg font-medium font-['Jost']">
              Your Profile
            </h2>
            <p className="text-xs text-gray-600 dark:text-[--huddle-text-sub] font-['Jost'] mt-1">
              {userDoc?.displayName || user?.displayName || user?.email}
            </p>
            {(() => {
              const emailForBadge = userDoc?.email || user?.email || "";
              if (!isStudentEmail(emailForBadge)) return null;
              const domain =
                userDoc?.schoolDomain || extractDomain(emailForBadge) || "";
              return (
                <span
                  className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full bg-green-100 text-green-800 dark:bg-emerald-500/15 dark:text-emerald-300 text-xs font-semibold"
                  style={{ fontFamily: "'Jost', sans-serif" }}
                  data-testid="student-badge"
                >
                  <span aria-hidden="true">✓</span>
                  Verified student{domain ? ` · ${domain}` : ""}
                </span>
              );
            })()}
          </div>

          <div>
            <h3 className="text-black dark:text-[--huddle-text] text-sm font-medium font-['Jost']">
              Appearance
            </h3>
            <p className="text-xs text-gray-500 dark:text-[--huddle-text-sub] font-['Jost'] mt-0.5 mb-2">
              Pick a theme. Auto follows your system.
            </p>
            <ThemeToggle />
          </div>

          <div>
            <h3 className="text-black dark:text-[--huddle-text] text-sm font-medium font-['Jost']">
              Study Preferences
            </h3>
            <p className="text-xs text-gray-500 dark:text-[--huddle-text-sub] font-['Jost'] mt-0.5">
              Used to match groups and recommend spots.
            </p>
          </div>

          {PREF_FIELDS.map((f) => (
            <div key={f.name} className="flex flex-col gap-1">
              <label
                htmlFor={`pref-${f.name}`}
                className="text-black dark:text-[--huddle-text] text-sm font-medium font-['Jost']"
              >
                {f.label}
              </label>
              <select
                id={`pref-${f.name}`}
                name={f.name}
                value={prefs[f.name]}
                onChange={handleChange}
                className="h-10 px-3 rounded-lg outline outline-gray-300 dark:outline-[--huddle-border] bg-white dark:bg-[--huddle-card] text-[--huddle-text] font-['Jost']"
              >
                <option value="">No preference</option>
                {f.options.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          ))}

          {status && (
            <p
              className="text-xs text-gray-700 dark:text-[--huddle-text-sub] font-['Jost']"
              role="status"
            >
              {status}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full h-12 bg-sky-950 text-white dark:bg-[--huddle-gold] dark:text-slate-900 rounded-3xl font-['Jost'] cursor-pointer active:scale-[0.98] transition disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save preferences"}
          </button>

          <button
            type="button"
            onClick={signOut}
            className="w-full h-10 bg-amber-100 dark:bg-white/10 text-black dark:text-[--huddle-text] rounded-3xl font-['Jost'] cursor-pointer active:scale-[0.98] transition inline-flex items-center justify-center gap-2"
          >
            <LogOut size={14} aria-hidden="true" />
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}
