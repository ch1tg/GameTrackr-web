import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container,
    Typography,
    Box,
    CircularProgress,
    Chip,
    Stack,
    Button,
    IconButton
} from '@mui/material';
import { getGameDetails, type GameDetail } from '../api/game.service';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import StarIcon from '@mui/icons-material/Star';
import { useAuth } from '../context/AuthContext';

export default function GameDetailPage() {
    const { gameId } = useParams<{ gameId: string }>();
    const navigate = useNavigate();
    const { user, wishlist, toggleWishlist, isWishlistLoading } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [game, setGame] = useState<GameDetail | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!gameId) {
            setError('Game ID is missing');
            setIsLoading(false);
            return;
        }

        const fetchGame = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const data = await getGameDetails(gameId);
                setGame(data);
            } catch (err: any) {
                setError(err.message || 'Failed to load game data.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchGame();
    }, [gameId]);

    const handleToggleWishlist = async () => {
        if (!game || isSubmitting || isWishlistLoading) return;

        setIsSubmitting(true);
        try {
            await toggleWishlist(game.id);
        } catch (error) {
            console.error("GameDetailPage: Failed to toggle wishlist", error);
        } finally {
            setIsSubmitting(false);
        }
    };


    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                <CircularProgress size={60} />
            </Box>
        );
    }

    if (error) {
        return (
            <Container maxWidth="md" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
                <Typography variant="h5" color="error">{error}</Typography>
                <Button variant="contained" onClick={() => navigate('/')} sx={{ mt: 2 }}>
                    To the Main Page
                </Button>
            </Container>
        );
    }

    if (!game) {
        return null;
    }
    const isInWishlist = wishlist.has(game.id);
    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate(-1)} // -1 = "назад" в истории браузера
                sx={{ mb: 2 }}
            >
                Back
            </Button>

            <Box
                sx={{
                    height: 400,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundImage: `
            linear-gradient(to top, rgba(18, 18, 18, 1) 0%, rgba(18, 18, 18, 0.4) 100%), 
            url(${game.background_image})
          `,
                    borderRadius: 2,
                    padding: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                }}
            >
                <Typography variant="h2" component="h1" fontWeight="bold">
                    {game.name}
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 2 }} alignItems="center">
                    {game.metacritic && (
                        <Chip label={`Metacritic: ${game.metacritic}`} color="success" sx={{ fontWeight: 'bold' }} />
                    )}
                    {game.released && (
                        <Chip label={`Released: ${new Date(game.released).toLocaleDateString()}`} />
                    )}
                    {user && (
                        <IconButton
                            aria-label="add to wishlist"
                            onClick={handleToggleWishlist}
                            disabled={isWishlistLoading || isSubmitting}
                            size="large"
                            sx={{
                                color: 'gold',
                                '&:hover': { backgroundColor: 'rgba(255, 215, 0, 0.1)' }
                            }}
                        >
                            {isInWishlist ? (
                                <StarIcon fontSize="inherit" />
                            ) : (
                                <StarBorderIcon fontSize="inherit" />
                            )}
                        </IconButton>
                    )}
                </Stack>
            </Box>


            <Box sx={{ mt: 4 }}>
                <Typography variant="h4" gutterBottom>About</Typography>

                <Typography
                    variant="body1"
                    component="div"
                    sx={{ lineHeight: 1.7 }}
                    dangerouslySetInnerHTML={{ __html: game.description }}
                />

                <Stack spacing={3} sx={{ mt: 4 }}>
                    <Box>
                        <Typography variant="h6" gutterBottom>Genres</Typography>
                        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                            {game.genres.map(genre => <Chip key={genre} label={genre} variant="outlined" />)}
                        </Stack>
                    </Box>
                    <Box>
                        <Typography variant="h6" gutterBottom>Platforms</Typography>
                        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                            {game.platforms.map(platform => <Chip key={platform} label={platform} variant="outlined" />)}
                        </Stack>
                    </Box>
                    {game.website && (
                        <Button
                            variant="outlined"
                            href={game.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{ alignSelf: 'flex-start' }}
                        >
                            Visit Website
                        </Button>
                    )}
                </Stack>
            </Box>
        </Container>
    );
}