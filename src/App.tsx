import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MainPage from './pages/HomePage.tsx';
import { ProtectedRoute } from './components/ProtectedRoute';
import { PublicOnlyRoute } from './components/PublicOnlyRoute';
import { useAuth } from './context/AuthContext';
import { CircularProgress, Box } from '@mui/material';
import Layout from "./components/Layout.tsx";
import UserProfilePage from "./pages/UserProfilePage.tsx";
import ProfileEditPage from "./pages/ProfileEditingPage.tsx";
import GameDetailPage from "./pages/GameDetailPage.tsx";
import WishlistPage from "./pages/WishlistPage.tsx";
import SearchResultPage from "./pages/SearchResultPage.tsx";

function App() {
    const { isLoading } = useAuth();

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
                <CircularProgress />
            </Box>
        );
    }


    return (
        <Routes>
            <Route path="/" element={<Layout />}>


                <Route index element={<MainPage />} />
                <Route element={<PublicOnlyRoute />}>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                </Route>
                <Route path="/users/:username/wishlist" element={<WishlistPage />} />
                <Route path="/games/:gameId" element={<GameDetailPage />} />
                <Route path="/users/:username" element={<UserProfilePage />} />
                <Route path="/search" element={<SearchResultPage />} />
                <Route element={<ProtectedRoute />}>
                    <Route path="/profile/edit" element={<ProfileEditPage />} />
                </Route>



            </Route>
        </Routes>
    );
}

export default App;