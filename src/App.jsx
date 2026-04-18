import { Routes, Route } from "react-router-dom";

import AppLayout from "./layouts/AppLayout";
import AuthLayout from "./layouts/AuthLayout";

import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import StudySpotDiscovery from "./pages/study-spots/StudySpotDiscovery";
import StudySpotInfo from "./pages/study-spots/StudySpotInfo";
import StudySessionLog from "./pages/study-spots/StudySessionLog";
import StudyGroupDiscovery from "./pages/study-groups/StudyGroupDiscovery";
import StudyGroupInfo from "./pages/study-groups/StudyGroupInfo";
import StudyGroupCreate from "./pages/study-groups/StudyGroupCreate";
import Insights from "./pages/Insights";

function App() {
  return (
    <Routes>

      {/* Auth pages (NO nav) */}
      <Route element={<AuthLayout />}>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Route>

      {/* App pages (WITH nav) */}
      <Route element={<AppLayout />}>
        <Route path="/study-spots/" element={<StudySpotDiscovery />} />
        <Route path="/study-spots/:id" element={<StudySpotInfo />} />
        <Route path="/study-spots/log/:id" element={<StudySessionLog />} />
        <Route path="/study-groups" element={<StudyGroupDiscovery />} />
        <Route path="/study-groups/:id" element={<StudyGroupInfo />} />
        <Route path="/study-groups/create" element={<StudyGroupCreate />} />
        <Route path="/insights" element={<Insights />} />
      </Route>

    </Routes>
  );
}

export default App;