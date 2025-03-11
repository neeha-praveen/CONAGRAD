import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import StudentAuth from "./components/studentAuth";
import ExpertAuth from "./components/expertAuth";
import StudentUpload from "./components/StudentUpload";
import "./styles/App.css";

// import PendingAssignments from "./components/pendingAssignment";
// import Navbar from "./components/Navbar";
// import AssignedAssignments from "./components/AssignedAssignment";
// import History from "./components/history";

function Home() {
  return (
    <div className="app">
      <header>
        <div className="video-container">
          <video autoPlay loop muted>
            <source src="/Conagrad..mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
        <div className="logo">
          <img src="/Conagrad.jpg" alt="Platform Logo" />
        </div>
        <nav>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><a href="/about">About</a></li>
            <li><a href="/services">Services</a></li>
            <li><a href="/contact">Contact</a></li>
          </ul>
        </nav>
      </header>

      <div className="overlay"></div>

      <section className="hero">
        <div className="overlay"></div>
        <div className="content">
          <h1>Welcome to the Student & Expert Platform</h1>
          <p>Connecting students with experts to enhance learning and growth.</p>
          <div className="buttons">
            <Link to="/student-login" className="btn student">Are You a Student?</Link>
            <Link to="/expert-login" className="btn expert">Are You an Expert?</Link>
          </div>
        </div>
      </section>

      <footer>
        <p>&copy; 2025 Student & Expert Platform. All rights reserved.</p>
      </footer>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/student-login" element={<StudentAuth />} />
        <Route path="/expert-login" element={<ExpertAuth />} />
        <Route path="/expert-register" element={<ExpertAuth />} />
        <Route path="/student-upload" element={<StudentUpload />} />
        {/*<Route path="/history" element={<History />} />
        <Route path="/pending" element={<PendingAssignments />} />
        <Route path="/assigned" element={<AssignedAssignments />} />
        */}
      </Routes>
    </Router>
  );
}
export default App;
