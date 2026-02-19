import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CreateNote from "./pages/CreateNote";
import ViewNote from "./pages/ViewNote";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <header className="border-b">
          <div className="container mx-auto px-4 py-4">
            <a href="/" className="text-xl font-semibold tracking-tight hover:opacity-80 transition-opacity">
              SecureNotes
            </a>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<CreateNote />} />
            <Route path="/note/:id" element={<ViewNote />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
