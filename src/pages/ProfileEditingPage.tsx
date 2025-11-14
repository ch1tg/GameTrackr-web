import React, { useState } from 'react';
import {
    Container,
    Paper,
    Typography,
    Box,
    Grid,
    Button,
    Stack,
    Divider,
    TextField, // <-- Для форм
    Alert,      // <-- Для сообщений об успехе/ошибке
    CircularProgress
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';


export default function ProfileEditPage() {
    const {
        user,
        updateProfile,
        changePassword,
        deleteAccount
    } = useAuth();

    const navigate = useNavigate();


    const [username, setUsername] = useState(user?.username || '');
    const [email, setEmail] = useState(user?.email || '');
    const [profileLoading, setProfileLoading] = useState(false);
    const [profileError, setProfileError] = useState('');
    const [profileSuccess, setProfileSuccess] = useState('');


    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [passLoading, setPassLoading] = useState(false);
    const [passError, setPassError] = useState('');
    const [passSuccess, setPassSuccess] = useState('');


    const [deletePassword, setDeletePassword] = useState('');
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [deleteError, setDeleteError] = useState('');


    if (!user) {
        return null;
    }



    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setProfileLoading(true);
        setProfileError('');
        setProfileSuccess('');
        try {
            await updateProfile({ username, email });
            setProfileSuccess('Your profile has been successfully updated!');
        } catch (err: any) {
            setProfileError(err.message || 'Profile update failed');
        } finally {
            setProfileLoading(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setPassLoading(true);
        setPassError('');
        setPassSuccess('');
        try {
            await changePassword({ old_password: oldPassword, new_password: newPassword });
            setPassSuccess('Password successfully changed!');
            setOldPassword('');
            setNewPassword('');
        } catch (err: any) {
            setPassError(err.message || 'Password change error');
        } finally {
            setPassLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        const confirmation = prompt(`Are you sure? This is irreversible. \nEnter “${user.username}” to confirm:`);
        if (confirmation !== user.username) {
            setDeleteError('Confirmation didn\'t match.');
            return;
        }

        setDeleteLoading(true);
        setDeleteError('');
        try {
            await deleteAccount({ password: deletePassword });
        } catch (err: any) {
            setDeleteError(err.message || 'Deletion error (incorrect password?)');
        } finally {
            setDeleteLoading(false);
        }
    };



    const avatarLetter = user.username[0]?.toUpperCase() || '?';
    const avatarPlaceholderUrl = `https://placehold.co/200/e0e0e0/333?text=${avatarLetter}`;

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>

            <Grid container spacing={4}>

                <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                    <Stack
                        spacing={2}
                        alignItems="center"
                        divider={<Divider flexItem />}
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
                                {user.username}
                            </Typography>
                        </Stack>
                        <Button
                            variant="outlined"
                            onClick={() => navigate(`/users/${user.username}`)}
                            sx={{ width: '100%' }}
                        >
                            View public profile
                        </Button>
                    </Stack>
                </Paper>


                <Stack spacing={4}>

                    <Paper elevation={3} sx={{ p: { xs: 2, md: 3 }, borderRadius: 2 }}>
                        <Typography variant="h5" gutterBottom>Edit profile</Typography>
                        <Box component="form" onSubmit={handleProfileUpdate}>
                            <Stack spacing={2}>
                                <TextField
                                    label="Username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    fullWidth
                                    required
                                />
                                <TextField
                                    label="Email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    fullWidth
                                    required
                                />
                                {profileError && <Alert severity="error">{profileError}</Alert>}
                                {profileSuccess && <Alert severity="success">{profileSuccess}</Alert>}
                                <Button
                                    type="submit"
                                    variant="contained"
                                    disabled={profileLoading}
                                    startIcon={profileLoading ? <CircularProgress size={20} /> : null}
                                >
                                    Save changes
                                </Button>
                            </Stack>
                        </Box>
                    </Paper>

                    <Paper elevation={3} sx={{ p: { xs: 2, md: 3 }, borderRadius: 2 }}>
                        <Typography variant="h5" gutterBottom>Change password</Typography>
                        <Box component="form" onSubmit={handlePasswordChange}>
                            <Stack spacing={2}>
                                <TextField
                                    label="Old password"
                                    type="password"
                                    value={oldPassword}
                                    onChange={(e) => setOldPassword(e.target.value)}
                                    fullWidth
                                    required
                                />
                                <TextField
                                    label="New password"
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    fullWidth
                                    required
                                />
                                {passError && <Alert severity="error">{passError}</Alert>}
                                {passSuccess && <Alert severity="success">{passSuccess}</Alert>}
                                <Button
                                    type="submit"
                                    variant="contained"
                                    disabled={passLoading}
                                    startIcon={passLoading ? <CircularProgress size={20} /> : null}
                                >
                                    Change password
                                </Button>
                            </Stack>
                        </Box>
                    </Paper>

                    <Paper elevation={3} sx={{ p: { xs: 2, md: 3 }, borderRadius: 2, border: '1px solid', borderColor: 'error.main' }}>
                        <Typography variant="h5" gutterBottom color="error">Danger zone</Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Typography variant="body2" gutterBottom>
                            To delete your account, enter your current password. This action cannot be undone.
                        </Typography>
                        <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                            <TextField
                                label="Current password"
                                type="password"
                                value={deletePassword}
                                onChange={(e) => setDeletePassword(e.target.value)}
                                fullWidth
                                size="small"
                                required
                            />
                            <Button
                                variant="contained"
                                color="error"
                                disabled={deleteLoading || !deletePassword}
                                onClick={handleDeleteAccount}
                                startIcon={deleteLoading ? <CircularProgress size={20} color="inherit" /> : null}
                            >
                                Delete account
                            </Button>
                        </Stack>
                        {deleteError && <Alert severity="error" sx={{ mt: 2 }}>{deleteError}</Alert>}
                    </Paper>

                </Stack>

            </Grid>
        </Container>
    );
}