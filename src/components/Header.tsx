import {AppBar, Toolbar, Typography, Button, Stack, Box, TextField, InputAdornment} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect, useRef} from 'react';
import type { KeyboardEvent } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import { searchAll, type SearchAllResponse } from '../api/search.service';
import SearchPreview from './SearchPreview';



export default function Header() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState<SearchAllResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    const handleLogoClick = () => navigate('/');
    const handleLoginClick = () => navigate('/login');
    const handleRegisterClick = () => navigate('/register');



    const handleLogoutClick = async () => {
        await logout();
        navigate('/');
    };

    useEffect(() => {
        if (!searchTerm.trim()) {
            setIsLoading(false);
            setResults(null);
            setShowPreview(false);
            return;
        }

        setShowPreview(true);

        const delayDebounceFn = setTimeout(async () => {
            setIsLoading(true);
            try {
                const data = await searchAll(searchTerm, 3, 3);
                setResults(data);
            } catch (error) {
                console.error("Failed to fetch search preview:", error);
                setResults(null);
            }
            setIsLoading(false);
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);


    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowPreview(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);


    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && searchTerm.trim()) {
            setShowPreview(false);
            (e.target as HTMLInputElement).blur(); // Снимаем фокус
            navigate(`/search?q=${searchTerm.trim()}`);
        }
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
                <Box sx={{ position: 'relative', mr: 2 }} ref={searchRef}>
                    <TextField
                        variant="outlined"
                        size="small"
                        placeholder="Search users & games..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onFocus={() => setShowPreview(true)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon sx={{ color: 'white' }} />
                                </InputAdornment>
                            ),
                            sx: {
                                color: 'white',
                                '& .MuiOutlinedInput-notchedOutline': {
                                    borderColor: 'rgba(255, 255, 255, 0.3)',
                                },
                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                    borderColor: 'rgba(255, 255, 255, 0.5)',
                                },
                                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                    borderColor: 'white',
                                },
                            }
                        }}
                    />


                    {showPreview && (
                        <SearchPreview
                            isLoading={isLoading}
                            results={results}
                            onClose={() => setShowPreview(false)} // Закрываем при клике на элемент
                        />
                    )}
                </Box>


                {renderAuthButtons()}
            </Toolbar>
        </AppBar>
    );
}
