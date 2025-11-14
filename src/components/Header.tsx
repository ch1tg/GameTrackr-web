import { AppBar, Toolbar, Typography, Button, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';


export default function Header() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogoClick = () => navigate('/');
    const handleLoginClick = () => navigate('/login');
    const handleRegisterClick = () => navigate('/register');



    const handleLogoutClick = async () => {
        await logout();
        navigate('/');
    };


    const renderAuthButtons = () => {
        if (user) {
            const handleProfileClick = () => navigate(`/users/${user.username}`);
            const handleWishlistClick = () => navigate(`users/${user.username}/wishlist`);
            return (
                <Stack direction="row" spacing={1}>
                    <Button color="inherit" onClick={handleWishlistClick}>
                        Wishlist
                    </Button>
                    <Button color="inherit" onClick={handleProfileClick}>
                        {user.username}
                    </Button>
                    <Button color="inherit" onClick={handleLogoutClick} variant="outlined">
                        Logout
                    </Button>
                </Stack>
            );
        } else {
            return (
                <Stack direction="row" spacing={1}>
                    <Button color="inherit" onClick={handleLoginClick}>
                        Log in
                    </Button>
                    <Button color="inherit" onClick={handleRegisterClick}>
                        Sign up
                    </Button>
                </Stack>
            );
        }
    };

    return (
        <AppBar position="sticky">
            <Toolbar>

                <Stack
                    direction="row"
                    alignItems="center"
                    onClick={handleLogoClick}
                    sx={{ cursor: 'pointer', flexGrow: 1 }}
                >
                    <Typography variant="h6" component="div">
                        GameTrackr
                    </Typography>
                </Stack>


                {renderAuthButtons()}
            </Toolbar>
        </AppBar>
    );
}
