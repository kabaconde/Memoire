import axios from 'axios';

// 🔧 CORRECTION : Ajouter /api à la fin de l'URL
const API_BASE_URL = 'https://memoireback.onrender.com/api';

const API = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }
});

// Intercepteur pour ajouter /api si nécessaire (MAINTENANT CORRIGÉ)
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Ne plus ajouter /api car la base URL le contient déjà
    // Supprimer ou commenter cette partie
    // if (!config.url.startsWith('/api') && !config.url.startsWith('http')) {
    //     config.url = `/api${config.url}`;
    // }
    
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    return config;
});

API.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('[API Error]', error.response?.status, error.response?.data);
        if (error.response?.status === 401) {
            localStorage.clear();
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
);

export default API;