//! Libraries
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

//! Components
import Sidebar from "./components/Sidebar";
import UserDropdown from "./components/UserDropdown";

//! Pages
import Speech from "./pages/Speech";
import Archive from "./pages/Archive";

function App() {
  return (
    <Router>
      <div className="min-h-screen overflow-hidden">
        <Sidebar />

        {/* محتوای اصلی */}
        <main className="relative mr-[166px] top-24 h-screen">
          <UserDropdown />

          {/* Routes */}
          <Routes>
            <Route path="/" element={<Speech />} />
            <Route path="/speech" element={<Speech />} />
            <Route path="/archive" element={<Archive />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
