import React, { useState } from 'react';
import {Container, Box, TextField, Button, Typography, Alert, Link as MuiLink} from '@mui/material';
import {Link as RouterLink, useNavigate} from 'react-router-dom';
import {useAuth} from "../context/AuthContext.tsx";


export default function RegisterPage() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { register } = useAuth();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            await register({
                username: username,
                email: email,
                password: password
            });


            navigate('/');

        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <Container maxWidth="xs">
            <Box
                component="form"
                onSubmit={handleRegister}
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                }}
            >
                <Typography component="h1" variant="h5">
                    SIGN UP
                </Typography>

                <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="username"
                    label="Username "
                    name="username"
                    autoFocus
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />

                <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="email"
                    label="Email"
                    name="email"
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />


                <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="password"
                    label="Password"
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                {error && (
                    <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
                        {error}
                    </Alert>
                )}

                <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{ mt: 3, mb: 2 }}
                >
                    SIGN UP
                </Button>

                <MuiLink component={RouterLink} to="/" variant="body2">
                    {"Have account? Sign in"}
                </MuiLink>
            </Box>
        </Container>
    );
}