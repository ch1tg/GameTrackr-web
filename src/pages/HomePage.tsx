import { useRef, useCallback, useEffect } from 'react';
import {
    Container,
    Grid,
    Typography,
    CircularProgress,
    Box,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Stack
} from '@mui/material';
import GameCard from '../components/GameCard';
import type { SelectChangeEvent } from '@mui/material';
import { useGame } from '../context/GameContext';


const platformOptions = [
    { label: 'All Platforms', value: '' },
    { label: 'PC', value: '4' },
    { label: 'PlayStation 5', value: '187' },
    { label: 'Xbox Series X/S', value: '186' },
    { label: 'Nintendo Switch', value: '7' },
];

const orderingOptions = [
    { label: 'Metacritic', value: '-metacritic' },
    { label: 'Popularity', value: '-added' },
    { label: 'Release Date', value: '-released' },
    { label: 'Rating', value: '-rating' },
];


export default function HomePage() {
    const {
        games,
        setGames,
        isLoading,
        isFetchingMore,
        hasNextPage,
        setHasNextPage,
        setPage,
        error,
        ordering,
        setOrdering,
        platform,
        setPlatform,
        fetchGames,
        loadMoreGames
    } = useGame();

    const observer = useRef<IntersectionObserver | null>(null);

    useEffect(() => {
        if (games.length > 0) {
            return;
        }

        setGames([]);
        setPage(1);
        setHasNextPage(true);
        fetchGames(1, ordering, platform);


    }, []);


    const lastGameElementRef = useCallback((node: HTMLElement | null) => {
        if (isLoading || isFetchingMore) return;
        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasNextPage) {
                loadMoreGames();
            }
        });

        if (node) observer.current.observe(node);

    }, [isLoading, isFetchingMore, hasNextPage, loadMoreGames]);

    const handleOrderingChange = (event: SelectChangeEvent<string>) => {
        const newOrdering = event.target.value;
        setOrdering(newOrdering);
        setGames([]);
        setPage(1);
        setHasNextPage(true);
        fetchGames(1, newOrdering, platform);
    };

    const handlePlatformChange = (event: SelectChangeEvent<string>) => {
        const newPlatform = event.target.value;
        setPlatform(newPlatform);
        setGames([]);
        setPage(1);
        setHasNextPage(true);
        fetchGames(1, ordering, newPlatform);
    };


    if (isLoading && games.length === 0) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                <CircularProgress size={60} />
            </Box>
        );
    }

    if (error && games.length === 0) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                <Typography variant="h6" color="error">
                    {error}
                </Typography>
            </Box>
        );
    }
    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h3" component="h1" gutterBottom fontWeight="bold" sx={{ textAlign: 'center' }}>
                All Games
            </Typography>

            <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                justifyContent="center"
                sx={{ mb: 4 }}
            >
                <FormControl sx={{ minWidth: 200 }} disabled={isLoading || isFetchingMore}>
                    <InputLabel id="ordering-select-label">Sort By</InputLabel>
                    <Select
                        labelId="ordering-select-label"
                        id="ordering-select"
                        value={ordering}
                        label="Sort By"
                        onChange={handleOrderingChange}
                    >
                        {orderingOptions.map(opt => (
                            <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl sx={{ minWidth: 200 }} disabled={isLoading || isFetchingMore}>
                    <InputLabel id="platform-select-label">Platform</InputLabel>
                    <Select
                        labelId="platform-select-label"
                        id="platform-select"
                        value={platform}
                        label="Platform"
                        onChange={handlePlatformChange}
                    >
                        {platformOptions.map(opt => (
                            <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Stack>

            {isLoading && games.length === 0 ? (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="40vh">
                    <CircularProgress size={60} />
                </Box>
            ) : (
                <Grid container spacing={3} sx={{ justifyContent: 'center' }}>
                    {games.map((game, index) => (
                        <Grid
                            key={`${game.id}-${ordering}-${platform}`}
                            size={{ xs: 12, sm: 6, md: 4 }}
                            ref={games.length === index + 1 ? lastGameElementRef : null}
                        >
                            <GameCard game={game} />
                        </Grid>
                    ))}
                </Grid>
            )}

            {isFetchingMore && (
                <Box display="flex" justifyContent="center" sx={{ mt: 4, mb: 2 }}>
                    <CircularProgress />
                </Box>
            )}

            {!hasNextPage && !isLoading && !isFetchingMore && games.length > 0 && (
                <Typography variant="body1" align="center" sx={{ mt: 4, mb: 2, color: 'text.secondary' }}>
                    You have viewed all games
                </Typography>
            )}

            {!isFetchingMore && !isLoading && games.length === 0 && !error && (
                <Typography variant="h6" align="center" sx={{ mt: 4, mb: 2, color: 'text.secondary' }}>
                    Nothing was found based on your request.
                </Typography>
            )}
        </Container>
    );
}