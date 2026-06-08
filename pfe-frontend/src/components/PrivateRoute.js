import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/material';

// URL de l'API backend
const API_BASE_URL = 'https://memoireback.onrender.com/api';

const PrivateRoute = ({ children, allowedRoles }) => {
    const [isAuthorized, setIsAuthorized] = useState(null);
    const [userRole, setUserRole] = useState(null);

    // Récupérer le token
    const getToken = () => {
        return localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    };

    useEffect(() => {
        let isMounted = true;

        const checkAuth = async () => {
            try {
                const token = getToken();
                
                // Si pas de token, non autorisé directement
                if (!token) {
                    console.warn('[Auth] Aucun token trouvé');
                    if (isMounted) setIsAuthorized(false);
                    return;
                }

                // Utilisation de fetch avec token Bearer
                const response = await fetch(`${API_BASE_URL}/auth/check`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (!isMounted) return;

                if (response.ok) {
                    const data = await response.json();
                    
                    if (data.authentifie) {
                        const role = data.role;
                        setUserRole(role);
                        
                        // Vérification du rôle
                        if (allowedRoles && allowedRoles.length > 0) {
                            if (!allowedRoles.includes(role)) {
                                console.warn(`[Auth] Rôle insuffisant: ${role}`);
                                setIsAuthorized(false);
                                return;
                            }
                        }
                        
                        console.log(`[Auth] ✅ Accès accordé pour: ${role}`);
                        setIsAuthorized(true);
                    } else {
                        console.warn('[Auth] Session invalide ou expirée');
                        setIsAuthorized(false);
                    }
                } else if (response.status === 401) {
                    console.warn('[Auth] Token invalide ou expiré');
                    localStorage.removeItem('accessToken');
                    sessionStorage.removeItem('accessToken');
                    setIsAuthorized(false);
                } else {
                    console.warn('[Auth] Session invalide ou expirée');
                    setIsAuthorized(false);
                }
            } catch (error) {
                console.error('[Auth] Erreur lors de la vérification:', error.message);
                if (isMounted) setIsAuthorized(false);
            }
        };

        checkAuth();

        return () => {
            isMounted = false;
        };
    }, [allowedRoles]);

    if (isAuthorized === null) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress size={60} />
            </Box>
        );
    }

    if (!isAuthorized) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default PrivateRoute;