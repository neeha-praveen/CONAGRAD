import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaGraduationCap, FaLaptopCode, FaChalkboardTeacher, FaBook, FaRocket, FaCertificate } from 'react-icons/fa';
import './Services.css';

const Services = () => {
  const services = [
    {
      icon: <FaGraduationCap />,
      title: "Academic Guidance",
      description: "Get personalized academic support from experienced mentors",
      features: ["One-on-one mentoring", "Study plan creation", "Progress tracking"]
    },
    {
      icon: <FaLaptopCode />,
      title: "Project Assistance",
      description: "Expert help with your academic and research projects",
      features: ["Technical guidance", "Project planning", "Quality assurance"]
    },
    {
      icon: <FaChalkboardTeacher />,
      title: "Expert Sessions",
      description: "Live interactive sessions with industry experts",
      features: ["Real-time interaction", "Doubt clearing", "Industry insights"]
    },
    {
      icon: <FaBook />,
      title: "Resource Library",
      description: "Access to comprehensive study materials",
      features: ["Digital resources", "Practice materials", "Reference guides"]
    },
    {
      icon: <FaRocket />,
      title: "Career Development",
      description: "Guidance for your professional growth",
      features: ["Career counseling", "Skill development", "Industry preparation"]
    },
    {
      icon: <FaCertificate />,
      title: "Certifications",
      description: "Earn certificates for your achievements",
      features: ["Skill certification", "Course completion", "Achievement badges"]
    }
  ];

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

      <div className="services-container">
        <motion.section 
          className="services-hero"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <h1>Our Services</h1>
          <p>Comprehensive solutions for your academic success</p>
        </motion.section>

        <section className="services-grid">
          {services.map((service, index) => (
            <motion.div 
              className="service-card"
              key={index}
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="service-icon">
                {service.icon}
              </div>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
              <ul className="features-list">
                {service.features.map((feature, idx) => (
                  <li key={idx}>{feature}</li>
                ))}
              </ul>
              <motion.button 
                className="learn-more"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Learn More
              </motion.button>
            </motion.div>
          ))}
        </section>

        <motion.section 
          className="why-choose-us"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <h2>Why Choose Our Services?</h2>
          <div className="benefits-grid">
            <div className="benefit-card">
              <h3>Expert Guidance</h3>
              <p>Learn from experienced professionals in your field</p>
            </div>
            <div className="benefit-card">
              <h3>Flexible Schedule</h3>
              <p>Access services at your convenience</p>
            </div>
            <div className="benefit-card">
              <h3>Personalized Approach</h3>
              <p>Get solutions tailored to your needs</p>
            </div>
            <div className="benefit-card">
              <h3>Quality Assurance</h3>
              <p>Guaranteed satisfaction with our services</p>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default Services;
