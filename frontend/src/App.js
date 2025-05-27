import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import "./styles/App.css";
import Services from './components/Services';
import About from './components/About';
import Contact from './components/Contact';

// Student Stuff
import StudentAuth from "./components/studentAuth";
import StudentDashboard from "./components/StudentDashboard";
import AssignmentDetails from "./components/AssignmentDetails";
import AssignmentHistory from "./components/AssignmentHistory";
import Profile from "./components/Profile";
import Settings from "./components/Settings";
import Help from "./components/Help";
import StudentUpload from "./components/StudentUpload"; 

// Expert Stuff
import ExpertAuth from "./components/expertAuth";
import ExpertDashboard from "./components/ExpertPages/ExpertDashboard/ExpertDashboard";
import ExpertProfile from "./components/ExpertPages/ExpertProfile/ExpertProfile";
import ExpertSettings from "./components/ExpertPages/ExpertSettings/ExpertSettings";


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
        {/* Landing */}
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<Services />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />

        {/* Student Pages */}
        <Route path="/student-login" element={<StudentAuth />} />
        <Route path="/student-upload" element={<StudentUpload />} />
        <Route path="/assignments" element={<AssignmentDetails />} />
        <Route path="/dashboard" element={<StudentDashboard />} />
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        <Route path="/assignment-details" element={<AssignmentDetails />} />
        <Route path="/assignment-history" element={<AssignmentHistory />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/help" element={<Help />} />

        {/* Expert Pages */}
        <Route path="/expert-login" element={<ExpertAuth />} />
        <Route path="/expert-dashboard" element={<ExpertDashboard />} />
        <Route path="/expert-profile" element={<ExpertProfile />} />
        <Route path="/expert-settings" element={<ExpertSettings />} />
      </Routes>
    </Router>
  );
}
export default App;