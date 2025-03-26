const API_BASE_URL = 'http://localhost:4000/api';

export const API_ENDPOINTS = {
  // Student endpoints
  STUDENT_LOGIN: `${API_BASE_URL}/student/login`,
  STUDENT_REGISTER: `${API_BASE_URL}/student/register`,
  STUDENT_PROFILE: `${API_BASE_URL}/student/profile`,
  UPDATE_PROFILE: `${API_BASE_URL}/student/update-profile`,
  STUDENT_ASSIGNMENTS: `${API_BASE_URL}/student/assignments`,
  UPLOAD_ASSIGNMENT: `${API_BASE_URL}/student/upload-assignment`,
  DOWNLOAD_FILE: (filename) => `${API_BASE_URL}/student/download/${filename}`,
  
  // Expert endpoints
  EXPERT_LOGIN: `${API_BASE_URL}/expert/login`,
  EXPERT_REGISTER: `${API_BASE_URL}/expert/register`,
  EXPERT_PROFILE: `${API_BASE_URL}/expert/profile`,
  
  // Common endpoints
  HELP: `${API_BASE_URL}/help`,
  SETTINGS: `${API_BASE_URL}/settings`
};

export const getAuthHeader = () => {
  const token = localStorage.getItem('studentToken');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export const getExpertAuthHeader = () => {
  const token = localStorage.getItem('expertToken');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with a status code outside of 2xx range
    return error.response.data.error || 'An error occurred with the server';
  } else if (error.request) {
    // Request was made but no response received
    return 'No response received from server';
  } else {
    // Error in setting up the request
    return 'Error setting up the request';
  }
};

export const isAuthenticated = () => {
  const token = localStorage.getItem('studentToken');
  const userData = localStorage.getItem('studentData');
  return !!(token && userData);
};

export const isExpertAuthenticated = () => {
  const token = localStorage.getItem('expertToken');
  const userData = localStorage.getItem('expertData');
  return !!(token && userData);
};

export const getMultipartHeader = () => ({
  ...getAuthHeader(),
  'Content-Type': 'multipart/form-data',
}); 