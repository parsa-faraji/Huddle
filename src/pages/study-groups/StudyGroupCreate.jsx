import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import CreateModal from "../../components/modals/CreateModal.jsx";
import { useApp } from "../../context/AppContext";

export default function StudyGroupCreate() {
  const navigate = useNavigate();
  const { addGroup } = useApp();

  const [formData, setFormData] = useState({
    course: "",
    name: "",
    pace: "",
    noiseLevel: "",
    groupSize: "",
    meetingType: "",
    availability: "",
    vibe: "",
    method: "",
    description: "",
    creator: "",
    location: "",
    meetingTime: "",
    maxMembers: "",
    privacy: "",
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [createdGroup, setCreatedGroup] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError("");
  }

  function handleCancel() {
    navigate("/study-groups");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const required = ["name", "course", "description", "location", "availability", "meetingTime"];
    const missing = required.filter((k) => !formData[k]?.trim?.());
    if (missing.length > 0) {
      setError("Please fill in all required fields.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const newGroup = await addGroup(formData);
      setCreatedGroup(newGroup);
      setModalOpen(true);
    } catch (err) {
      setError(err?.message || "Could not create group.");
    } finally {
      setBusy(false);
    }
  }

  function closeModal() {
    setModalOpen(false);
    navigate("/study-groups");
  }

  return (
    <>
      <div className="flex justify-center items-center min-h-screen bg-white dark:bg-[--huddle-card]">
        <div
          className="w-full max-w-96 h-screen relative
                     huddle-frame
                     shadow-2xl overflow-y-auto flex flex-col items-center"
        >
          <h1 className="absolute left-6 top-6 text-5xl font-['Marcellus_SC'] text-black dark:text-[--huddle-text]">
            Huddle
          </h1>

          <form
            onSubmit={handleSubmit}
            className="mt-28 mb-24 w-80 bg-white dark:bg-[--huddle-card] rounded-2xl p-6 flex flex-col gap-4 shadow-lg"
          >
            <h2 className="text-black dark:text-[--huddle-text] text-lg font-medium font-['Jost']">
              Create Study Group
            </h2>

            {/* Group Name */}
            <div className="flex flex-col gap-1">
              <label className="text-black dark:text-[--huddle-text] text-sm font-medium font-['Jost']">
                Group Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Data 8 Freshman"
                className="h-10 px-3 rounded-lg outline outline-gray-300 dark:outline-[--huddle-border] font-['Jost']"
              />
            </div>

            {/* Class / Subject */}
            <div className="flex flex-col gap-1">
              <label className="text-black dark:text-[--huddle-text] text-sm font-medium font-['Jost']">
                Class/Subject *
              </label>
              <input
                type="text"
                name="course"
                value={formData.course}
                onChange={handleChange}
                placeholder="e.g. CS61A"
                className="h-10 px-3 rounded-lg outline outline-gray-300 dark:outline-[--huddle-border] font-['Jost']"
              />
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1">
              <label className="text-black dark:text-[--huddle-text] text-sm font-medium font-['Jost']">
                Description *
              </label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Purpose and goals"
                className="h-12 px-3 rounded-lg outline outline-gray-300 dark:outline-[--huddle-border] font-['Jost']"
              />
            </div>

            {/* Group Size */}
            <div className="flex flex-col gap-1">
              <label className="text-black dark:text-[--huddle-text] text-sm font-medium font-['Jost']">
                Group Size
              </label>
              <input
                type="number"
                name="groupSize"
                value={formData.groupSize}
                onChange={handleChange}
                className="h-10 px-3 rounded-lg outline outline-gray-300 dark:outline-[--huddle-border] font-['Jost']"
              />
            </div>

            {/* Pace */}
            <div className="flex flex-col gap-1">
              <label className="text-black dark:text-[--huddle-text] text-sm font-medium font-['Jost']">
                Pace
              </label>
              <select
                name="pace"
                value={formData.pace}
                onChange={handleChange}
                className="h-10 px-3 rounded-lg outline outline-gray-300 dark:outline-[--huddle-border] font-['Jost']"
              >
                <option value="">Select pace</option>
                <option value="Slow">Slow</option>
                <option value="Medium">Medium</option>
                <option value="Fast">Fast</option>
              </select>
            </div>

            {/* Noise Level */}
            <div className="flex flex-col gap-1">
              <label className="text-black dark:text-[--huddle-text] text-sm font-medium font-['Jost']">
                Noise Level
              </label>
              <select
                name="noiseLevel"
                value={formData.noiseLevel}
                onChange={handleChange}
                className="h-10 px-3 rounded-lg outline outline-gray-300 dark:outline-[--huddle-border] font-['Jost']"
              >
                <option value="">Select noise level</option>
                <option value="Silent">Silent</option>
                <option value="Medium">Medium</option>
                <option value="Loud">Loud</option>
              </select>
            </div>

            {/* Meeting Type */}
            <div className="flex flex-col gap-1">
              <label className="text-black dark:text-[--huddle-text] text-sm font-medium font-['Jost']">
                Meeting Type
              </label>
              <select
                name="meetingType"
                value={formData.meetingType}
                onChange={handleChange}
                className="h-10 px-3 rounded-lg outline outline-gray-300 dark:outline-[--huddle-border] font-['Jost']"
              >
                <option value="">Select meeting type</option>
                <option value="In Person">In Person</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Virtual">Virtual</option>
              </select>
            </div>

            {/* Privacy */}
            <div className="flex flex-col gap-1">
              <label className="text-black dark:text-[--huddle-text] text-sm font-medium font-['Jost']">
                Private?
              </label>
              <select
                name="privacy"
                value={formData.privacy}
                onChange={handleChange}
                className="h-10 px-3 rounded-lg outline outline-gray-300 dark:outline-[--huddle-border] font-['Jost']"
              >
                <option value="">Select privacy</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>

            {/* Location */}
            <div className="flex flex-col gap-1">
              <label className="text-black dark:text-[--huddle-text] text-sm font-medium font-['Jost']">
                Location *
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. Moffit Library / Zoom"
                className="h-10 px-3 rounded-lg outline outline-gray-300 dark:outline-[--huddle-border] font-['Jost']"
              />
            </div>

            {/* Availability */}
            <div className="flex flex-col gap-1">
              <label className="text-black dark:text-[--huddle-text] text-sm font-medium font-['Jost']">
                Availability *
              </label>
              <input
                type="text"
                name="availability"
                value={formData.availability}
                onChange={handleChange}
                placeholder="e.g. Evenings"
                className="h-10 px-3 rounded-lg outline outline-gray-300 dark:outline-[--huddle-border] font-['Jost']"
              />
            </div>

            {/* Meeting Time */}
            <div className="flex flex-col gap-1">
              <label className="text-black dark:text-[--huddle-text] text-sm font-medium font-['Jost']">
                Meeting Time *
              </label>
              <input
                type="text"
                name="meetingTime"
                value={formData.meetingTime}
                onChange={handleChange}
                placeholder="e.g. Mondays, 4-6 PM"
                className="h-10 px-3 rounded-lg outline outline-gray-300 dark:outline-[--huddle-border] font-['Jost']"
              />
            </div>

            {/* Maximum Members */}
            <div className="flex flex-col gap-1">
              <label className="text-black dark:text-[--huddle-text] text-sm font-medium font-['Jost']">
                Maximum Members
              </label>
              <input
                type="number"
                name="maxMembers"
                value={formData.maxMembers}
                onChange={handleChange}
                className="h-10 px-3 rounded-lg outline outline-gray-300 dark:outline-[--huddle-border] font-['Jost']"
              />
            </div>

            {error && (
              <p className="text-xs font-semibold text-red-700 bg-red-100 rounded px-3 py-2 font-['Jost']">
                {error}
              </p>
            )}

            {/* Buttons */}
            <div className="flex flex-col gap-2 mt-4">
              <button
                type="submit"
                disabled={busy}
                className="w-full h-12 bg-sky-950 text-white rounded-3xl cursor-pointer font-['Jost'] disabled:opacity-60"
              >
                {busy ? "Creating…" : "Confirm"}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="w-full h-10 bg-amber-100 dark:bg-white/10 text-black dark:text-[--huddle-text] rounded-3xl cursor-pointer font-['Jost']"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Modal */}
      <CreateModal group={createdGroup} isOpen={modalOpen} onClose={closeModal} />
    </>
  );
}