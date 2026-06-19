import { BrowserRouter, Routes, Route } from "react-router-dom";

import ContestPage from "./pages/ContestPage";
import AnalyticsPage from "./pages/AnalyticsPage";

function App() {

  return (
    <BrowserRouter>

      <Routes>

        <Route
          path="/"
          element={<AnalyticsPage />}
        />

        <Route
          path="/contests"
          element={<ContestPage />}
        />

      </Routes>

    </BrowserRouter>
  );

}

export default App;