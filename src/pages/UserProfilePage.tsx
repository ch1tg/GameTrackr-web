import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    Container,
    Paper,
    Typography,
    CircularProgress,
    Box,
    Alert,
    Grid,
    Button,
    Stack,
    Divider,
    Link as MuiLink
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { getUserByUsername, getWishlistByUsername, type PublicUser } from '../api/user.service';
import { type Game } from '../api/game.service';
import GameCard from '../components/GameCard';

function formatDate(isoString: string | null | undefined): string {
    if (!isoString) return "Date not specified";
    try {
        const date = new Date(isoString);
        if (isNaN(date.getTime())) throw new Error("Invalid date");
        return date.toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    } catch (error) {
        console.error("Invalid date string:", isoString);
        return "Incorrect date";
    }
}

export default function UserProfilePage() {
    const { username } = useParams<{ username: string }>();
    const { user: loggedInUser } = useAuth();
    const navigate = useNavigate();

    const [profileData, setProfileData] = useState<PublicUser | null>(null);
    const [wishlistGames, setWishlistGames] = useState<Game[]>([]);

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!username) {
            setError('Username not found');
            setIsLoading(false);
            return;
        }

        const fetchProfile = async () => {
            setIsLoading(true);
            setError('');
            try {
                const [userData, wishlistData] = await Promise.all([
                    getUserByUsername(username),
                    getWishlistByUsername(username, { limit: 5 })
                ]);

                setProfileData(userData);
                setWishlistGames(wishlistData.games);

            } catch (err: any) {
                setError(err.message || 'Failed to fetch data.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, [username]);


    const isOwnProfile = loggedInUser && loggedInUser.username === profileData?.username;

    if (isLoading) {
        return (
            <Container maxWidth="md" sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
                <CircularProgress />
            </Container>
        );
    }

    if (error) {
        return (
            <Container maxWidth="md" sx={{ mt: 5 }}>
                <Alert severity="error">{error}</Alert>
            </Container>
        );
    }

    if (!profileData) {
        return (
            <Container maxWidth="md" sx={{ mt: 5 }}>
                <Alert severity="info">Profile not found.</Alert>
            </Container>
        );
    }

    const avatarLetter = profileData.username[0]?.toUpperCase() || '?';
    const avatarPlaceholderUrl = `https://placehold.co/200/e0e0e0/333?text=${avatarLetter}`;
    const joinDate = formatDate(profileData.registered_on);

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Paper
                elevation={3}
                sx={{ p: { xs: 2, md: 4 }, borderRadius: 2 }}
            >
                <Grid container spacing={4}>
                    <Grid size={{ xs: 12, md: 3 }}>
                        <Stack
                            spacing={2}
                            alignItems="center"
                            divider={<Divider flexItem />}
                            sx={{ position: 'sticky', top: '80px' }}
                        >
                            <Box
                                component="img"
                                src={avatarPlaceholderUrl}
                                alt="Avatar Placeholder"
                                sx={{
                                    width: 200,
                                    height: 200,
                                    borderRadius: '50%',
                                    backgroundColor: '#e0e0e0',
                                    border: '4px solid',
                                    borderColor: 'divider'
                                }}
                            />
                            <Stack spacing={0.5} alignItems="center">
                                <Typography variant="h4">
                                    {profileData.username}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Member since {joinDate}
                                </Typography>
                            </Stack>

                            {isOwnProfile && (
                                <Button
                                    variant="contained"
                                    onClick={() => navigate(`/profile/edit`)}
                                    sx={{ width: '100%' }}
                                >
                                    Edit profile
                                </Button>
                            )}
                        </Stack>
                    </Grid>

                    <Grid size={{ xs: 12, md: 9 }}>
                        <MuiLink
                            component={Link}
                            to={`/users/${profileData.username}/wishlist`} // "Куда"
                            variant="h5"
                            color="inherit"
                            underline="hover" // "Подчеркиваем" при наведении
                            sx={{ fontWeight: 'bold', mb: 2, display: 'block' }}
                        >
                            Wishlist (Recent)
                        </MuiLink>

                        <Box>
                            {wishlistGames.length === 0 ? (
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
                                        This user has no games on their wishlist yet.
                                    </Typography>
                                </Box>
                            ) : (
                                <Grid container spacing={2} sx={{ justifyContent: 'flex-start' }}>
                                    {wishlistGames.map(game => (
                                        <Grid
                                            key={game.id}
                                            size={{ xs: 12, sm: 6, md: 4 }}
                                        >
                                            <GameCard game={game} />
                                        </Grid>
                                    ))}
                                </Grid>
                            )}
                        </Box>

                    </Grid>
                </Grid>
            </Paper>
        </Container>
    );
}