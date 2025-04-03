import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const withAuth = (WrappedComponent) => {
  return function WithAuthComponent(props) {
    const navigate = useNavigate();

    useEffect(() => {
      const token = localStorage.getItem('expertToken');
      if (!token) {
        console.log('No token found in HOC, redirecting to login');
        navigate('/expert-login');
      }
    }, [navigate]);

    return <WrappedComponent {...props} />;
  };
};

export default withAuth; 