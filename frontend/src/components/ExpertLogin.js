const handleLogin = async (credentials) => {
  try {
    const response = await axios.post('http://localhost:4000/expert/login', credentials);
    const { token, username } = response.data;
    
    // Debug log
    console.log('Login successful, storing token and username:', {
      hasToken: !!token,
      username
    });

    localStorage.setItem('expertToken', token);
    localStorage.setItem('expertUsername', username);
    
    // Verify storage
    const storedToken = localStorage.getItem('expertToken');
    console.log('Stored token verification:', !!storedToken);

    navigate('/expert-dashboard');
  } catch (error) {
    console.error('Login failed:', error);
    // Handle login error
  }
}; 