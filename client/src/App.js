import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Layout        from "./components/Layout";
import Login         from "./pages/Login";
import Signup        from "./pages/Signup";
import Home          from "./pages/Home";
import Section       from "./pages/Section";
import Analytics     from "./pages/Analytics";
import Profile       from "./pages/Profile";
import QuestionsPage from "./pages/QuestionsPage";
import TestsPage     from "./pages/TestsPage";

function App() {
  const token = localStorage.getItem("token");

  return (
    <Router>
      <Routes>
        <Route path="/login"  element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route path="/" element={token ? <Layout /> : <Navigate to="/login" />}>

          {/* Home = company tiles + practice tracks */}
          <Route index element={<Home />} />

          {/* Analytics replaces Dashboard as the main stats page */}
          <Route path="analytics" element={<Analytics />} />
          <Route path="profile"   element={<Profile />} />

          {/* Tests: /tests  or  /tests/amazon */}
          <Route path="tests"          element={<TestsPage />} />
          <Route path="tests/:company" element={<TestsPage />} />

          {/* Per-company section hub */}
          <Route path="section/:company" element={<Section />} />

          {/* Practice track shortcuts (no company) */}
          <Route path="aptitude"  element={<Section />} />
          <Route path="coding"    element={<Section />} />
          <Route path="interview" element={<Section />} />

          {/* Questions viewer / interactive practice */}
          <Route path="questions/:category"          element={<QuestionsPage />} />
          <Route path="questions/:category/:company" element={<QuestionsPage />} />

          {/* Redirect old /dashboard links to home */}
          <Route path="dashboard"   element={<Navigate to="/"          />} />
          <Route path="leaderboard" element={<Navigate to="/analytics" />} />

          <Route path="*" element={<Navigate to="/" />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
