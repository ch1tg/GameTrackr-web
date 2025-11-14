import { useAuth } from '../context/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';


export const ProtectedRoute = () => {
    const { user, isLoading } = useAuth();


    if (isLoading) {
        return null;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }
    return <Outlet />;
};