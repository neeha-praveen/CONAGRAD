import React, { useState } from 'react';
import DashboardLayout from './layouts/DashboardLayout';
import { FaBell, FaLock, FaMoon, FaSun, FaLanguage } from 'react-icons/fa';
import { motion } from 'framer-motion';
import './Settings.css';

const Settings = () => {
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: true,
      sms: false
    },
    privacy: {
      profileVisibility: 'public',
      showEmail: false,
      showPhone: false
    },
    appearance: {
      theme: 'light'
    },
    language: 'en'
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleNotificationChange = (type) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [type]: !prev.notifications[type]
      }
    }));
  };

  const handlePrivacyChange = (type) => {
    setSettings(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [type]: !prev.privacy[type]
      }
    }));
  };

  const handleThemeChange = (theme) => {
    setSettings(prev => ({
      ...prev,
      appearance: {
        ...prev.appearance,
        theme
      }
    }));
  };

  const handleLanguageChange = (e) => {
    setSettings(prev => ({
      ...prev,
      language: e.target.value
    }));
  };

  const handleSave = () => {
    try {
      localStorage.setItem('userSettings', JSON.stringify(settings));
      setSuccess('Settings saved successfully!');
      setError('');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to save settings. Please try again.');
      setSuccess('');
      setTimeout(() => setError(''), 3000);
    }
  };

  return (
    <DashboardLayout>
      <motion.div 
        className="settings-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div 
          className="settings-header"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h2 style={{ color: 'white' }}>Settings</h2>
          <motion.button 
            className="save-button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSave}
          >
            Save Changes
          </motion.button>
        </motion.div>

        {error && (
          <motion.div 
            className="alert alert-error"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {error}
          </motion.div>
        )}
        {success && (
          <motion.div 
            className="alert alert-success"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {success}
          </motion.div>
        )}

        <div className="settings-content">
          <motion.section 
            className="settings-section"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="section-header">
              <FaBell className="section-icon" />
              <h3>Notifications</h3>
            </div>
            <div className="settings-options">
              <motion.div 
                className="toggle-option"
                whileHover={{ x: 5 }}
              >
                <label>Email Notifications</label>
                <div className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.notifications.email}
                    onChange={() => handleNotificationChange('email')}
                  />
                  <span className="toggle-slider"></span>
                </div>
              </motion.div>
              <motion.div 
                className="toggle-option"
                whileHover={{ x: 5 }}
              >
                <label>Push Notifications</label>
                <div className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.notifications.push}
                    onChange={() => handleNotificationChange('push')}
                  />
                  <span className="toggle-slider"></span>
                </div>
              </motion.div>
              <motion.div 
                className="toggle-option"
                whileHover={{ x: 5 }}
              >
                <label>SMS Notifications</label>
                <div className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.notifications.sms}
                    onChange={() => handleNotificationChange('sms')}
                  />
                  <span className="toggle-slider"></span>
                </div>
              </motion.div>
            </div>
          </motion.section>

          <motion.section 
            className="settings-section"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="section-header">
              <FaLock className="section-icon" />
              <h3>Privacy</h3>
            </div>
            <div className="settings-options">
              <motion.div 
                className="toggle-option"
                whileHover={{ x: 5 }}
              >
                <label>Show Email</label>
                <div className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.privacy.showEmail}
                    onChange={() => handlePrivacyChange('showEmail')}
                  />
                  <span className="toggle-slider"></span>
                </div>
              </motion.div>
              <motion.div 
                className="toggle-option"
                whileHover={{ x: 5 }}
              >
                <label>Show Phone</label>
                <div className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.privacy.showPhone}
                    onChange={() => handlePrivacyChange('showPhone')}
                  />
                  <span className="toggle-slider"></span>
                </div>
              </motion.div>
            </div>
          </motion.section>

          <motion.section 
            className="settings-section"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="section-header">
              <FaMoon className="section-icon" />
              <h3>Appearance</h3>
            </div>
            <div className="theme-options">
              <motion.button
                className={`theme-button ${settings.appearance.theme === 'light' ? 'active' : ''}`}
                onClick={() => handleThemeChange('light')}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaSun /> Light
              </motion.button>
              <motion.button
                className={`theme-button ${settings.appearance.theme === 'dark' ? 'active' : ''}`}
                onClick={() => handleThemeChange('dark')}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaMoon /> Dark
              </motion.button>
            </div>
          </motion.section>

          <motion.section 
            className="settings-section"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="section-header">
              <FaLanguage className="section-icon" />
              <h3>Language</h3>
            </div>
            <div className="language-select">
              <select
                value={settings.language}
                onChange={handleLanguageChange}
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="it">Italian</option>
              </select>
            </div>
          </motion.section>
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default Settings;