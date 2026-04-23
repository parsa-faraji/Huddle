import { Navigate, Routes, Route } from "react-router-dom";

import AppLayout from "./layouts/AppLayout";
import AuthLayout from "./layouts/AuthLayout";
import RequireAuth from "./components/RequireAuth";
import { useAuth } from "./context/AuthContext";

import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import StudySpotDiscovery from "./pages/study-spots/StudySpotDiscovery";
import StudySpotInfo from "./pages/study-spots/StudySpotInfo";
import StudySessionLog from "./pages/study-spots/StudySessionLog";
import StudyGroupDiscovery from "./pages/study-groups/StudyGroupDiscovery";
import StudyGroupInfo from "./pages/study-groups/StudyGroupInfo";
import StudyGroupCreate from "./pages/study-groups/StudyGroupCreate";
import Insights from "./pages/Insights";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

function PublicOnly({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/study-spots" replace />;
  return children;
}

function App() {
  return (
    <Routes>

      {/* Auth pages (NO nav) — redirect signed-in users to app */}
      <Route element={<AuthLayout />}>
        <Route path="/" element={<PublicOnly><Login /></PublicOnly>} />
        <Route path="/signup" element={<PublicOnly><Signup /></PublicOnly>} />
      </Route>

      {/* App pages (WITH nav) — protected */}
      <Route element={<RequireAuth />}>
        <Route element={<AppLayout />}>
          <Route path="/study-spots/" element={<StudySpotDiscovery />} />
          <Route path="/study-spots/:id" element={<StudySpotInfo />} />
          <Route path="/study-spots/log/:id" element={<StudySessionLog />} />
          <Route path="/study-groups" element={<StudyGroupDiscovery />} />
          <Route path="/study-groups/:id" element={<StudyGroupInfo />} />
          <Route path="/study-groups/create" element={<StudyGroupCreate />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Route>

      {/* 404 — unauthenticated users hitting a bogus URL still get the page */}
      <Route path="*" element={<NotFound />} />

    </Routes>
  );
}

export default App;
