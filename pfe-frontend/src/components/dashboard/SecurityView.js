import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, TextField, Button, Stack, Alert, useMediaQuery, IconButton, InputAdornment, Fade, Chip } from '@mui/material';
import { Lock, Security, Visibility, VisibilityOff, CheckCircle, Cancel, Info, VerifiedUser, Shield } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const MotionBox = motion(Box);
const MotionPaper = motion(Paper);

const SecurityView = ({ passwordData, setPasswordData, handleChangePassword, isMobile = false }) => {
    const [showPassword, setShowPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showWelcome, setShowWelcome] = useState(true);
    const [passwordStrength, setPasswordStrength] = useState({ score: 0, message: '', color: '' });
    const [passwordMatch, setPasswordMatch] = useState(null);
    
    const isSmallScreen = useMediaQuery('(max-width:600px)');
    const mobile = isMobile || isSmallScreen;

    // Masquer le message de bienvenue après 3 secondes
    useEffect(() => {
        const timer = setTimeout(() => {
            setShowWelcome(false);
        }, 3000);
        return () => clearTimeout(timer);
    }, []);

    // Vérifier la force du mot de passe
    const checkPasswordStrength = (password) => {
        let score = 0;
        let message = '';
        let color = '';
        
        if (password.length >= 8) score++;
        if (password.match(/[a-z]/) && password.match(/[A-Z]/)) score++;
        if (password.match(/[0-9]/)) score++;
        if (password.match(/[^a-zA-Z0-9]/)) score++;
        
        if (score === 0 || (password.length > 0 && score === 1)) {
            message = 'Très faible';
            color = '#ef4444';
        } else if (score === 2) {
            message = 'Faible';
            color = '#f59e0b';
        } else if (score === 3) {
            message = 'Moyen';
            color = '#eab308';
        } else if (score === 4) {
            message = 'Fort';
            color = '#10b981';
        }
        
        setPasswordStrength({ score, message, color });
    };

    // Vérifier si les mots de passe correspondent
    useEffect(() => {
        if (passwordData.newPassword || passwordData.confirmPassword) {
            if (passwordData.newPassword === passwordData.confirmPassword && passwordData.newPassword !== '') {
                setPasswordMatch(true);
            } else if (passwordData.confirmPassword !== '') {
                setPasswordMatch(false);
            } else {
                setPasswordMatch(null);
            }
        }
        if (passwordData.newPassword) {
            checkPasswordStrength(passwordData.newPassword);
        } else {
            setPasswordStrength({ score: 0, message: '', color: '' });
        }
    }, [passwordData.newPassword, passwordData.confirmPassword]);

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
        <Box sx={{ maxWidth: '900px', mx: 'auto', width: '100%', px: { xs: 1, sm: 2 } }}>
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
                            <Shield sx={{ fontSize: { xs: 20, sm: 28 }, color: colors.secondary }} />
                            <Typography variant={mobile ? "caption" : "body2"} sx={{ fontWeight: 600, letterSpacing: '0.5px' }}>
                                🔐 Gérez la sécurité de votre compte 🔐
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
                    p: { xs: 2, sm: 3, md: 4 }, 
                    borderRadius: '24px', 
                    border: `1px solid ${colors.border}`,
                    bgcolor: '#fff'
                }}
            >
                <Stack direction={mobile ? "column" : "row"} alignItems={mobile ? "center" : "flex-start"} spacing={2} sx={{ mb: 4 }}>
                    <Box sx={{ 
                        bgcolor: `rgba(255,193,7,0.1)`, 
                        p: 1.5, 
                        borderRadius: '16px', 
                        display: 'inline-flex' 
                    }}>
                        <Security sx={{ color: colors.secondary, fontSize: { xs: 28, sm: 32 } }} />
                    </Box>
                    <Box sx={{ textAlign: mobile ? 'center' : 'left' }}>
                        <Typography variant={mobile ? "h6" : "h5"} fontWeight="800" sx={{ color: colors.primary }}>
                            Sécurité du compte
                        </Typography>
                        <Typography variant="caption" sx={{ color: colors.textLight }}>
                            Modifiez votre mot de passe régulièrement pour protéger votre compte
                        </Typography>
                    </Box>
                </Stack>

                <Alert 
                    severity="info" 
                    sx={{ 
                        mb: 4, 
                        borderRadius: '12px',
                        bgcolor: '#eff6ff',
                        '& .MuiAlert-icon': { color: '#2563eb' }
                    }}
                    icon={<VerifiedUser />}
                >
                    <Typography variant="body2">
                        <strong>Règles de sécurité :</strong> Votre mot de passe doit contenir au moins 8 caractères, 
                        une majuscule, une minuscule, un chiffre et un caractère spécial.
                    </Typography>
                </Alert>

                <Stack spacing={3}>
                    <TextField
                        fullWidth
                        type={showPassword ? 'text' : 'password'}
                        label="Mot de passe actuel"
                        value={passwordData.oldPassword}
                        onChange={(e) => setPasswordData({...passwordData, oldPassword: e.target.value})}
                        size={mobile ? "small" : "medium"}
                        InputProps={{ 
                            startAdornment: <Lock sx={{ mr: 1, color: colors.textLight }} />,
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                    />
                    
                    <Box>
                        <TextField
                            fullWidth
                            type={showNewPassword ? 'text' : 'password'}
                            label="Nouveau mot de passe"
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                            size={mobile ? "small" : "medium"}
                            InputProps={{ 
                                startAdornment: <Lock sx={{ mr: 1, color: colors.textLight }} />,
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={() => setShowNewPassword(!showNewPassword)} edge="end">
                                            {showNewPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />
                        
                        {/* Indicateur de force du mot de passe */}
                        {passwordData.newPassword && (
                            <Fade in={true}>
                                <Box sx={{ mt: 1.5 }}>
                                    <Stack direction="row" alignItems="center" spacing={2} flexWrap="wrap">
                                        <Typography variant="caption" sx={{ color: colors.textLight }}>
                                            Force du mot de passe :
                                        </Typography>
                                        <Box sx={{ 
                                            width: '100px', 
                                            height: '4px', 
                                            bgcolor: '#e2e8f0', 
                                            borderRadius: '2px',
                                            overflow: 'hidden'
                                        }}>
                                            <Box sx={{ 
                                                width: `${(passwordStrength.score / 4) * 100}%`, 
                                                height: '100%', 
                                                bgcolor: passwordStrength.color,
                                                transition: 'width 0.3s ease'
                                            }} />
                                        </Box>
                                        <Chip 
                                            label={passwordStrength.message} 
                                            size="small"
                                            sx={{ 
                                                bgcolor: `${passwordStrength.color}20`, 
                                                color: passwordStrength.color,
                                                fontWeight: 600,
                                                fontSize: '0.7rem'
                                            }}
                                        />
                                    </Stack>
                                    <Typography variant="caption" sx={{ color: colors.textLight, display: 'block', mt: 0.5 }}>
                                        {passwordStrength.score === 4 && "✅ Excellent ! Ce mot de passe est très sécurisé."}
                                        {passwordStrength.score === 3 && "⚠️ Bon, mais vous pouvez l'améliorer."}
                                        {passwordStrength.score <= 2 && passwordData.newPassword && "❌ Ce mot de passe est trop faible. Ajoutez plus de variété."}
                                    </Typography>
                                </Box>
                            </Fade>
                        )}
                    </Box>
                    
                    <TextField
                        fullWidth
                        type={showConfirmPassword ? 'text' : 'password'}
                        label="Confirmer le nouveau mot de passe"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                        size={mobile ? "small" : "medium"}
                        error={passwordMatch === false}
                        helperText={passwordMatch === false ? "Les mots de passe ne correspondent pas" : ""}
                        InputProps={{ 
                            startAdornment: <Lock sx={{ mr: 1, color: colors.textLight }} />,
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
                                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                    {passwordMatch === true && (
                                        <CheckCircle sx={{ ml: 1, color: colors.accent }} />
                                    )}
                                </InputAdornment>
                            )
                        }}
                    />
                    
                    <Button 
                        variant="contained" 
                        onClick={handleChangePassword}
                        fullWidth={mobile}
                        disabled={!passwordData.oldPassword || !passwordData.newPassword || !passwordData.confirmPassword || passwordMatch === false}
                        sx={{ 
                            bgcolor: colors.primary, 
                            py: { xs: 1, sm: 1.5 },
                            mt: 2,
                            borderRadius: '12px',
                            textTransform: 'none',
                            fontWeight: 600,
                            '&:hover': { bgcolor: colors.primary, opacity: 0.9 },
                            '&.Mui-disabled': { bgcolor: '#cbd5e1' }
                        }}
                    >
                        Changer le mot de passe
                    </Button>
                </Stack>

                {/* Conseils de sécurité */}
                <Alert 
                    severity="warning" 
                    sx={{ 
                        mt: 4, 
                        borderRadius: '12px',
                        bgcolor: '#fefce8',
                        '& .MuiAlert-icon': { color: '#eab308' }
                    }}
                    icon={<Info />}
                >
                    <Typography variant="caption">
                        <strong>Conseils de sécurité :</strong> N'utilisez pas le même mot de passe sur plusieurs sites. 
                        Évitez les informations personnelles comme votre nom ou date de naissance.
                    </Typography>
                </Alert>
            </MotionPaper>
        </Box>
    );
};

export default SecurityView;