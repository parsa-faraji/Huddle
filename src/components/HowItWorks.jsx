import { useState } from "react";

const STEPS = [
  {
    emoji: "📍",
    title: "Find a study spot",
    body: "Browse campus spots on a list or map. Filter by quiet, outlets, or open-now — and set preferences on Profile for personalized picks.",
  },
  {
    emoji: "✅",
    title: "Check in when you arrive",
    body: "Tap \"I'm here now\" on any spot. Others see the live count for 15 minutes, so crowds find each other and quiet floors stay honest.",
  },
  {
    emoji: "💬",
    title: "Join a group & chat",
    body: "Create a study group for a course, or join an existing one. Members get an in-app chat so you don't need Discord to coordinate.",
  },
];

/**
 * `onClose` fires when the user dismisses the tour. The component is
 * controlled — `open` toggles visibility, and the parent decides whether
 * to persist "already seen" in localStorage.
 */
export default function HowItWorks({ open, onClose }) {
  const [i, setI] = useState(0);

  if (!open) return null;

  const step = STEPS[i];
  const isLast = i === STEPS.length - 1;

  const handleNext = () => {
    if (isLast) {
      onClose?.();
      setI(0);
    } else {
      setI((n) => n + 1);
    }
  };

  const handleBack = () => setI((n) => Math.max(0, n - 1));

  const handleSkip = () => {
    onClose?.();
    setI(0);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="howitworks-title"
      data-testid="onboarding-banner"
    >
      <button
        type="button"
        aria-label="Close tour"
        onClick={handleSkip}
        className="absolute inset-0 bg-black/55 cursor-pointer"
      />
      <div
        className="relative w-full max-w-sm bg-white rounded-[24px] p-6 flex flex-col gap-4"
        style={{ boxShadow: "var(--shadow-lg)", fontFamily: "'Jost', sans-serif" }}
      >
        {/* Progress dots */}
        <div className="flex items-center justify-between">
          <div className="flex gap-1.5">
            {STEPS.map((_, idx) => (
              <span
                key={idx}
                className={`h-1.5 rounded-full transition-all ${
                  idx === i ? "w-6 bg-amber-400" : "w-1.5 bg-gray-200"
                }`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={handleSkip}
            data-testid="onboarding-dismiss"
            className="text-xs font-semibold text-gray-500 hover:text-gray-700 cursor-pointer"
          >
            Skip
          </button>
        </div>

        {/* Icon */}
        <div className="h-20 flex items-center justify-center text-6xl" aria-hidden="true">
          {step.emoji}
        </div>

        {/* Copy */}
        <div className="flex flex-col gap-2 text-center">
          <h2 id="howitworks-title" className="h-section" style={{ fontSize: "1.125rem" }}>
            {step.title}
          </h2>
          <p className="body-text text-gray-700">{step.body}</p>
        </div>

        {/* Controls */}
        <div className="flex gap-2 mt-2">
          {i > 0 && (
            <button
              type="button"
              onClick={handleBack}
              className="flex-1 h-11 rounded-full bg-amber-100 text-gray-900 text-sm font-bold cursor-pointer hover:bg-amber-200 transition"
            >
              Back
            </button>
          )}
          <button
            type="button"
            onClick={handleNext}
            className="flex-1 h-11 rounded-full bg-sky-950 text-white text-sm font-bold cursor-pointer hover:bg-sky-900 transition"
          >
            {isLast ? "Got it" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}
