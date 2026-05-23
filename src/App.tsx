import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background-light dark:bg-background-dark transition-colors duration-300">
        <Routes>
          <Route path="/" element={<div>CELPIP Micro Trainer</div>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
