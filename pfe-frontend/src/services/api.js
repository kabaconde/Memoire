// src/services/api.js
import axios from 'axios';

const API_BASE_URL = 'https://memoireback.onrender.com/api';

// Liste des routes publiques (ne doivent PAS avoir de token)
const PUBLIC_ROUTES = [
    '/connexion',
    '/verifier-otp',
    '/send-otp',
    '/signature/send-otp',
    '/signature/details',
    '/signature/apercu',
    '/auth/demande-inscription',
    '/auth/finaliser-inscription',
    '/mot-de-passe-oublie',
    '/reinitialiser-mot-de-passe',
    '/auth/check'
];

const API = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }
});

// Intercepteur pour ajouter le token SEULEMENT pour les routes non publiques
API.interceptors.request.use((config) => {
    // Vérifier si la route est publique
    const isPublicRoute = PUBLIC_ROUTES.some(route => config.url.includes(route));
    
    if (!isPublicRoute) {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.baseURL}${config.url} - Public: ${isPublicRoute}`);
    return config;
});

API.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('[API Error]', error.response?.status, error.response?.data);
        if (error.response?.status === 401) {
            // Ne pas rediriger pour les routes publiques
            const isPublicError = PUBLIC_ROUTES.some(route => error.config?.url?.includes(route));
            if (!isPublicError) {
                localStorage.clear();
                window.location.href = '/';
            }
        }
        return Promise.reject(error);
    }
);

export default API;