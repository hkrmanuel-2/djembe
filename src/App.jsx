import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./assets/pages/Home.jsx";
import Worlds from "./assets/pages/Worlds.jsx";
import DAWLite from "./assets/pages/DAWLite.jsx";

export default function App() {
  return (
    <Router>
      <nav style={{ background: "#222", padding: "1rem" }}>
        <Link to="/" style={{ color: "white", marginRight: "10px" }}>Home</Link>
        <Link to="/worlds" style={{ color: "white", marginRight: "10px" }}>Worlds</Link>
        <Link to="/daw" style={{ color: "white" }}>DAW-Lite</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/worlds" element={<Worlds />} />
        <Route path="/daw" element={<DAWLite />} />
      </Routes>
    </Router>
  );
}
