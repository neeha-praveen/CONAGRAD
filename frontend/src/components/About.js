import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import './About.css';
import { FaGraduationCap, FaUsers, FaLightbulb, FaChartLine } from 'react-icons/fa';

const About = () => {
  return (
    <div className="app">
      <header>
        <Link to="/" className="logo">
          <h1>CONAGRAD</h1>
        </Link>
        <nav>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/about">About</Link></li>
            <li><Link to="/services">Services</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </nav>
      </header>

      <div className="overlay"></div>

      <div className="about-container">
        <motion.section 
          className="about-hero"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <h1>About CONAGRAD</h1>
          <p>Empowering Education Through Expert Connections</p>
        </motion.section>

        <motion.section 
          className="mission-section"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h2>Our Mission</h2>
          <p>To bridge the gap between students and experts, creating a collaborative learning environment that fosters growth, innovation, and academic excellence.</p>
        </motion.section>

        <section className="stats-section">
          <motion.div 
            className="stat-card"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <FaUsers className="stat-icon" />
            <h3>10,000+</h3>
            <p>Active Students</p>
          </motion.div>

          <motion.div 
            className="stat-card"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <FaGraduationCap className="stat-icon" />
            <h3>500+</h3>
            <p>Expert Mentors</p>
          </motion.div>

          <motion.div 
            className="stat-card"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <FaLightbulb className="stat-icon" />
            <h3>15,000+</h3>
            <p>Projects Completed</p>
          </motion.div>

          <motion.div 
            className="stat-card"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <FaChartLine className="stat-icon" />
            <h3>95%</h3>
            <p>Success Rate</p>
          </motion.div>
        </section>

        <motion.section 
          className="team-section"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <h2>Our Team</h2>
          <div className="team-grid">
            <div className="team-member">
              <img src="/" alt="Team Member" />
              <h3>Neerav Babel</h3>
              <p>Founder & CEO</p>
            </div>
            <div className="team-member">
              <img src="/" alt="Team Member" />
              <h3>Neeha Praveen</h3>
              <p>Founder & CEO</p>
            </div>
          </div>
        </motion.section>

        <motion.section 
          className="values-section"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          <h2>Our Values</h2>
          <div className="values-grid">
            <div className="value-card">
              <h3>Excellence</h3>
              <p>Striving for the highest standards in education and support</p>
            </div>
            <div className="value-card">
              <h3>Innovation</h3>
              <p>Embracing new ideas and methods in learning</p>
            </div>
            <div className="value-card">
              <h3>Collaboration</h3>
              <p>Working together to achieve better results</p>
            </div>
            <div className="value-card">
              <h3>Integrity</h3>
              <p>Maintaining honest and ethical practices</p>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default About;
