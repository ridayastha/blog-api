import axios from 'axios';

const api = axios.create({
    baseURL: 'http://127.0.0.1:8000/api/v1/',
    // DELETE: 'Content-Type': 'application/json'
    // Reason: Axios will now auto-detect if you are sending JSON or FormData.
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Automatically clear local storage if the token is dead
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            // Optional: window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;