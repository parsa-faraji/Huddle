import { useState } from "react";
import { useApp } from "../../context/AppContext";
import { useParams, useNavigate } from "react-router-dom";
import { studySpots } from "../../data/studySpots";
import RateModal from "../../components/modals/RateModal";

export default function StudySessionLog() {
  const { addSession } = useApp(); 
  const { id } = useParams(); // match the route param /study-spots/log/:id
  const navigate = useNavigate();
  const spot = studySpots.find(s => s.id === parseInt(id));

  const [page, setPage] = useState(1);
  const [formData, setFormData] = useState({
    productivity: 0,
    comfort: 0,
    location: 0,
    recommend: null,
    noiseLevel: "",
    outlets: "",
    lighting: "",
    crowded: "",
    comments: "",
    overallRating: 0, // added for page 2 rating
  });

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSelect = (name, value) => setFormData({ ...formData, [name]: value });
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!spot) return;

    // Add session data
    addSession({ ...formData, id: Date.now(), spotId: spot.id, spot: spot.name });

    // Open modal instead of resetting form immediately
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    navigate("/study-spots/"); // go back to study spots discovery
  };

  return (
    <div className="flex justify-center items-start min-h-screen bg-white">
      <div
        className="w-96 h-screen relative
                   bg-[radial-gradient(ellipse_at_50%_50%,_#FFB000_0%,_#FFDC90_81%,_#FFECC1_100%)]
                   shadow-2xl overflow-y-auto flex flex-col items-center"
      >
        <h1 className="absolute left-6 top-6 text-5xl font-['Marcellus_SC'] text-black">Huddle</h1>

        <form
          onSubmit={handleSubmit}
          className="mt-28 mb-24 w-80 bg-white rounded-2xl p-6 flex flex-col gap-6 shadow-lg"
        >
          {/* Header */}
          <h2 className="text-black text-lg font-medium font-['Jost']">
            Rate {spot?.name || "Study Spot"}
          </h2>

          {/* Rating key */}
          <p className="text-xs text-gray-600 -mt-0.5">
            1 = Poor / Low &nbsp;&nbsp;|&nbsp;&nbsp; 5 = Excellent / High
          </p>

          {page === 1 && (
            <>
              {/* Numbered Ratings */}
              {["productivity", "comfort", "location"].map((field) => (
                <div key={field}>
                  <label className="block mb-2 text-sm font-medium text-black font-['Jost']">
                    {field.charAt(0).toUpperCase() + field.slice(1)}
                  </label>
                  <div className="flex justify-between">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => handleSelect(field, num)}
                        className={`w-9 h-9 rounded-full font-bold cursor-pointer ${
                          formData[field] === num ? "bg-amber-300 text-black" : "bg-amber-100 text-black"
                        }`}
                        style={{ fontFamily: "'Jost', sans-serif" }}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              {/* Recommend */}
              <div>
                <label className="block mb-2 text-sm font-medium text-black font-['Jost']">
                  Recommend?
                </label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => handleSelect("recommend", true)}
                    className={`flex-1 py-2 rounded-xl font-bold cursor-pointer ${
                      formData.recommend === true ? "bg-amber-300 text-black" : "bg-amber-100 text-black"
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelect("recommend", false)}
                    className={`flex-1 py-2 rounded-xl font-bold cursor-pointer ${
                      formData.recommend === false ? "bg-amber-300 text-black" : "bg-amber-100 text-black"
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>

              {/* Next Button */}
              <button
                type="button"
                onClick={() => setPage(2)}
                className="w-full h-12 bg-sky-950 text-white rounded-3xl font-['Jost'] mt-4 cursor-pointer"
              >
                Next
              </button>
            </>
          )}

          {page === 2 && (
            <>
              {/* Overall Rating (Page 2) */}
              <div className="">
                <label className="block mb-2 text-sm font-medium text-black font-['Jost']">
                  Overall Rating
                </label>
                <div className="flex justify-between">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => handleSelect("overallRating", num)}
                      className={`w-9 h-9 rounded-full font-bold cursor-pointer ${
                        formData.overallRating === num ? "bg-amber-300 text-black" : "bg-amber-100 text-black"
                      }`}
                      style={{ fontFamily: "'Jost', sans-serif" }}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dropdown Ratings */}
              {[
                { label: "Noise Level", name: "noiseLevel", options: ["Silent", "Medium", "Loud"] },
                { label: "Outlets", name: "outlets", options: ["Yes", "No"] },
                { label: "Lighting", name: "lighting", options: ["Bright", "Medium", "Dim"] },
                { label: "Crowded", name: "crowded", options: ["Low", "Medium", "High"] },
              ].map((field) => (
                <div key={field.name} className="flex flex-col gap-1">
                  <label className="text-black text-sm font-medium font-['Jost']">{field.label}</label>
                  <select
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleChange}
                    className="h-10 px-3 rounded-lg outline outline-gray-300 font-['Jost']"
                  >
                    <option value="">Select {field.label.toLowerCase()}</option>
                    {field.options.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              ))}

              {/* Comments */}
              <div className="flex flex-col gap-1 mt-4">
                <label className="text-black text-sm font-medium font-['Jost']">Comments (optional)</label>
                <textarea
                  name="comments"
                  value={formData.comments}
                  onChange={handleChange}
                  placeholder="Add your thoughts..."
                  className="h-20 px-3 py-2 rounded-lg outline outline-gray-300 font-['Jost']"
                />
              </div>

              {/* Back + Submit */}
              <div className="flex gap-4 mt-4">
                <button
                  type="button"
                  onClick={() => setPage(1)}
                  className="flex-1 h-12 bg-amber-100 rounded-3xl font-['Jost'] cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 h-12 bg-sky-950 text-white rounded-3xl font-['Jost'] cursor-pointer"
                >
                  Submit
                </button>
              </div>
            </>
          )}
        </form>

        {/* Rating Modal */}
        <RateModal studySpot={spot} isOpen={isModalOpen} onClose={handleCloseModal} />
      </div>
    </div>
  );
}