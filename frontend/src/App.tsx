import { BrowserRouter, Routes, Route } from "react-router-dom";

import ContestPage from "./pages/ContestPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import RankingsPage from "./pages/RankingsPage";
import StudentProfilePage from "./pages/StudentProfilePage";
import SyncPage from "./pages/SyncPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AnalyticsPage />} />
        <Route path="/contests" element={<ContestPage />} />
        <Route path="/rankings" element={<RankingsPage />} />
        <Route path="/students/:username" element={<StudentProfilePage />} />
        <Route path="/sync" element={<SyncPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;