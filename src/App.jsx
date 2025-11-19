import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import DAWLite from '../src/assets/pages/DAW-Lite/DAWLite';

function App() {
  return (
    <Router>
      <div className="App">
        {/* Navigation (optional) */}
        <nav className="bg-gray-800 text-white p-4">
          <Link to="/" className="px-4 hover:text-blue-300">Home</Link>
          <Link to="/daw" className="px-4 hover:text-blue-300">DAW-LITE</Link>
        </nav>

        {/* Routes */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/daw" element={<DAWLite />} />
        </Routes>
      </div>
    </Router>
  );
}

// Simple Home component
function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to DAW-LITE</h1>
        <Link
          to="/daw"
          className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600"
        >
          Open DAW
        </Link>
      </div>
    </div>
  );
}

export default App;