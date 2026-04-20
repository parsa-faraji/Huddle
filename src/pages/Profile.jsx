import { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { extractDomain, isStudentEmail } from "../services/studentEmail";

const PREF_FIELDS = [
  { label: "Noise Level", name: "noiseLevel", options: ["Silent", "Medium", "Loud"] },
  { label: "Seating", name: "seating", options: ["Plenty", "Limited", "Scarce"] },
  { label: "Outlets", name: "outlets", options: ["Yes", "No"] },
  { label: "WiFi", name: "wifi", options: ["Strong", "Spotty", "None"] },
  { label: "Lighting", name: "lighting", options: ["Bright", "Medium", "Dim"] },
  { label: "Crowded", name: "crowded", options: ["Low", "Medium", "High"] },
];

const EMPTY = { noiseLevel: "", seating: "", outlets: "", wifi: "", lighting: "", crowded: "" };

export default function Profile() {
  const { user, signOut } = useAuth();
  const { userDoc, updatePreferences } = useApp();

  const [prefs, setPrefs] = useState(EMPTY);
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (userDoc?.preferences) {
      setPrefs({ ...EMPTY, ...userDoc.preferences });
    }
  }, [userDoc]);

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
    } catch (err) {
      setStatus(err?.message || "Could not save preferences.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex justify-center items-start min-h-screen bg-white">
      <div
        className="w-full max-w-96 h-screen relative
                   bg-[radial-gradient(ellipse_at_50%_50%,_#FFB000_0%,_#FFDC90_81%,_#FFECC1_100%)]
                   shadow-2xl overflow-y-auto flex flex-col items-center"
      >
        <h1 className="absolute left-6 top-6 text-5xl font-['Marcellus_SC'] text-black">
          Huddle
        </h1>

        <form
          onSubmit={handleSave}
          className="mt-28 mb-24 w-80 bg-white rounded-2xl p-6 flex flex-col gap-5 shadow-lg"
        >
          <div>
            <h2 className="text-black text-lg font-medium font-['Jost']">Your Profile</h2>
            <p className="text-xs text-gray-600 font-['Jost'] mt-1">
              {userDoc?.displayName || user?.displayName || user?.email}
            </p>
            {(() => {
              const emailForBadge = userDoc?.email || user?.email || "";
              if (!isStudentEmail(emailForBadge)) return null;
              const domain = userDoc?.schoolDomain || extractDomain(emailForBadge) || "";
              return (
                <span
                  className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full bg-green-100 text-green-800 text-xs font-semibold"
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
            <h3 className="text-black text-sm font-medium font-['Jost']">Study Preferences</h3>
            <p className="text-xs text-gray-500 font-['Jost'] mt-0.5">
              Used to match groups and recommend spots.
            </p>
          </div>

          {PREF_FIELDS.map((f) => (
            <div key={f.name} className="flex flex-col gap-1">
              <label className="text-black text-sm font-medium font-['Jost']">{f.label}</label>
              <select
                name={f.name}
                value={prefs[f.name]}
                onChange={handleChange}
                className="h-10 px-3 rounded-lg outline outline-gray-300 font-['Jost']"
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
            <p className="text-xs text-gray-700 font-['Jost']" role="status">
              {status}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full h-12 bg-sky-950 text-white rounded-3xl font-['Jost'] cursor-pointer disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save preferences"}
          </button>

          <button
            type="button"
            onClick={signOut}
            className="w-full h-10 bg-amber-100 text-black rounded-3xl font-['Jost'] cursor-pointer"
          >
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}
