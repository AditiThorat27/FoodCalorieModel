import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Use your machine's IP address if testing on physical device
// Use 10.0.2.2 for Android Emulator
// Use localhost for iOS Simulator
const API_URL = 'http://10.129.216.36:5000';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // 10 second timeout
});

api.interceptors.request.use(request => {
    console.log('Starting Request', request.method, request.url);
    return request;
});

api.interceptors.response.use(response => {
    console.log('Response:', response.status, response.statusText);
    return response;
}, error => {
    console.log('API Error:', error.message);
    return Promise.reject(error);
});

api.interceptors.request.use(async (config) => {
    const token = await SecureStore.getItemAsync('token');
    if (token) {
        config.headers['x-auth-token'] = token;
    }
    return config;
});

export const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    await SecureStore.setItemAsync('token', response.data.token);
    return response.data;
};

export const register = async (email, password, profile) => {
    const response = await api.post('/auth/register', { email, password, profile });
    await SecureStore.setItemAsync('token', response.data.token);
    return response.data;
};

export const analyzeImage = async (imageBase64) => {
    const response = await api.post('/meals/analyze', { imageBase64 });
    return response.data;
};

export const saveMeal = async (mealData) => {
    const response = await api.post('/meals', mealData);
    return response.data;
};

export const getProfile = async () => {
    const response = await api.get('/auth/me');
    return response.data;
};

export const updateProfile = async (profileData) => {
    const response = await api.put('/auth/profile', { profile: profileData });
    return response.data;
};

export const changePassword = async (currentPassword, newPassword) => {
    const response = await api.post('/auth/change-password', { currentPassword, newPassword });
    return response.data;
};

export const getMeals = async () => {
    const response = await api.get('/meals');
    return response.data;
};

export default api;
