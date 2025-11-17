import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
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
import UserCard from '../components/UserCard';


function GamesList({ games, lastGameElementRef }: { games: Game[], lastGameElementRef?: (node: HTMLElement | null) => void }) {
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



function UsersList({ users, lastUserElementRef }: { users: SearchedUser[], lastUserElementRef?: (node: HTMLElement | null) => void }) {
    if (users.length === 0) {
        return <Alert severity="info">No users found for this query.</Alert>;
    }
    return (
        <Grid container spacing={3}>
            {users.map((user, index) => (
                <Grid
                    key={user.username}
                    size={{ xs: 12, sm: 6, md: 4 }}
                    ref={users.length === index + 1 ? lastUserElementRef : null}
                >
                    <UserCard user={user} />
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
    const [userPage, setUserPage] = useState(1);

    const [users, setUsers] = useState<SearchedUser[]>([]);
    const [games, setGames] = useState<Game[]>([]);


    const [hasNextUserPage, setHasNextUserPage] = useState(true);
    const [hasNextGamePage, setHasNextGamePage] = useState(true);


    const [isLoading, setIsLoading] = useState(true);
    const [isFetchingMore, setIsFetchingMore] = useState(false);
    const [error, setError] = useState('');


    const gameObserver = useRef<IntersectionObserver | null>(null);
    const lastGameElementRef = useCallback((node: HTMLElement | null) => {
        if (isLoading || isFetchingMore) return;
        if (gameObserver.current) gameObserver.current.disconnect();

        gameObserver.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasNextGamePage) {
                setGamePage(prevPage => prevPage + 1);
            }
        });
        if (node) gameObserver.current.observe(node);
    }, [isLoading, isFetchingMore, hasNextGamePage]);


    const userObserver = useRef<IntersectionObserver | null>(null);
    const lastUserElementRef = useCallback((node: HTMLElement | null) => {
        if (isLoading || isFetchingMore) return;
        if (userObserver.current) userObserver.current.disconnect();

        userObserver.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasNextUserPage) {
                setUserPage(prevPage => prevPage + 1);
            }
        });
        if (node) userObserver.current.observe(node);
    }, [isLoading, isFetchingMore, hasNextUserPage]);


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
            setGames([]);
            setGamePage(1);
            setUserPage(1);
            setHasNextGamePage(true);
            setHasNextUserPage(true);

            try {
                if (tab === 'users') {

                    setIsFetchingMore(true);
                    const data = await searchUsers(q, 1, 20);
                    setUsers(data.users);

                    setHasNextUserPage(data.current_page < data.total_pages);
                    setIsFetchingMore(false);

                } else if (tab === 'games') {

                    setIsFetchingMore(true);
                    const data = await searchGames(q, 1, 20);
                    setGames(data.games);
                    setHasNextGamePage(data.nextPage !== null);
                    setIsFetchingMore(false);

                } else {
                    const data = await searchAll(q, 15, 15);
                    setUsers(data.users);
                    setGames(data.games);
                    setHasNextGamePage(false);
                    setHasNextUserPage(false);
                }

            } catch (err: any) {
                setError(err.message || 'Failed to fetch search data.');
                setIsFetchingMore(false);
            } finally {
                setIsLoading(false);
            }
        };

        fetchNewData();
    }, [q, tab]);

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


    useEffect(() => {
        if (userPage === 1 || !q || tab !== 'users') return;

        const loadMoreUsers = async () => {
            setIsFetchingMore(true);
            try {
                const data = await searchUsers(q, userPage, 20);
                setUsers(prevUsers => {
                    const newUsers = data.users.filter(
                        u => !(prevUsers.map(pu => pu.username).includes(u.username))
                    );
                    return [...prevUsers, ...newUsers];
                });
                setHasNextUserPage(data.current_page < data.total_pages);
            } catch (err: any) {
                console.error("Failed to load more users:", err);
                setHasNextUserPage(false);
            } finally {
                setIsFetchingMore(false);
            }
        };

        loadMoreUsers();
    }, [userPage, q, tab]);
    const handleTabChange = (_event: React.SyntheticEvent, newTab: string) => {
        setSearchParams({ q: q || '', tab: newTab });
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
                            {!hasNextGamePage && !isFetchingMore && games.length > 0 && (
                                <Typography variant="body1" align="center" sx={{ mt: 4, mb: 2, color: 'text.secondary' }}>
                                    You have viewed all games
                                </Typography>
                            )}
                        </Grid>
                    )}

                    {tab === 'users' && (
                        <Grid size={12}>

                            <UsersList users={users} lastUserElementRef={lastUserElementRef} />


                            {isFetchingMore && (
                                <Box display="flex" justifyContent="center" sx={{ mt: 4, mb: 2 }}>
                                    <CircularProgress />
                                </Box>
                            )}

                            {!hasNextUserPage && !isFetchingMore && users.length > 0 && (
                                <Typography variant="body1" align="center" sx={{ mt: 4, mb: 2, color: 'text.secondary' }}>
                                    You have viewed all users
                                </Typography>
                            )}

                        </Grid>
                    )}
                </Grid>
            </Paper>
        </Container>
    );
}