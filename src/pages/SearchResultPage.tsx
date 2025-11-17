import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, Link as RouterLink } from 'react-router-dom';
import {
    Container,
    Paper,
    Typography,
    CircularProgress,
    Box,
    Alert,
    Grid,
    Tabs,
    Tab,
    Pagination,
    Button,
    Divider
} from '@mui/material';
import {
    searchAll,
    searchUsers,
    searchGames,
    type SearchedUser
} from '../api/search.service';
import { type Game } from '../api/game.service';
import GameCard from '../components/GameCard';


    function GamesList({ games, lastGameElementRef }: { games: Game[], lastGameElementRef?: (node: HTMLElement | null) => void }) {
    if (!Array.isArray(games)) {
        return <Alert severity="error">Invalid games response</Alert>;
    }
    if (games.length === 0) {
        return <Alert severity="info">No games found for this query.</Alert>;
    }
    return (
        <Grid container spacing={3} sx={{ justifyContent: 'center' }}>
            {games.map((game, index) => (
                <Grid
                    key={`${game.id}-${index}`}
                    size={{ xs: 12, sm: 6, md: 4 }}
                    ref={games.length === index + 1 ? lastGameElementRef : null}
                >
                    <GameCard game={game} />
                </Grid>
            ))}
        </Grid>
    );
}

/**
 * Внутренний "глупый" компонент для списка Пользователей
 */
function UsersList({ users }: { users: SearchedUser[] }) {
    if (users.length === 0) {
        return <Alert severity="info">No users found for this query.</Alert>;
    }
    return (
        <Grid container spacing={2}>
            {users.map(user => (
                <Grid key={user.username} size={{ xs: 12, sm: 6, md: 4 }}>
                    <Paper
                        elevation={2}
                        sx={{
                            p: 2,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}
                    >
                        <Typography variant="h6">{user.username}</Typography>
                        <Button
                            component={RouterLink}
                            to={`/users/${user.username}`}
                            variant="outlined"
                            size="small"
                        >
                            View
                        </Button>
                    </Paper>
                </Grid>
            ))}
        </Grid>
    );
}


export default function SearchResultPage() {
    const [searchParams, setSearchParams] = useSearchParams();


    const q = searchParams.get('q');
    const tab = searchParams.get('tab') || 'all';


    const [gamePage, setGamePage] = useState(1);
    const userPage = parseInt(searchParams.get('page') || '1', 10);


    const [users, setUsers] = useState<SearchedUser[]>([]);
    const [games, setGames] = useState<Game[]>([]);

    const [userPagination, setUserPagination] = useState({ total_pages: 1, current_page: 1 });
    const [hasNextGamePage, setHasNextGamePage] = useState(true);

    const [isLoading, setIsLoading] = useState(true);
    const [isFetchingMore, setIsFetchingMore] = useState(false);
    const [error, setError] = useState('');

    const observer = useRef<IntersectionObserver | null>(null);
    const lastGameElementRef = useCallback((node: HTMLElement | null) => {
        if (isLoading || isFetchingMore) return;
        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasNextGamePage) {

                setGamePage(prevPage => prevPage + 1);
            }
        });

        if (node) observer.current.observe(node);
    }, [isLoading, isFetchingMore, hasNextGamePage]);
    useEffect(() => {
        if (!q) {
            setError('Search query is missing.');
            setIsLoading(false);
            return;
        }

        const fetchNewData = async () => {
            setIsLoading(true);
            setError('');
            setUsers([]);
            setGames([]); // Сбрасываем игры
            setGamePage(1); // Сбрасываем страницу игр
            setHasNextGamePage(true);

            try {
                if (tab === 'users') {
                    const data = await searchUsers(q, userPage, 20);
                    setUsers(data.users);
                    setUserPagination({ total_pages: data.total_pages, current_page: data.current_page });

                } else if (tab === 'games') {
                    // Загружаем ПЕРВУЮ страницу игр
                    setIsFetchingMore(true);
                    const data = await searchGames(q, 1, 20); // Вызываем без ordering
                    // --- ИСПРАВЛЕНИЕ: Копируем логику GameContext.tsx ---
                    setGames(data.games); // Устанавливаем первую страницу
                    setHasNextGamePage(data.nextPage !== null); // <-- Проверяем nextPage
                    // ---
                    setIsFetchingMore(false);

                } else { // tab === 'all'
                    const data = await searchAll(q, 15, 15);
                    setUsers(data.users);
                    setGames(data.games); // data.games - это уже массив
                    setHasNextGamePage(false); // Нет "load more" на "All"
                }

            } catch (err: any) {
                setError(err.message || 'Failed to fetch search data.');
                setIsFetchingMore(false);
            } finally {
                setIsLoading(false);
            }
        };

        fetchNewData();
    }, [q, tab, userPage]); // <-- Убрали 'ordering'



    useEffect(() => {

        if (gamePage === 1 || !q || tab !== 'games') return;

        const loadMoreGames = async () => {
            setIsFetchingMore(true);
            try {
                const data = await searchGames(q, gamePage, 20);


                setGames(prevGames => {
                    const newGames = data.games.filter(
                        g => !(prevGames.map(pg => pg.id).includes(g.id))
                    );
                    return [...prevGames, ...newGames];
                });
                setHasNextGamePage(data.nextPage !== null);


            } catch (err: any) {
                console.error("Failed to load more games:", err);
                setHasNextGamePage(false);
            } finally {
                setIsFetchingMore(false);
            }
        };

        loadMoreGames();
    }, [gamePage, q, tab]);


    const handleTabChange = (_event: React.SyntheticEvent, newTab: string) => {
        setSearchParams({ q: q || '', tab: newTab });
    };

    const handleUserPageChange = (_event: React.ChangeEvent<unknown>, newPage: number) => {
        setSearchParams({ q: q || '', tab: tab, page: String(newPage) }); // Убрали 'ordering'
    };


    if (isLoading) {
        return (
            <Container maxWidth="md" sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
                <CircularProgress />
            </Container>
        );
    }
    if (error) {
        return <Container maxWidth="md" sx={{ mt: 5 }}><Alert severity="error">{error}</Alert></Container>;
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, borderRadius: 2 }}>
                <Typography variant="h4" gutterBottom>
                    Search Results for: <strong>"{q}"</strong>
                </Typography>

                {/* Табы */}
                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                    <Tabs value={tab} onChange={handleTabChange} aria-label="search tabs">
                        <Tab label="All" value="all" />
                        <Tab label="Games" value="games" />
                        <Tab label="Users" value="users" />
                    </Tabs>
                </Box>


                <Grid container spacing={4}>
                    {tab === 'all' && (
                        <>
                            <Grid size={12}>
                                <Typography variant="h5" component="h2" sx={{ mb: 2, fontWeight: 'bold' }}>Games</Typography>
                                <GamesList games={games} />
                                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                                    {games.length > 0 && <Button onClick={(e) => handleTabChange(e, 'games')}>View All Games</Button>}
                                </Box>
                            </Grid>
                            {games.length > 0 && users.length > 0 && <Grid size={12}><Divider sx={{ my: 3 }} /></Grid>}
                            <Grid size={12}>
                                <Typography variant="h5" component="h2" sx={{ mb: 2, fontWeight: 'bold' }}>Users</Typography>
                                <UsersList users={users} />
                                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                                    {users.length > 0 && <Button onClick={(e) => handleTabChange(e, 'users')}>View All Users</Button>}
                                </Box>
                            </Grid>
                        </>
                    )}


                    {tab === 'games' && (
                        <Grid size={12}>
                            <GamesList games={games} lastGameElementRef={lastGameElementRef} />

                            {isFetchingMore && (
                                <Box display="flex" justifyContent="center" sx={{ mt: 4, mb: 2 }}>
                                    <CircularProgress />
                                </Box>
                            )}
                            {/* Конец списка */}
                            {!hasNextGamePage && !isFetchingMore && games.length > 0 && (
                                <Typography variant="body1" align="center" sx={{ mt: 4, mb: 2, color: 'text.secondary' }}>
                                    You have viewed all games
                                </Typography>
                            )}
                        </Grid>
                    )}

                    {/* --- Таб "Users" (Пагинация) --- */}
                    {tab === 'users' && (
                        <Grid size={12}>
                            <UsersList users={users} />
                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                                {userPagination.total_pages > 1 && (
                                    <Pagination
                                        page={userPagination.current_page}
                                        count={userPagination.total_pages}
                                        onChange={handleUserPageChange}
                                        color="primary"
                                    />
                                )}
                            </Box>
                        </Grid>
                    )}
                </Grid>
            </Paper>
        </Container>
    );
}