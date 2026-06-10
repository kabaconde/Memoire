import React, { useRef, useState, useEffect } from 'react';
import { Box, Paper, Typography, Button, Stack, Alert, useMediaQuery, Fade, Zoom, Chip, Divider } from '@mui/material';
import { Draw as DrawIcon, CheckCircle, Refresh, Delete, Edit, Fingerprint, VerifiedUser } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import SignatureCanvas from 'react-signature-canvas';
import axios from 'axios';

const MotionBox = motion(Box);
const MotionPaper = motion(Paper);

const API_BASE_URL = 'https://memoireback.onrender.com/api';

const SignatureView = ({ setSnackbar, onSignatureSaved, isMobile = false }) => {
    const sigPad = useRef(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [signatureExists, setSignatureExists] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [showWelcome, setShowWelcome] = useState(true);
    const [hasDrawing, setHasDrawing] = useState(false);
    const isSmallScreen = useMediaQuery('(max-width:600px)');
    const mobile = isMobile || isSmallScreen;

    // Masquer le message de bienvenue après 3 secondes
    useEffect(() => {
        const timer = setTimeout(() => {
            setShowWelcome(false);
        }, 3000);
        return () => clearTimeout(timer);
    }, []);

    // Récupérer le token
    const getAuthHeaders = () => {
        const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
        return {
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json'
        };
    };

    useEffect(() => {
        const checkExistingSignature = async () => {
            try {
                const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
                const response = await axios.get(`${API_BASE_URL}/utilisateur/mon-profil`, {
                    headers: {
                        'Authorization': token ? `Bearer ${token}` : ''
                    }
                });
                if (response.data.imageSignature) {
                    setSignatureExists(true);
                    setPreviewUrl(response.data.imageSignature);
                }
            } catch (error) {
                console.error("Erreur vérification signature:", error);
            }
        };
        checkExistingSignature();
    }, []);

    const clear = () => {
        if (sigPad.current) {
            sigPad.current.clear();
            setHasDrawing(false);
            setIsSaved(false);
        }
    };

    const checkHasDrawing = () => {
        if (sigPad.current && !sigPad.current.isEmpty()) {
            setHasDrawing(true);
        } else {
            setHasDrawing(false);
        }
    };

    const saveSignature = async () => {
        if (sigPad.current.isEmpty()) {
            setSnackbar({ open: true, message: "✍️ Veuillez dessiner une signature avant d'enregistrer.", severity: 'warning' });
            return;
        }
        
        const canvas = sigPad.current.getCanvas();
        const dataURL = canvas.toDataURL('image/png');
        
        try {
            setIsSaving(true);
            const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
            await axios.post(`${API_BASE_URL}/utilisateur/sauvegarder-signature`, 
                { imageSignature: dataURL }, 
                {
                    headers: {
                        'Authorization': token ? `Bearer ${token}` : ''
                    }
                }
            );
            setSignatureExists(true);
            setPreviewUrl(dataURL);
            setIsSaved(true);
            setHasDrawing(false);
            setSnackbar({ open: true, message: "✅ Signature manuscrite enregistrée avec succès !", severity: 'success' });
            clear();
            if (onSignatureSaved) onSignatureSaved();
            setTimeout(() => setIsSaved(false), 3000);
        } catch (error) {
            console.error("Erreur save signature:", error);
            setSnackbar({ open: true, message: "❌ Erreur lors de l'enregistrement de la signature.", severity: 'error' });
        } finally { setIsSaving(false); }
    };

    const colors = {
        primary: '#0b1e39',
        secondary: '#ffc107',
        accent: '#10b981',
        background: '#f8fafc',
        border: '#e2e8f0',
        text: '#1e293b',
        textLight: '#64748b'
    };

    return (
        <Box sx={{ maxWidth: '1000px', mx: 'auto', width: '100%', px: { xs: 1, sm: 2 } }}>
            {/* Message de bienvenue animé */}
            <AnimatePresence>
                {showWelcome && (
                    <MotionBox
                        initial={{ opacity: 0, y: -50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -50, scale: 0.9 }}
                        transition={{ duration: 0.5, type: 'spring', stiffness: 300 }}
                        sx={{
                            position: 'fixed',
                            top: 80,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            zIndex: 1300,
                            width: { xs: '90%', sm: 'auto' }
                        }}
                    >
                        <Paper
                            elevation={6}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: { xs: 1, sm: 2 },
                                px: { xs: 2, sm: 3 },
                                py: { xs: 1, sm: 1.5 },
                                borderRadius: '50px',
                                background: `linear-gradient(135deg, ${colors.primary} 0%, #1a3a5c 100%)`,
                                color: '#fff',
                                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)',
                                border: `1px solid rgba(255,193,7,0.3)`
                            }}
                        >
                            <Fingerprint sx={{ fontSize: { xs: 20, sm: 28 }, color: colors.secondary }} />
                            <Typography variant={mobile ? "caption" : "body2"} sx={{ fontWeight: 600, letterSpacing: '0.5px' }}>
                                ✍️ Créez votre signature manuscrite unique ✍️
                            </Typography>
                        </Paper>
                    </MotionBox>
                )}
            </AnimatePresence>

            <MotionPaper
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                elevation={0} 
                sx={{ 
                    p: { xs: 2, sm: 3, md: 5 }, 
                    borderRadius: '24px', 
                    border: `1px solid ${colors.border}`,
                    bgcolor: '#fff',
                    textAlign: 'center'
                }}
            >
                {/* Animation de succès */}
                <AnimatePresence>
                    {isSaved && (
                        <MotionBox
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Alert 
                                icon={<CheckCircle fontSize="inherit" />} 
                                severity="success" 
                                sx={{ mb: 3, borderRadius: '12px' }}
                                onClose={() => setIsSaved(false)}
                            >
                                <strong>✓ Signature enregistrée avec succès !</strong> Votre signature manuscrite est maintenant disponible.
                            </Alert>
                        </MotionBox>
                    )}
                </AnimatePresence>
                
                {/* Signature existante */}
                {signatureExists && previewUrl && (
                    <Fade in={true}>
                        <Box sx={{ 
                            mb: 4, 
                            p: 2.5, 
                            bgcolor: colors.background, 
                            borderRadius: '16px',
                            border: `1px solid ${colors.border}`
                        }}>
                            <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <VerifiedUser sx={{ color: colors.accent }} />
                                    <Typography variant="subtitle2" fontWeight="600" sx={{ color: colors.primary }}>
                                        Signature actuelle
                                    </Typography>
                                    <Chip label="Enregistrée" size="small" color="success" variant="outlined" />
                                </Stack>
                                <img 
                                    src={previewUrl} 
                                    alt="Signature actuelle" 
                                    style={{ 
                                        maxHeight: '70px', 
                                        maxWidth: '250px', 
                                        border: `1px solid ${colors.border}`, 
                                        borderRadius: '8px', 
                                        padding: '8px', 
                                        backgroundColor: '#fff',
                                        objectFit: 'contain'
                                    }} 
                                />
                            </Stack>
                        </Box>
                    </Fade>
                )}
                
                {/* En-tête */}
                <Box sx={{ mb: 4 }}>
                    <Box sx={{ 
                        width: 70, 
                        height: 70, 
                        bgcolor: `rgba(255,193,7,0.1)`, 
                        borderRadius: '20px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 2
                    }}>
                        <DrawIcon sx={{ fontSize: 36, color: colors.secondary }} />
                    </Box>
                    <Typography variant={mobile ? "h6" : "h5"} fontWeight="800" sx={{ color: colors.primary, mb: 1 }}>
                        {signatureExists ? "Modifier ma signature manuscrite" : "Créer ma signature manuscrite"}
                    </Typography>
                    <Typography variant="body2" sx={{ color: colors.textLight, maxWidth: '500px', mx: 'auto' }}>
                        {signatureExists 
                            ? "Vous pouvez modifier votre signature en dessinant une nouvelle ci-dessous. La nouvelle signature remplacera l'ancienne."
                            : "Cette signature sera utilisée par défaut pour toutes vos signatures électroniques sur la plateforme."}
                    </Typography>
                </Box>
                
                {/* Zone de dessin */}
                <Box sx={{ 
                    border: hasDrawing ? `2px solid ${colors.secondary}` : `1px solid ${colors.border}`, 
                    borderRadius: '16px', 
                    bgcolor: '#fff', 
                    mb: 3, 
                    cursor: 'crosshair', 
                    overflow: 'auto', 
                    maxWidth: '100%', 
                    mx: 'auto',
                    transition: 'all 0.2s ease',
                    boxShadow: hasDrawing ? `0 0 0 2px rgba(255,193,7,0.2)` : 'none'
                }}>
                    <SignatureCanvas 
                        ref={sigPad}
                        penColor='#1a237e'
                        onEnd={checkHasDrawing}
                        canvasProps={{ 
                            width: mobile ? 380 : 650, 
                            height: mobile ? 180 : 220, 
                            className: 'sigCanvas', 
                            style: { maxWidth: '100%', height: 'auto', display: 'block', margin: '0 auto' } 
                        }}
                    />
                </Box>
                
                {/* Indicateur de dessin */}
                {hasDrawing && (
                    <Fade in={hasDrawing}>
                        <Typography variant="caption" sx={{ color: colors.accent, mb: 2, display: 'block' }}>
                            ✓ Signature dessinée - Prêt à enregistrer
                        </Typography>
                    </Fade>
                )}
                
                <Divider sx={{ my: 3 }} />
                
                {/* Actions */}
                <Stack direction={mobile ? "column" : "row"} spacing={2} justifyContent="center">
                    <Button 
                        variant="outlined" 
                        onClick={clear} 
                        disabled={isSaving}
                        startIcon={<Delete />}
                        fullWidth={mobile} 
                        sx={{ 
                            px: 4, 
                            py: 1.2,
                            borderRadius: '12px',
                            textTransform: 'none',
                            borderColor: colors.border,
                            color: colors.textLight,
                            '&:hover': { borderColor: '#ef4444', color: '#ef4444', bgcolor: '#fef2f2' }
                        }}
                    >
                        Effacer
                    </Button>
                    <Button 
                        variant="contained" 
                        onClick={saveSignature} 
                        disabled={isSaving}
                        startIcon={signatureExists ? <Edit /> : <CheckCircle />}
                        fullWidth={mobile} 
                        sx={{ 
                            bgcolor: colors.primary, 
                            px: 5, 
                            py: 1.2,
                            borderRadius: '12px',
                            textTransform: 'none',
                            fontWeight: 600,
                            '&:hover': { bgcolor: colors.primary, opacity: 0.9 }
                        }}
                    >
                        {isSaving ? "Enregistrement..." : (signatureExists ? "Mettre à jour" : "Enregistrer ma signature")}
                    </Button>
                </Stack>

                {/* Information juridique */}
                <Alert 
                    severity="info" 
                    sx={{ 
                        mt: 4, 
                        borderRadius: '12px',
                        bgcolor: '#eff6ff',
                        '& .MuiAlert-icon': { color: '#2563eb' }
                    }}
                >
                    <Typography variant="caption">
                        <strong>🔒 Valeur juridique :</strong> Cette signature manuscrite numérisée a la même valeur juridique qu'une signature physique 
                        dans le cadre de la réglementation eIDAS et de la loi tunisienne sur les échanges électroniques.
                    </Typography>
                </Alert>
            </MotionPaper>

            <style>
                {`
                    .sigCanvas {
                        background-color: #fafafa;
                        border-radius: 12px;
                    }
                `}
            </style>
        </Box>
    );
};

export default SignatureView;