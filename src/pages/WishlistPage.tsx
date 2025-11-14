import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom'; // <-- 1. 'navigate' УДАЛЕН
import {
    Container,
    Grid,
    Typography,
    CircularProgress,
    Box,
    Button,
    Alert,
    Stack
} from '@mui/material';
import GameCard from '../components/GameCard';
import { useAuth } from '../context/AuthContext';
import { getWishlistByUsername, type WishlistApiResponse } from '../api/user.service';
import { type Game } from '../api/game.service';

const WISHLIST_PAGE_SIZE = 24;

export default function WishlistPage() {
    const { username } = useParams<{ username: string }>();
    const { user: loggedInUser, resetWishlistInContext } = useAuth();

    const [games, setGames] = useState<Game[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFetchingMore, setIsFetchingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [hasNextPage, setHasNextPage] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const isOwnWishlist = loggedInUser && loggedInUser.username === username;

    const fetchWishlistGames = async (pageNum: number) => {
        if (!username) return;

        if (pageNum === 1) {
            setIsLoading(true);
            setError(null);
        } else {
            setIsFetchingMore(true);
        }

        try {
            // 4. 'data' ТЕПЕРЬ 'WishlistApiResponse'
            const data: WishlistApiResponse = await getWishlistByUsername(username, {
                limit: WISHLIST_PAGE_SIZE,
                page: pageNum
            });

            setGames(prevGames => {
                const newGames = data.games.filter(
                    g => !(prevGames.map(pg => pg.id).includes(g.id))
                );
                return pageNum === 1 ? data.games : [...prevGames, ...newGames];
            });
            setPage(pageNum);
            setHasNextPage(data.hasNextPage);

        } catch (err: any) {
            setError(err.message || 'Failed to load wishlist.');
        } finally {
            setIsLoading(false);
            setIsFetchingMore(false);
        }
    };


    useEffect(() => {
        setGames([]);
        setPage(1);
        setHasNextPage(true);
        fetchWishlistGames(1);

    }, [username]);

    // Intersection Observer
    const observer = useRef<IntersectionObserver | null>(null);
    const lastGameElementRef = useCallback((node: HTMLElement | null) => {
        if (isLoading || isFetchingMore) return;
        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasNextPage) {
                fetchWishlistGames(page + 1);
            }
        });

        if (node) observer.current.observe(node);
    }, [isLoading, isFetchingMore, hasNextPage, page]); // eslint-disable-line react-hooks/exhaustive-deps


    const handleResetWishlist = async () => {
        if (!isOwnWishlist) return;
        if (window.confirm("Are you sure you want to clear your entire wishlist? This cannot be undone.")) {
            try {
                await resetWishlistInContext();
                setGames([]);
                setHasNextPage(false);
            } catch (err) {
                setError("Failed to clear wishlist.");
            }
        }
    };

    if (isLoading && games.length === 0) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                <CircularProgress size={60} />
            </Box>
        );
    }

    if (error) {
        return (
            <Container maxWidth="md" sx={{ mt: 5 }}>
                <Alert severity="error">{error}</Alert>
            </Container>
        );
    }

    // ... (Остальная часть файла JSX 'return (...)' - без изменений) ...
    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Stack
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between"
                alignItems="center"
                spacing={2}
                sx={{ mb: 4 }}
            >
                <Box>
                    <Typography
                        variant="h3"
                        component="h1"
                        fontWeight="bold"
                    >
                        {username}'s Wishlist
                    </Typography>
                </Box>

                {isOwnWishlist && games.length > 0 && (
                    <Button
                        variant="outlined"
                        color="error"
                        onClick={handleResetWishlist}
                    >
                        Clear Wishlist
                    </Button>
                )}
            </Stack>

            {!isLoading && games.length === 0 && (
                <Box
                    sx={{
                        p: 3,
                        border: '1px dashed',
                        borderColor: 'divider',
                        borderRadius: 2,
                        minHeight: 200,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <Typography color="text.secondary">
                        This wishlist is empty.
                    </Typography>
                </Box>
            )}

            <Grid container spacing={3} sx={{ justifyContent: 'center' }}>
                {games.map((game, index) => (
                    <Grid
                        key={game.id}
                        size={{ xs: 12, sm: 6, md: 4 }}
                        ref={games.length === index + 1 ? lastGameElementRef : null}
                    >
                        <GameCard game={game} />
                    </Grid>
                ))}
            </Grid>

            {isFetchingMore && (
                <Box display="flex" justifyContent="center" sx={{ mt: 4, mb: 2 }}>
                    <CircularProgress />
                </Box>
            )}

            {!hasNextPage && !isLoading && !isFetchingMore && games.length > 0 && (
                <Typography variant="body1" align="center" sx={{ mt: 4, mb: 2, color: 'text.secondary' }}>
                    You have viewed all games in this wishlist
                </Typography>
            )}
        </Container>
    );
}