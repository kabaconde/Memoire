// frontend/src/components/Simples/SignaturesView.jsx
import React, { useState, useEffect } from 'react';
import { 
    Box, Typography, Button, Stack, IconButton, useMediaQuery, 
    Fade, Paper, alpha, Collapse, Chip, LinearProgress
} from '@mui/material';
import { 
    Description, Close, ArrowForward, CloudUpload, 
    InsertDriveFile, CheckCircle, ExpandMore, ExpandLess, 
    Security, AutoAwesome
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import ResumeDocument from '../IA/ResumeDocument';
import DetecteurFalsification from '../IA/DetecteurFalsification';

const MotionBox = motion(Box);
const MotionPaper = motion(Paper);

const SignaturesView = ({ 
    getRootProps, 
    getInputProps, 
    isDragActive, 
    open, 
    uploadedFiles, 
    removeFile, 
    nextStep,
    isMobile = false,
    isTablet = false
}) => {
    const isSmallScreen = useMediaQuery('(max-width:600px)');
    const mobile = isMobile || isSmallScreen;
    
    const [contenuDocument, setContenuDocument] = useState('');
    const [nomDocument, setNomDocument] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [showWelcome, setShowWelcome] = useState(true);
    const [resumeExpanded, setResumeExpanded] = useState(false);
    const [falsificationExpanded, setFalsificationExpanded] = useState(false);
    
    // Masquer le message de bienvenue après 3 secondes
    useEffect(() => {
        const timer = setTimeout(() => {
            setShowWelcome(false);
        }, 3000);
        return () => clearTimeout(timer);
    }, []);
    
    // Extraire le texte du fichier uploadé
    const extraireTexteFichier = async (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                if (file.type === 'text/plain') {
                    resolve(e.target.result);
                } else {
                    const texte = e.target.result;
                    if (typeof texte === 'string') {
                        resolve(texte.substring(0, 8000));
                    } else {
                        const bytes = new Uint8Array(e.target.result);
                        let texteLisible = '';
                        for (let i = 0; i < Math.min(bytes.length, 8000); i++) {
                            if (bytes[i] >= 32 && bytes[i] <= 126) {
                                texteLisible += String.fromCharCode(bytes[i]);
                            }
                        }
                        resolve(texteLisible);
                    }
                }
            };
            reader.onerror = () => resolve('');
            if (file.type === 'application/pdf') {
                reader.readAsBinaryString(file);
            } else {
                reader.readAsText(file);
            }
        });
    };
    
    // Quand un fichier est uploadé, extraire son texte
    const handleFileChange = async (files) => {
        if (files && files.length > 0) {
            setIsUploading(true);
            const file = files[0];
            setNomDocument(file.name);
            const texte = await extraireTexteFichier(file);
            setContenuDocument(texte);
            setIsUploading(false);
        }
    };
    
    // Modifier le comportement du dropzone pour capturer les fichiers
    const originalOnDrop = getRootProps().onDrop;
    const customOnDrop = async (acceptedFiles) => {
        if (originalOnDrop) originalOnDrop(acceptedFiles);
        if (acceptedFiles && acceptedFiles.length > 0) {
            await handleFileChange(acceptedFiles);
        }
    };
    
    const getFileIcon = (fileName) => {
        const ext = fileName?.split('.').pop()?.toLowerCase();
        if (ext === 'pdf') return '📄';
        if (ext === 'doc' || ext === 'docx') return '📝';
        return '📎';
    };

    const collapsibleHeaderStyles = {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        cursor: 'pointer',
        padding: mobile ? '6px 12px' : '8px 16px',
        backgroundColor: '#f5f5f5',
        borderRadius: '8px',
        border: '1px solid #e0e0e0',
        marginBottom: (resumeExpanded || falsificationExpanded) ? '8px' : '0'
    };

    const collapsibleTitleStyles = {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: mobile ? '13px' : '14px',
        fontWeight: '500',
        color: '#333'
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
        <Box sx={{ maxWidth: '1200px', mx: 'auto', width: '100%' }}>
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
                            <Description sx={{ fontSize: { xs: 20, sm: 28 }, color: colors.secondary }} />
                            <Typography variant={mobile ? "caption" : "body2"} sx={{ fontWeight: 600, letterSpacing: '0.5px' }}>
                                ✨ Nouvelle transaction - Sélectionnez vos documents ✨
                            </Typography>
                        </Paper>
                    </MotionBox>
                )}
            </AnimatePresence>

            <Paper elevation={0} sx={{ 
                bgcolor: '#fff', 
                borderRadius: { xs: '16px', sm: '24px' }, 
                minHeight: { xs: 'auto', sm: '80vh' }, 
                p: { xs: 2, sm: 3, md: 4 }, 
                display: 'flex', 
                flexDirection: 'column' 
            }}>
                <Typography 
                    variant={mobile ? "h5" : "h4"} 
                    align="center" 
                    fontWeight="800" 
                    sx={{ 
                        color: colors.primary, 
                        mb: { xs: 3, sm: 5 },
                        position: 'relative',
                        '&:after': {
                            content: '""',
                            position: 'absolute',
                            bottom: -10,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: 60,
                            height: 4,
                            bgcolor: colors.secondary,
                            borderRadius: 2
                        }
                    }}
                >
                    📄 Nouvelle transaction
                </Typography>

                {/* Zone de drop */}
                <MotionBox
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Box 
                        {...getRootProps({
                            onClick: (e) => { e.stopPropagation(); open(); },
                            onDrop: customOnDrop
                        })} 
                        sx={{ 
                            border: `2px dashed ${isDragActive ? colors.secondary : colors.border}`,
                            borderRadius: { xs: '16px', sm: '24px' },
                            p: { xs: 4, sm: 6, md: 8 }, 
                            textAlign: 'center',
                            bgcolor: isDragActive ? alpha(colors.secondary, 0.05) : alpha(colors.background, 0.8),
                            cursor: 'pointer',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            '&:hover': { 
                                borderColor: colors.secondary,
                                bgcolor: alpha(colors.secondary, 0.08),
                                transform: 'scale(1.01)'
                            }
                        }}
                    >
                        <input {...getInputProps()} />
                        <Box sx={{ 
                            width: { xs: 70, sm: 90 }, 
                            height: { xs: 70, sm: 90 }, 
                            mx: 'auto',
                            mb: 3,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '50%',
                            background: isDragActive ? `linear-gradient(135deg, ${colors.secondary}20, ${colors.secondary}10)` : `linear-gradient(135deg, ${colors.primary}10, ${colors.primary}05)`,
                            transition: 'all 0.3s ease'
                        }}>
                            {isDragActive ? (
                                <CloudUpload sx={{ fontSize: { xs: 40, sm: 50 }, color: colors.secondary, animation: 'pulse 1s infinite' }} />
                            ) : (
                                <Description sx={{ fontSize: { xs: 40, sm: 50 }, color: colors.primary, opacity: 0.7 }} />
                            )}
                        </Box>
                        <Typography 
                            variant={mobile ? "h6" : "h5"} 
                            sx={{ 
                                fontWeight: 700, 
                                color: isDragActive ? colors.secondary : colors.primary,
                                mb: 1
                            }}
                        >
                            {isDragActive ? "Déposez vos fichiers ici !" : "Glissez-déposez vos fichiers"}
                        </Typography>
                        <Typography variant="body2" sx={{ color: colors.textLight, mb: 2 }}>
                            ou cliquez pour parcourir
                        </Typography>
                        <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 2 }}>
                            <Chip label="PDF" size="small" sx={{ bgcolor: '#fff', border: `1px solid ${colors.border}` }} />
                            <Chip label="DOC" size="small" sx={{ bgcolor: '#fff', border: `1px solid ${colors.border}` }} />
                            <Chip label="DOCX" size="small" sx={{ bgcolor: '#fff', border: `1px solid ${colors.border}` }} />
                        </Stack>
                    </Box>
                </MotionBox>

                {/* Progression upload */}
                {isUploading && (
                    <Box sx={{ mt: 3, px: 2 }}>
                        <LinearProgress 
                            sx={{ 
                                height: 4, 
                                borderRadius: 2,
                                bgcolor: colors.border,
                                '& .MuiLinearProgress-bar': { bgcolor: colors.secondary }
                            }} 
                        />
                        <Typography variant="caption" sx={{ color: colors.textLight, mt: 1, display: 'block' }}>
                            Analyse du document en cours...
                        </Typography>
                    </Box>
                )}

                {/* RÉSUMÉ IA - VERSION REPLIABLE */}
                {uploadedFiles.length > 0 && nomDocument && !isUploading && (
                    <Fade in={true} timeout={500}>
                        <Box sx={{ mt: 4, mb: 2 }}>
                            <Paper elevation={0} sx={{ borderRadius: '8px', overflow: 'hidden' }}>
                                <div style={collapsibleHeaderStyles} onClick={() => setResumeExpanded(!resumeExpanded)}>
                                    <div style={collapsibleTitleStyles}>
                                        <AutoAwesome sx={{ fontSize: mobile ? 18 : 20, color: colors.secondary }} />
                                        <span>📋 Résumé intelligent du document</span>
                                    </div>
                                    <IconButton size="small">
                                        {resumeExpanded ? <ExpandLess /> : <ExpandMore />}
                                    </IconButton>
                                </div>
                                <Collapse in={resumeExpanded}>
                                    <Box sx={{ p: 1 }}>
                                        <ResumeDocument 
                                            contenu={contenuDocument}
                                            nomFichier={nomDocument}
                                            onResumeGenere={(resume) => console.log('Résumé généré', resume)}
                                        />
                                    </Box>
                                </Collapse>
                            </Paper>
                        </Box>
                    </Fade>
                )}

                {/* DÉTECTEUR DE FALSIFICATION - VERSION REPLIABLE */}
                {uploadedFiles.length > 0 && !isUploading && (
                    <Fade in={true} timeout={500}>
                        <Box sx={{ mt: 2, mb: 2 }}>
                            <Paper elevation={0} sx={{ borderRadius: '8px', overflow: 'hidden' }}>
                                <div style={collapsibleHeaderStyles} onClick={() => setFalsificationExpanded(!falsificationExpanded)}>
                                    <div style={collapsibleTitleStyles}>
                                        <Security sx={{ fontSize: mobile ? 18 : 20, color: '#ff9800' }} />
                                        <span>🔒 Analyse d'intégrité du document</span>
                                    </div>
                                    <IconButton size="small">
                                        {falsificationExpanded ? <ExpandLess /> : <ExpandMore />}
                                    </IconButton>
                                </div>
                                <Collapse in={falsificationExpanded}>
                                    <Box sx={{ p: 1 }}>
                                        <DetecteurFalsification 
                                            fichier={uploadedFiles[0]}
                                            onAnalyseComplete={(resultat) => {
                                                console.log('🔍 Analyse falsification terminée:', resultat);
                                            }}
                                        />
                                    </Box>
                                </Collapse>
                            </Paper>
                        </Box>
                    </Fade>
                )}
                
                {uploadedFiles.length > 0 ? (
                    <MotionPaper
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        elevation={0}
                        sx={{ 
                            mt: 3,
                            p: { xs: 2, sm: 3 }, 
                            bgcolor: '#ffffff', 
                            borderRadius: '20px', 
                            border: `1px solid ${colors.border}`, 
                            boxShadow: '0px 10px 25px -5px rgba(0,0,0,0.05)' 
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <CheckCircle sx={{ color: colors.accent, fontSize: 20 }} />
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: colors.primary }}>
                                Document(s) sélectionné(s) ({uploadedFiles.length})
                            </Typography>
                        </Box>
                        <Stack spacing={1.5} sx={{ mb: 3 }}>
                            {uploadedFiles.map((file, index) => (
                                <MotionBox
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    sx={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'space-between', 
                                        p: 1.5, 
                                        bgcolor: colors.background, 
                                        borderRadius: '12px', 
                                        border: `1px solid ${colors.border}`,
                                        '&:hover': { bgcolor: alpha(colors.secondary, 0.05) }
                                    }}
                                >
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <Box sx={{ fontSize: 28 }}>{getFileIcon(file.name)}</Box>
                                        <Box>
                                            <Typography variant="body2" fontWeight="600" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, color: colors.primary }}>
                                                {file.name.length > (mobile ? 30 : 50) ? file.name.substring(0, mobile ? 30 : 50) + '...' : file.name}
                                            </Typography>
                                            <Typography variant="caption" color="textSecondary">{(file.size / 1024).toFixed(2)} Ko</Typography>
                                        </Box>
                                    </Stack>
                                    <IconButton 
                                        size="small" 
                                        onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                                        sx={{ '&:hover': { bgcolor: '#fee2e2', color: '#ef4444' } }}
                                    >
                                        <Close fontSize="small" />
                                    </IconButton>
                                </MotionBox>
                            ))}
                        </Stack>
                        <Button 
                            variant="contained" 
                            fullWidth 
                            onClick={nextStep} 
                            sx={{ 
                                py: { xs: 1.2, sm: 1.5 }, 
                                bgcolor: colors.secondary, 
                                color: colors.primary, 
                                fontWeight: 'bold', 
                                borderRadius: '50px',
                                '&:hover': { bgcolor: '#e6af06', transform: 'scale(1.02)', transition: 'transform 0.2s' }
                            }}
                            endIcon={<ArrowForward />}
                        >
                            Continuer
                        </Button>
                    </MotionPaper>
                ) : (
                    <Fade in={true} timeout={800}>
                        <Box sx={{ 
                            textAlign: 'center', 
                            mt: 4, 
                            p: 3, 
                            bgcolor: colors.background, 
                            borderRadius: '16px',
                            border: `1px dashed ${colors.border}`
                        }}>
                            <Typography variant="body2" sx={{ color: colors.textLight }}>
                                💡 <strong>Plusieurs documents</strong> peuvent être signés dans une même transaction
                            </Typography>
                            <Typography variant="caption" sx={{ color: colors.textLight, mt: 1, display: 'block' }}>
                                Formats supportés : PDF, DOC, DOCX | Taille max : 10MB
                            </Typography>
                        </Box>
                    </Fade>
                )}
            </Paper>

            <style>
                {`
                    @keyframes pulse {
                        0%, 100% { transform: scale(1); opacity: 1; }
                        50% { transform: scale(1.1); opacity: 0.8; }
                    }
                `}
            </style>
        </Box>
    );
};

export default SignaturesView;