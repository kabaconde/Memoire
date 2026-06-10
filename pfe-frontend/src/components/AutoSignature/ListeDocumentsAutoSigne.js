import React, { useState, useEffect } from 'react';
import { Download, Delete, PictureAsPdf, Description, CalendarToday, CheckCircle, Refresh, Visibility } from '@mui/icons-material';
import axios from 'axios';
import { 
  Box, Button, Typography, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Stack, useMediaQuery, 
  Card, CardContent, Grid, Chip, IconButton, Tooltip, 
  Fade, Badge, Avatar, Divider, alpha,
  Pagination, Skeleton, Alert
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';

const MotionBox = motion(Box);
const MotionCard = motion(Card);
const CalendarTodayIcon = CalendarToday;

const ListeDocumentsAutoSignes = ({ setSnackbar, isMobile = false }) => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState({});
    const [deleting, setDeleting] = useState({});
    const [page, setPage] = useState(1);
    const [itemsPerPage] = useState(6);
    const [showWelcome, setShowWelcome] = useState(true);

    const API_BASE_URL = 'https://memoireback.onrender.com/api/documents';
    const isSmallScreen = useMediaQuery('(max-width:600px)');
    const isTablet = useMediaQuery('(max-width:960px)');
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

    const fetchDocuments = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
            const res = await axios.get(`${API_BASE_URL}/liste-signes-auto`, {
                headers: {
                    'Authorization': token ? `Bearer ${token}` : ''
                }
            });
            setDocuments(res.data);
        } catch (e) {
            console.error("Erreur:", e);
            setSnackbar({ open: true, message: "Erreur lors du chargement", severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchDocuments(); }, []);

    const handleDelete = async (id) => {
        if (window.confirm("⚠️ Supprimer définitivement ce document ? Cette action est irréversible.")) {
            setDeleting(prev => ({ ...prev, [id]: true }));
            try {
                const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
                await axios.delete(`${API_BASE_URL}/supprimer/${id}`, {
                    headers: {
                        'Authorization': token ? `Bearer ${token}` : ''
                    }
                });
                setSnackbar({ open: true, message: "🗑️ Document supprimé avec succès", severity: 'info' });
                fetchDocuments();
            } catch (e) {
                setSnackbar({ open: true, message: "❌ Erreur lors de la suppression", severity: 'error' });
            } finally {
                setDeleting(prev => ({ ...prev, [id]: false }));
            }
        }
    };

    const handleDownload = async (id, nom) => {
        setDownloading(prev => ({ ...prev, [id]: true }));
        try {
            const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
            const response = await axios.get(`${API_BASE_URL}/download/${id}`, { 
                responseType: 'blob',
                headers: {
                    'Authorization': token ? `Bearer ${token}` : ''
                }
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            const nomFichier = nom.endsWith('.pdf') ? nom : `${nom}.pdf`;
            link.setAttribute('download', nomFichier);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            setSnackbar({ open: true, message: "✅ Téléchargement réussi", severity: 'success' });
        } catch (e) {
            setSnackbar({ open: true, message: "❌ Erreur lors du téléchargement", severity: 'error' });
        } finally {
            setDownloading(prev => ({ ...prev, [id]: false }));
        }
    };

    const truncateFileName = (fileName, maxLength) => {
        if (!fileName) return 'Document PDF';
        if (fileName.length <= maxLength) return fileName;
        const extension = fileName.split('.').pop();
        const nameWithoutExt = fileName.slice(0, fileName.lastIndexOf('.'));
        const truncatedName = nameWithoutExt.slice(0, maxLength - extension.length - 3) + '...';
        return `${truncatedName}.${extension}`;
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Date inconnue';
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const stats = {
        total: documents.length
    };

    // Pagination
    const indexOfLastItem = page * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = documents.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(documents.length / itemsPerPage);

    // Styles
    const colors = {
        primary: '#0b1e39',
        secondary: '#ffc107',
        accent: '#10b981',
        background: '#f8fafc',
        border: '#e2e8f0',
        text: '#1e293b',
        textLight: '#64748b'
    };

    // Version Mobile - Cartes
    if (mobile) {
        return (
            <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: '1200px', mx: 'auto' }}>
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
                                    📄 Vos documents auto-signés sont disponibles ici 📄
                                </Typography>
                            </Paper>
                        </MotionBox>
                    )}
                </AnimatePresence>

                {/* En-tête */}
                <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                    <Typography variant="h6" fontWeight="800" sx={{ color: colors.primary, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Description sx={{ color: colors.primary }} />
                        Mes Documents Signés
                        <Badge badgeContent={stats.total} color="primary" sx={{ '& .MuiBadge-badge': { fontWeight: 600 } }} />
                    </Typography>
                    <Stack direction="row" spacing={1}>
                        <IconButton size="small" onClick={fetchDocuments} disabled={loading}>
                            <Refresh fontSize="small" />
                        </IconButton>
                        <Chip size="small" label={`📄 ${stats.total} document(s)`} variant="outlined" />
                    </Stack>
                </Box>

                {loading ? (
                    <Stack spacing={2}>
                        {[1, 2, 3].map((i) => (
                            <Skeleton key={i} variant="rounded" height={120} sx={{ borderRadius: 3 }} />
                        ))}
                    </Stack>
                ) : documents.length === 0 ? (
                    <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3, bgcolor: colors.background }}>
                        <Description sx={{ fontSize: 60, color: colors.textLight, mb: 2, opacity: 0.5 }} />
                        <Typography variant="body1" color="textSecondary">📭 Aucun document signé trouvé.</Typography>
                        <Typography variant="caption" color="textSecondary">Utilisez l'auto-signature pour signer vos premiers documents</Typography>
                    </Paper>
                ) : (
                    <Stack spacing={2}>
                        {currentItems.map((doc, index) => {
                            const maxLength = 35;
                            const displayName = truncateFileName(doc.nomFichier, maxLength);
                            const isDownloading = downloading[doc.id];
                            const isDeleting = deleting[doc.id];

                            return (
                                <MotionCard
                                    key={doc.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    sx={{ 
                                        borderRadius: 3, 
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                                        transition: 'transform 0.2s, box-shadow 0.2s',
                                        '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }
                                    }}
                                >
                                    <CardContent sx={{ p: 2.5 }}>
                                        <Stack spacing={1.5}>
                                            <Stack direction="row" spacing={1.5} alignItems="center">
                                                <Avatar sx={{ bgcolor: '#ffebee', width: 44, height: 44 }}>
                                                    <PictureAsPdf sx={{ color: '#d32f2f' }} />
                                                </Avatar>
                                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                                    <Tooltip title={doc.nomFichier} placement="top" arrow>
                                                        <Typography variant="subtitle2" fontWeight="700" sx={{ wordBreak: 'break-word' }}>
                                                            {displayName}
                                                        </Typography>
                                                    </Tooltip>
                                                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5, flexWrap: 'wrap' }}>
                                                        <Stack direction="row" spacing={0.5} alignItems="center">
                                                            <CalendarTodayIcon sx={{ fontSize: 12, color: colors.textLight }} />
                                                            <Typography variant="caption" color="textSecondary">
                                                                {doc.dateCreation ? new Date(doc.dateCreation).toLocaleDateString('fr-FR') : 'N/A'}
                                                            </Typography>
                                                        </Stack>
                                                        <Chip 
                                                            icon={<CheckCircle sx={{ fontSize: 14 }} />}
                                                            label="Signé" 
                                                            size="small" 
                                                            color="success"
                                                            sx={{ fontWeight: 600, borderRadius: 2 }}
                                                        />
                                                    </Stack>
                                                </Box>
                                            </Stack>

                                            <Divider />

                                            <Stack direction="row" spacing={1}>
                                                <Button 
                                                    size="small" 
                                                    variant="contained" 
                                                    startIcon={<Download />} 
                                                    onClick={() => handleDownload(doc.id, doc.nomFichier)} 
                                                    disabled={isDownloading}
                                                    fullWidth
                                                    sx={{ 
                                                        bgcolor: '#1976d2', 
                                                        borderRadius: 2,
                                                        textTransform: 'none',
                                                        '&:hover': { bgcolor: '#1565c0' }
                                                    }}
                                                >
                                                    {isDownloading ? "Téléchargement..." : "Télécharger"}
                                                </Button>
                                                <Button 
                                                    size="small" 
                                                    variant="outlined" 
                                                    color="error" 
                                                    startIcon={<Delete />} 
                                                    onClick={() => handleDelete(doc.id)}
                                                    disabled={isDeleting}
                                                    fullWidth
                                                    sx={{ borderRadius: 2, textTransform: 'none' }}
                                                >
                                                    {isDeleting ? "Suppression..." : "Supprimer"}
                                                </Button>
                                            </Stack>
                                        </Stack>
                                    </CardContent>
                                </MotionCard>
                            );
                        })}
                    </Stack>
                )}

                {/* Pagination */}
                {!loading && documents.length > 0 && totalPages > 1 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                        <Pagination 
                            count={totalPages} 
                            page={page} 
                            onChange={(e, value) => setPage(value)} 
                            color="primary" 
                            size="small"
                        />
                    </Box>
                )}
            </Box>
        );
    }

    // Version Tablette et Desktop - Grille
    const getGridColumns = () => {
        if (isTablet) return 2;
        return 3;
    };

    return (
        <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: '1400px', mx: 'auto' }}>
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
                                ✨ Bienvenue dans l'espace documents auto-signés ✨
                            </Typography>
                        </Paper>
                    </MotionBox>
                )}
            </AnimatePresence>

            {/* En-tête avec statistiques */}
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                <Typography variant="h5" fontWeight="800" sx={{ color: colors.primary, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Description sx={{ color: colors.primary }} />
                    Mes Documents Signés
                    <Badge badgeContent={stats.total} color="primary" sx={{ '& .MuiBadge-badge': { fontWeight: 600 } }} />
                </Typography>
                
                <Stack direction="row" spacing={1}>
                    <IconButton onClick={fetchDocuments} disabled={loading} size="small">
                        <Refresh />
                    </IconButton>
                    <Chip size="small" label={`📄 ${stats.total} document(s)`} variant="outlined" />
                    <Chip size="small" label="✅ Auto-signature" sx={{ bgcolor: '#e8f5e9', color: '#2e7d32' }} />
                </Stack>
            </Box>

            {loading ? (
                <Grid container spacing={3}>
                    {[1, 2, 3].map((i) => (
                        <Grid item xs={12} sm={6} md={4} key={i}>
                            <Skeleton variant="rounded" height={220} sx={{ borderRadius: 3 }} />
                        </Grid>
                    ))}
                </Grid>
            ) : documents.length === 0 ? (
                <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3, bgcolor: colors.background }}>
                    <Description sx={{ fontSize: 80, color: colors.textLight, mb: 2, opacity: 0.5 }} />
                    <Typography variant="h6" color="textSecondary">📭 Aucun document signé trouvé.</Typography>
                    <Typography variant="caption" color="textSecondary">Utilisez l'auto-signature pour signer vos premiers documents</Typography>
                </Paper>
            ) : (
                <>
                    <Grid container spacing={3}>
                        {currentItems.map((doc, index) => {
                            const maxLength = isTablet ? 35 : 45;
                            const displayName = truncateFileName(doc.nomFichier, maxLength);
                            const isDownloading = downloading[doc.id];
                            const isDeleting = deleting[doc.id];

                            return (
                                <Grid item xs={12} sm={6} md={4} key={doc.id}>
                                    <MotionCard
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        sx={{ 
                                            height: '100%',
                                            borderRadius: 3, 
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                                            transition: 'transform 0.2s, box-shadow 0.2s',
                                            '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 24px rgba(0,0,0,0.12)' },
                                            display: 'flex',
                                            flexDirection: 'column'
                                        }}
                                    >
                                        <CardContent sx={{ p: 3, flex: 1 }}>
                                            {/* En-tête */}
                                            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
                                                <Avatar sx={{ bgcolor: '#ffebee', width: 48, height: 48 }}>
                                                    <PictureAsPdf sx={{ color: '#d32f2f', fontSize: 28 }} />
                                                </Avatar>
                                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                                    <Tooltip title={doc.nomFichier} placement="top" arrow>
                                                        <Typography variant="subtitle1" fontWeight="700" sx={{ 
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            whiteSpace: 'nowrap'
                                                        }}>
                                                            {displayName}
                                                        </Typography>
                                                    </Tooltip>
                                                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                                                        <CalendarTodayIcon sx={{ fontSize: 12, color: colors.textLight }} />
                                                        <Typography variant="caption" color="textSecondary">
                                                            {doc.dateCreation ? new Date(doc.dateCreation).toLocaleDateString('fr-FR') : 'N/A'}
                                                        </Typography>
                                                    </Stack>
                                                </Box>
                                                <Chip 
                                                    icon={<CheckCircle sx={{ fontSize: 14 }} />}
                                                    label="Signé" 
                                                    size="small" 
                                                    color="success"
                                                    sx={{ fontWeight: 600, borderRadius: 2, flexShrink: 0 }}
                                                />
                                            </Stack>

                                            <Divider sx={{ my: 2 }} />

                                            {/* Informations supplémentaires */}
                                            <Box sx={{ mb: 2 }}>
                                                <Typography variant="caption" color="textSecondary" display="block" gutterBottom>
                                                    📌 ID: {doc.id}
                                                </Typography>
                                                <Typography variant="caption" color="textSecondary" display="block">
                                                    🔐 Type: Auto-signature HSM/Local
                                                </Typography>
                                                {doc.dateHorodatage && (
                                                    <Typography variant="caption" color="textSecondary" display="block">
                                                        ⏱️ Signé le: {formatDate(doc.dateHorodatage)}
                                                    </Typography>
                                                )}
                                            </Box>

                                            {/* Actions */}
                                            <Stack direction="row" spacing={1} sx={{ mt: 'auto' }}>
                                                <Button 
                                                    size="small" 
                                                    variant="contained"
                                                    startIcon={<Download />} 
                                                    onClick={() => handleDownload(doc.id, doc.nomFichier)} 
                                                    disabled={isDownloading}
                                                    fullWidth
                                                    sx={{ 
                                                        bgcolor: '#1976d2', 
                                                        borderRadius: 2,
                                                        textTransform: 'none',
                                                        '&:hover': { bgcolor: '#1565c0' }
                                                    }}
                                                >
                                                    {isDownloading ? "Téléchargement..." : "Télécharger"}
                                                </Button>
                                                <Button 
                                                    size="small" 
                                                    variant="outlined" 
                                                    color="error" 
                                                    startIcon={<Delete />} 
                                                    onClick={() => handleDelete(doc.id)}
                                                    disabled={isDeleting}
                                                    fullWidth
                                                    sx={{ borderRadius: 2, textTransform: 'none' }}
                                                >
                                                    {isDeleting ? "Suppression..." : "Supprimer"}
                                                </Button>
                                            </Stack>
                                        </CardContent>
                                    </MotionCard>
                                </Grid>
                            );
                        })}
                    </Grid>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                            <Pagination 
                                count={totalPages} 
                                page={page} 
                                onChange={(e, value) => setPage(value)} 
                                color="primary" 
                                size={isTablet ? "medium" : "large"}
                            />
                        </Box>
                    )}
                </>
            )}

            {/* Légende */}
            {documents.length > 0 && (
                <Paper 
                    elevation={0} 
                    sx={{ 
                        mt: 4, 
                        p: 2.5, 
                        bgcolor: colors.background, 
                        borderRadius: 3, 
                        border: `1px solid ${colors.border}`
                    }}
                >
                    <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                        <Typography variant="caption" sx={{ fontWeight: 700, color: colors.primary }}>
                            📋 Informations :
                        </Typography>
                        <Chip size="small" label="🔐 Auto-signature avec HSM" variant="outlined" />
                        <Chip size="small" label="✅ Document signé électroniquement" variant="outlined" />
                        <Chip size="small" label="📄 Format PDF certifié" variant="outlined" />
                        <Chip size="small" label="🛡️ Conformité eIDAS" variant="outlined" />
                    </Stack>
                </Paper>
            )}
        </Box>
    );
};

export default ListeDocumentsAutoSignes;