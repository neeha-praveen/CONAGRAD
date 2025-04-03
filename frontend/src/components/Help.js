import React, { useState } from 'react';
import DashboardLayout from './layouts/DashboardLayout';
import { FaQuestionCircle, FaEnvelope, FaPhone, FaComments, FaBook, FaSearch, FaChevronDown, FaChevronUp, FaWhatsapp } from 'react-icons/fa';
import './Help.css';

const Help = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState(null);

  const faqs = [
    {
      question: "How do I submit an assignment?",
      answer: "To submit an assignment, go to the Assignments section, click on the assignment you want to submit, and use the 'Submit Assignment' button. You can upload files and add comments before submitting."
    },
    {
      question: "How do I check my grades?",
      answer: "Your grades are available in the Dashboard section. Click on the 'Grades' tab to view all your submitted assignments and their grades."
    },
    {
      question: "How do I update my profile information?",
      answer: "Go to the Profile section and click the 'Edit Profile' button. You can then update your personal information, profile picture, and other details."
    },
    {
      question: "How do I change my password?",
      answer: "You can change your password in the Settings section under the Security tab. Click on 'Change Password' and follow the prompts."
    },
    {
      question: "How do I contact my instructors?",
      answer: "You can contact your instructors through the messaging system in the Dashboard. Click on the 'Messages' tab and select your instructor from the list."
    }
  ];

  const supportResources = [
    {
      title: "Student Guide",
      description: "Comprehensive guide covering all features and functionalities",
      icon: <FaBook />,
      link: "/student-guide"
    },
    {
      title: "Video Tutorials",
      description: "Step-by-step video tutorials for common tasks",
      icon: <FaBook />,
      link: "/tutorials"
    },
    {
      title: "Technical Support",
      description: "Get help with technical issues and troubleshooting",
      icon: <FaComments />,
      link: "/technical-support"
    }
  ];

  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const handleEmailClick = () => {
    window.location.href = 'mailto:conagrad.connect@gmail.com';
  };

  const handlePhoneClick = () => {
    window.location.href = 'tel:+919660920036';
  };

  const handleWhatsAppClick = () => {
    window.open('https://wa.me/919660920036', '_blank');
  };

  return (
    <DashboardLayout>
      <div style={{width: '205vh', marginTop: '110vh'}} className="help-container">
        <div className="help-header">
          <h2>Help & Support</h2>
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search for help..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="help-content">
          <section className="faq-section">
            <div className="section-header">
              <FaQuestionCircle className="section-icon" />
              <h3>Frequently Asked Questions</h3>
            </div>
            <div className="faq-list">
              {filteredFaqs.map((faq, index) => (
                <div key={index} className="faq-item">
                  <div 
                    className="faq-question"
                    onClick={() => toggleFaq(index)}
                  >
                    <span>{faq.question}</span>
                    {expandedFaq === index ? <FaChevronUp /> : <FaChevronDown />}
                  </div>
                  {expandedFaq === index && (
                    <div className="faq-answer">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          <section className="contact-section">
            <div className="section-header">
              <FaEnvelope className="section-icon" />
              <h3>Contact Support</h3>
            </div>
            <div className="contact-methods">
              <div className="contact-item">
                <FaEnvelope className="contact-icon" />
                <div className="contact-info">
                  <h4>Email Support</h4>
                  <p>conagrad.connect@gmail.com</p>
                  <button className="contact-action-btn email-btn" onClick={handleEmailClick}>
                    <FaEnvelope /> Send Email
                  </button>
                </div>
              </div>
              <div className="contact-item">
                <FaPhone className="contact-icon" />
                <div className="contact-info">
                  <h4>Phone Support</h4>
                  <p>+91 9660920036</p>
                  <button className="contact-action-btn phone-btn" onClick={handlePhoneClick}>
                    <FaPhone /> Call Now
                  </button>
                </div>
              </div>
              <div className="contact-item">
                <FaWhatsapp className="contact-icon" />
                <div className="contact-info">
                  <h4>WhatsApp Support</h4>
                  <p>Chat with us on WhatsApp</p>
                  <button className="contact-action-btn whatsapp-btn" onClick={handleWhatsAppClick}>
                    <FaWhatsapp /> Chat on WhatsApp
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section className="resources-section">
            <div className="section-header">
              <FaBook className="section-icon" />
              <h3>Support Resources</h3>
            </div>
            <div className="resources-grid">
              {supportResources.map((resource, index) => (
                <div key={index} className="resource-card">
                  <div className="resource-icon">{resource.icon}</div>
                  <h4>{resource.title}</h4>
                  <p>{resource.description}</p>
                  <a href={resource.link} className="resource-link">
                    Learn More
                  </a>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Help;