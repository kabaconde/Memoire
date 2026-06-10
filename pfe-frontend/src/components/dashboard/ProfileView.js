import React, { useRef, useState, useEffect } from 'react';
import { 
    Box, Paper, Typography, Button, Stack, Grid, TextField, 
    InputAdornment, Avatar, IconButton, Dialog, DialogTitle,
    DialogContent, DialogActions, CircularProgress, Tooltip,
    Fade, Zoom, Grow, useMediaQuery, Alert, Chip, Divider
} from '@mui/material';
import { 
    Edit, Close, PhotoCamera, Delete, CloudUpload, ZoomIn, 
    Person, Email, Phone, Save, Cancel, Security, VerifiedUser,
    Badge as BadgeIcon, Info
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const MotionBox = motion(Box);
const MotionPaper = motion(Paper);

const API_BASE_URL = 'https://memoireback.onrender.com/api';

const ProfileView = ({ userData, setUserData, isEditing, setIsEditing, handleUpdateProfil, setSnackbar, isMobile = false }) => {
    const [openPhotoDialog, setOpenPhotoDialog] = useState(false);
    const [openFullscreenDialog, setOpenFullscreenDialog] = useState(false);
    const [tempPhoto, setTempPhoto] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [hovered, setHovered] = useState(false);
    const [showWelcome, setShowWelcome] = useState(true);
    const fileInputRef = useRef(null);
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

    const handlePhotoClick = (e) => {
        e.stopPropagation();
        if (isEditing) {
            fileInputRef.current.click();
        }
    };

    const handleViewFullscreen = () => {
        if (userData.photoProfil) {
            setOpenFullscreenDialog(true);
        }
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                setSnackbar({ open: true, message: "L'image est trop volumineuse. Taille maximale: 2MB", severity: 'error' });
                return;
            }
            if (!file.type.startsWith('image/')) {
                setSnackbar({ open: true, message: "Veuillez sélectionner une image (JPEG, PNG, GIF)", severity: 'error' });
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setTempPhoto(reader.result);
                setOpenPhotoDialog(true);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSavePhoto = async () => {
        setUploading(true);
        try {
            const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
            await axios.post(`${API_BASE_URL}/utilisateur/upload-photo`, 
                { photo: tempPhoto },
                {
                    headers: {
                        'Authorization': token ? `Bearer ${token}` : ''
                    }
                }
            );
            setUserData({ ...userData, photoProfil: tempPhoto });
            setOpenPhotoDialog(false);
            setSnackbar({ open: true, message: "✅ Photo de profil mise à jour", severity: 'success' });
        } catch (error) {
            console.error("Erreur upload photo:", error);
            setSnackbar({ open: true, message: "❌ Erreur lors de l'upload de la photo", severity: 'error' });
        } finally {
            setUploading(false);
        }
    };

    const handleDeletePhoto = async () => {
        setUploading(true);
        try {
            const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
            await axios.post(`${API_BASE_URL}/utilisateur/upload-photo`, 
                { photo: null },
                {
                    headers: {
                        'Authorization': token ? `Bearer ${token}` : ''
                    }
                }
            );
            setUserData({ ...userData, photoProfil: null });
            setTempPhoto(null);
            setSnackbar({ open: true, message: "✅ Photo de profil supprimée", severity: 'success' });
        } catch (error) {
            console.error("Erreur suppression photo:", error);
            setSnackbar({ open: true, message: "❌ Erreur lors de la suppression", severity: 'error' });
        } finally {
            setUploading(false);
        }
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
        <Box sx={{ maxWidth: '1200px', mx: 'auto', width: '100%', px: { xs: 1, sm: 2 } }}>
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
                            <Person sx={{ fontSize: { xs: 20, sm: 28 }, color: colors.secondary }} />
                            <Typography variant={mobile ? "caption" : "body2"} sx={{ fontWeight: 600, letterSpacing: '0.5px' }}>
                                👤 Gestion de votre profil utilisateur 👤
                            </Typography>
                        </Paper>
                    </MotionBox>
                )}
            </AnimatePresence>

            <Grow in={true} timeout={500}>
                <MotionPaper
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    elevation={0} 
                    sx={{ 
                        p: { xs: 2, sm: 3, md: 5 }, 
                        borderRadius: '24px', 
                        border: `1px solid ${colors.border}`,
                        bgcolor: '#fff'
                    }}
                >
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: { xs: 3, sm: 5 }, flexWrap: 'wrap', gap: 2 }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <Security sx={{ color: colors.secondary }} />
                            <Typography variant={mobile ? "h6" : "h5"} fontWeight="800" sx={{ color: colors.primary }}>
                                Mes Informations
                            </Typography>
                            <Chip 
                                label={isEditing ? "🔓 Mode édition" : "🔒 Consultation"}
                                size="small"
                                color={isEditing ? "warning" : "success"}
                                variant="outlined"
                            />
                        </Stack>
                        {!isEditing ? (
                            <Button 
                                startIcon={<Edit />} 
                                onClick={() => setIsEditing(true)} 
                                variant="outlined" 
                                sx={{ 
                                    color: colors.primary, 
                                    borderColor: colors.secondary,
                                    '&:hover': { bgcolor: `rgba(255,193,7,0.1)`, borderColor: colors.secondary }
                                }} 
                                size={mobile ? "small" : "medium"}
                            >
                                Modifier
                            </Button>
                        ) : (
                            <Button 
                                startIcon={<Cancel />} 
                                onClick={() => setIsEditing(false)} 
                                color="error" 
                                variant="outlined"
                                size={mobile ? "small" : "medium"}
                            >
                                Annuler
                            </Button>
                        )}
                    </Stack>

                    {/* Section photo de profil */}
                    <Stack direction={mobile ? "column" : "row"} spacing={4} alignItems="center" sx={{ mb: 5 }}>
                        <Box sx={{ position: 'relative' }}>
                            <Tooltip title={userData.photoProfil ? "Cliquez pour agrandir" : (isEditing ? "Cliquez pour ajouter une photo" : "")}>
                                <Box
                                    onMouseEnter={() => setHovered(true)}
                                    onMouseLeave={() => setHovered(false)}
                                    sx={{
                                        position: 'relative',
                                        cursor: userData.photoProfil ? 'pointer' : (isEditing ? 'pointer' : 'default'),
                                        '&:hover .overlay': { opacity: 1 },
                                        '&:hover .avatar': { transform: 'scale(1.05)', boxShadow: '0 8px 25px rgba(0,0,0,0.2)' }
                                    }}
                                    onClick={userData.photoProfil ? handleViewFullscreen : (isEditing ? handlePhotoClick : undefined)}
                                >
                                    <Avatar 
                                        className="avatar"
                                        src={userData.photoProfil} 
                                        sx={{ 
                                            width: { xs: 100, sm: 130 }, 
                                            height: { xs: 100, sm: 130 }, 
                                            bgcolor: colors.secondary, 
                                            fontSize: { xs: '2.5rem', sm: '3.5rem' },
                                            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                            boxShadow: hovered ? '0 8px 25px rgba(0,0,0,0.15)' : '0 2px 8px rgba(0,0,0,0.1)',
                                            border: '3px solid white',
                                            outline: hovered ? `2px solid ${colors.secondary}` : 'none',
                                        }}
                                    >
                                        {!userData.photoProfil && (userData.prenom?.[0] || userData.nom?.[0] || 'U')}
                                    </Avatar>
                                    
                                    {userData.photoProfil && (
                                        <Box 
                                            className="overlay"
                                            sx={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                right: 0,
                                                bottom: 0,
                                                borderRadius: '50%',
                                                bgcolor: 'rgba(0,0,0,0.5)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                opacity: 0,
                                                transition: 'opacity 0.3s ease',
                                                color: 'white',
                                            }}
                                        >
                                            <ZoomIn sx={{ fontSize: { xs: 30, sm: 40 } }} />
                                        </Box>
                                    )}
                                </Box>
                            </Tooltip>
                            
                            {isEditing && (
                                <Zoom in={isEditing} timeout={300}>
                                    <IconButton 
                                        sx={{ 
                                            position: 'absolute', 
                                            bottom: 0, 
                                            right: 0, 
                                            bgcolor: colors.primary, 
                                            color: 'white', 
                                            '&:hover': { bgcolor: colors.secondary, transform: 'rotate(15deg) scale(1.1)', color: colors.primary },
                                            width: { xs: 34, sm: 40 },
                                            height: { xs: 34, sm: 40 },
                                            border: '2px solid white'
                                        }}
                                        size="small"
                                        onClick={handlePhotoClick}
                                    >
                                        <PhotoCamera fontSize="small" />
                                    </IconButton>
                                </Zoom>
                            )}
                            <input
                                type="file"
                                ref={fileInputRef}
                                style={{ display: 'none' }}
                                accept="image/jpeg,image/png,image/jpg,image/gif"
                                onChange={handleFileChange}
                            />
                        </Box>
                        
                        <Box sx={{ textAlign: mobile ? 'center' : 'left' }}>
                            <Typography variant="h5" fontWeight="bold" sx={{ color: colors.primary }}>
                                {userData.prenom} {userData.nom}
                            </Typography>
                            <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                                {userData.email}
                            </Typography>
                            {userData.role && (
                                <Chip 
                                    icon={<VerifiedUser sx={{ fontSize: 16 }} />}
                                    label={`Rôle: ${userData.role}`}
                                    size="small"
                                    sx={{ bgcolor: '#e8f5e9', color: '#2e7d32' }}
                                />
                            )}
                            {userData.photoProfil && isEditing && (
                                <Button size="small" color="error" startIcon={<Delete />} onClick={handleDeletePhoto} sx={{ mt: 2, textTransform: 'none' }}>
                                    Supprimer la photo
                                </Button>
                            )}
                            {isEditing && !userData.photoProfil && (
                                <Button size="small" startIcon={<CloudUpload />} onClick={handlePhotoClick} sx={{ mt: 2, textTransform: 'none' }}>
                                    Ajouter une photo
                                </Button>
                            )}
                        </Box>
                    </Stack>

                    <Divider sx={{ my: 3 }} />

                    {/* Formulaire */}
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                            <TextField 
                                fullWidth 
                                label="Prénom" 
                                value={userData.prenom} 
                                onChange={(e) => setUserData({...userData, prenom: e.target.value})} 
                                disabled={!isEditing}
                                size={mobile ? "small" : "medium"}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Person sx={{ color: colors.textLight }} />
                                        </InputAdornment>
                                    )
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField 
                                fullWidth 
                                label="Nom" 
                                value={userData.nom} 
                                onChange={(e) => setUserData({...userData, nom: e.target.value})} 
                                disabled={!isEditing}
                                size={mobile ? "small" : "medium"}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Person sx={{ color: colors.textLight }} />
                                        </InputAdornment>
                                    )
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField 
                                fullWidth 
                                label="Email" 
                                value={userData.email} 
                                disabled 
                                variant="filled"
                                size={mobile ? "small" : "medium"}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Email sx={{ color: colors.textLight }} />
                                        </InputAdornment>
                                    )
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField 
                                fullWidth 
                                label="Téléphone" 
                                value={userData.telephone} 
                                onChange={(e) => setUserData({...userData, telephone: e.target.value})} 
                                disabled={!isEditing} 
                                InputProps={{ 
                                    startAdornment: <InputAdornment position="start">+216</InputAdornment>
                                }}
                                size={mobile ? "small" : "medium"}
                            />
                        </Grid>
                    </Grid>
                    
                    {isEditing && (
                        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                            <Button 
                                variant="outlined" 
                                onClick={() => setIsEditing(false)}
                                startIcon={<Cancel />}
                                sx={{ color: 'error' }}
                            >
                                Annuler
                            </Button>
                            <Button 
                                variant="contained" 
                                onClick={handleUpdateProfil} 
                                startIcon={<Save />}
                                sx={{ 
                                    bgcolor: colors.primary, 
                                    px: { xs: 4, sm: 6 },
                                    py: { xs: 1, sm: 1.5 },
                                    width: mobile ? '100%' : 'auto',
                                    '&:hover': { bgcolor: colors.primary, opacity: 0.9 }
                                }}
                            >
                                Enregistrer les modifications
                            </Button>
                        </Box>
                    )}

                    {/* Informations complémentaires */}
                    {!isEditing && userData.dateCreation && (
                        <Alert severity="info" sx={{ mt: 4, borderRadius: '12px' }}>
                            <Stack direction="row" alignItems="center" spacing={1}>
                                <Info fontSize="small" />
                                <Typography variant="caption">
                                    Membre depuis le {new Date(userData.dateCreation).toLocaleDateString('fr-FR')}
                                </Typography>
                            </Stack>
                        </Alert>
                    )}
                </MotionPaper>
            </Grow>

            {/* Dialog aperçu photo */}
            <Dialog open={openPhotoDialog} onClose={() => setOpenPhotoDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ bgcolor: colors.primary, color: 'white', fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                    Aperçu de la photo
                </DialogTitle>
                <DialogContent sx={{ textAlign: 'center', py: 3 }}>
                    {tempPhoto && (
                        <Zoom in={true}>
                            <img 
                                src={tempPhoto} 
                                alt="Aperçu" 
                                style={{ 
                                    maxWidth: '100%', 
                                    maxHeight: '300px', 
                                    borderRadius: '12px',
                                    objectFit: 'cover'
                                }} 
                            />
                        </Zoom>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenPhotoDialog(false)}>Annuler</Button>
                    <Button onClick={handleSavePhoto} variant="contained" disabled={uploading} sx={{ bgcolor: colors.primary }}>
                        {uploading ? <CircularProgress size={24} /> : "Enregistrer"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Dialog plein écran */}
            <Dialog 
                open={openFullscreenDialog} 
                onClose={() => setOpenFullscreenDialog(false)}
                maxWidth="md"
                fullWidth
                TransitionComponent={Fade}
                PaperProps={{ sx: { bgcolor: 'rgba(0,0,0,0.95)', borderRadius: '20px', margin: { xs: 2, sm: 'auto' } } }}
            >
                <DialogTitle sx={{ bgcolor: 'transparent', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant={mobile ? "subtitle1" : "h6"}>Photo de profil</Typography>
                    <IconButton onClick={() => setOpenFullscreenDialog(false)} sx={{ color: 'white' }}>
                        <Close />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ textAlign: 'center', py: 4, minHeight: { xs: '300px', sm: '400px' } }}>
                    {userData.photoProfil && (
                        <Zoom in={true}>
                            <img 
                                src={userData.photoProfil} 
                                alt="Photo de profil" 
                                style={{ maxWidth: '100%', maxHeight: '60vh', borderRadius: '20px', objectFit: 'contain' }} 
                                onClick={() => setOpenFullscreenDialog(false)}
                            />
                        </Zoom>
                    )}
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'center', p: 2, gap: 2 }}>
                    <Button onClick={() => setOpenFullscreenDialog(false)} sx={{ color: 'white' }}>Fermer</Button>
                    {isEditing && (
                        <Button variant="contained" startIcon={<PhotoCamera />} onClick={() => { setOpenFullscreenDialog(false); handlePhotoClick(); }} sx={{ bgcolor: colors.secondary, color: colors.primary, '&:hover': { bgcolor: '#e6af06' } }}>
                            Changer la photo
                        </Button>
                    )}
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ProfileView;