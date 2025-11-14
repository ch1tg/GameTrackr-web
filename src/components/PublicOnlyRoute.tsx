import { useAuth } from '../context/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';


export const PublicOnlyRoute = () => {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return null;
    }

    if (user) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};