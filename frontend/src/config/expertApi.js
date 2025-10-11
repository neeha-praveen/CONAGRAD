import axios from "axios";

const expertApi = axios.create({
  baseURL: "http://localhost:4000/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json"
  }
});

// Attach access token before requests
expertApi.interceptors.request.use(
  (config) => {
    // ✅ Don't add token to login/register requests
    const publicEndpoints = ['/expert/login', '/expert/register', '/auth/refresh'];
    const isPublicEndpoint = publicEndpoints.some(endpoint => 
      config.url?.includes(endpoint)
    );
    
    if (!isPublicEndpoint) {
      const token = localStorage.getItem("expertToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle expired tokens (401) with refresh
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

expertApi.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    // ✅ Don't retry login/register/refresh requests
    const publicEndpoints = ['/expert/login', '/expert/register', '/auth/refresh'];
    const isPublicEndpoint = publicEndpoints.some(endpoint => 
      originalRequest.url?.includes(endpoint)
    );

    if (error.response?.status === 401 && !originalRequest._retry && !isPublicEndpoint) {
      if (isRefreshing) {
        // ✅ Queue requests while refreshing
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            return expertApi(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshRes = await axios.post(
          "http://localhost:4000/api/auth/refresh",
          {},
          { withCredentials: true }
        );
        
        const newAccessToken = refreshRes.data.accessToken;
        
        if (newAccessToken) {
          localStorage.setItem("expertToken", newAccessToken);
          expertApi.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;
          originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
          
          processQueue(null, newAccessToken);
          
          return expertApi(originalRequest);
        }
      } catch (refreshError) {
        console.error("Expert refresh failed:", refreshError);
        processQueue(refreshError, null);
        localStorage.removeItem("expertToken");
        window.location.href = "/expert-login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    
    return Promise.reject(error);
  }
);

export default expertApi;