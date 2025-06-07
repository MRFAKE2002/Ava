//! Components
import Sidebar from "./components/Sidebar";
import Speech from "./pages/Speech";

function App() {
  return (
    <div className="min-h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      
      {/* محتوای اصلی */}
      <main className="relative mr-[166px] top-24 h-screen">
        <Speech />
      </main>
    </div>
  );
}

export default App;