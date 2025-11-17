import { Link as RouterLink } from 'react-router-dom';
import {
    Box,
    Paper,
    CircularProgress,
    Typography,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Divider
} from '@mui/material';
import type {SearchAllResponse} from '../api/search.service';

interface SearchPreviewProps {
    isLoading: boolean;
    results: SearchAllResponse | null;
    onClose: () => void;
}

export default function SearchPreview({ isLoading, results, onClose }: SearchPreviewProps) {

    const renderContent = () => {
        if (isLoading) {
            return (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                    <CircularProgress size={24} />
                </Box>
            );
        }

        if (!results || (results.users.length === 0 && results.games.length === 0)) {
            return (
                <Typography sx={{ p: 2, color: 'text.secondary' }}>
                    No results found.
                </Typography>
            );
        }

        return (
            <List dense>
                {results.users.length > 0 && (
                    <>
                        <ListItem disablePadding>
                            <Typography variant="caption" sx={{ pl: 2, pt: 1, color: 'text.secondary', fontWeight: 'bold' }}>
                                USERS
                            </Typography>
                        </ListItem>
                        {results.users.map((user) => (
                            <ListItemButton
                                key={user.username}
                                // Используем Link из react-router-dom для навигации
                                component={RouterLink}
                                to={`/users/${user.username}`}
                                onClick={onClose} // Закрываем при клике
                            >
                                <ListItemText primary={user.username} />
                            </ListItemButton>
                        ))}
                    </>
                )}

                {results.users.length > 0 && results.games.length > 0 && (
                    <Divider sx={{ my: 1 }} />
                )}

                {results.games.length > 0 && (
                    <>
                        <ListItem disablePadding>
                            <Typography variant="caption" sx={{ pl: 2, pt: 1, color: 'text.secondary', fontWeight: 'bold' }}>
                                GAMES
                            </Typography>
                        </ListItem>
                        {results.games.map((game) => (
                            <ListItemButton
                                key={game.id}
                                component={RouterLink}
                                to={`/games/${game.id}`}
                                onClick={onClose} // Закрываем при клике
                            >
                                <ListItemText primary={game.name} />
                            </ListItemButton>
                        ))}
                    </>
                )}
            </List>
        );
    };

    return (
        <Paper
            elevation={4}
            sx={{
                position: 'absolute',
                top: '110%',
                left: 0,
                right: 0,
                zIndex: 1101,
                maxHeight: '400px',
                overflowY: 'auto'
            }}
        >
            {renderContent()}
        </Paper>
    );
}