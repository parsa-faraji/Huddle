import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function NotFound() {
  const { user } = useAuth();
  const backTo = user ? "/study-spots" : "/";
  const backLabel = user ? "Back to Discovery" : "Back to Sign in";

  return (
    <div className="flex justify-center items-center min-h-screen bg-white dark:bg-[--huddle-bg]">
      <div
        className="w-full max-w-96 h-screen relative
                   bg-[radial-gradient(ellipse_at_50%_50%,_#FFB000_0%,_#FFDC90_81%,_#FFECC1_100%)]
                   dark:bg-[radial-gradient(ellipse_at_50%_50%,_#2a1f0a_0%,_#1a1406_81%,_#0f0a02_100%)]
                   shadow-2xl flex flex-col items-center justify-center gap-4 px-6"
        style={{ fontFamily: "'Jost', sans-serif" }}
      >
        <h1 className="absolute left-6 top-6 text-5xl font-['Marcellus_SC'] text-black dark:text-[--huddle-text]">
          Huddle
        </h1>

        <div className="text-[7rem] font-bold leading-none text-black/20 dark:text-white/20">
          404
        </div>
        <h2
          role="heading"
          aria-level={2}
          className="text-2xl font-bold text-black dark:text-[--huddle-text]"
        >
          Page not found
        </h2>
        <p className="text-sm text-center text-[#5C4033] dark:text-[--huddle-text-sub] max-w-xs">
          The page you're looking for doesn't exist or may have moved.
        </p>

        <Link
          to={backTo}
          className="mt-4 inline-flex items-center justify-center px-6 py-3 rounded-full bg-sky-950 text-white font-semibold text-sm shadow-md hover:bg-sky-900 active:scale-[0.98] transition"
        >
          {backLabel}
        </Link>
      </div>
    </div>
  );
}
