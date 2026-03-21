import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SignIn from './pages/SignIn';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/signin" />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
