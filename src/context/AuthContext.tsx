import React, { createContext, useState, useContext, useEffect } from 'react';
import * as authService from '../api/auth.service';
import * as wishlistService from '../api/wishlist.service';
import {
    type ChangePasswordData,
    type DeleteAccountData,
    type LoginData,
    type UpdateProfileData
} from '../api/auth.service';
import {type RegisterData } from '../api/auth.service';
import {type User } from '../api/auth.service';


// 1. "Доучиваем" интерфейс
interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (data: LoginData) => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    logout: () => Promise<void>;
    updateProfile: (data: UpdateProfileData) => Promise<void>;
    changePassword: (data: ChangePasswordData) => Promise<void>;
    deleteAccount: (data: DeleteAccountData) => Promise<void>;
    wishlist: Set<number>;
    isWishlistLoading: boolean;
    toggleWishlist: (rawgGameId: number) => Promise<void>;
    resetWishlistInContext: () => Promise<void>; // <-- НОВАЯ ФУНКЦИЯ
}


const AuthContext = createContext<AuthContextType | undefined>(undefined);


export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [wishlist, setWishlist] = useState<Set<number>>(new Set());
    const [isWishlistLoading, setIsWishlistLoading] = useState(false);

    // ... (useEffect [user] ... - без изменений)
    useEffect(() => {
        const checkUserStatus = async () => {
            setIsLoading(true);
            try {
                const userData = await authService.getMe();
                setUser(userData);
            } catch (error) {
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };
        checkUserStatus();
    }, []);

    useEffect(() => {
        if (user) {
            const fetchWishlist = async () => {
                setIsWishlistLoading(true);
                try {
                    const wishlistItems = await wishlistService.getWishlist();
                    const ids = wishlistItems.map(item => item.rawg_game_id);
                    setWishlist(new Set(ids));
                } catch (error) {
                    console.error("AuthContext: Failed to fetch wishlist", error);
                    setWishlist(new Set());
                } finally {
                    setIsWishlistLoading(false);
                }
            };
            fetchWishlist();
        }
        else {
            setWishlist(new Set());
        }
    }, [user]);

    // ... (login, register, logout, updateProfile, changePassword, deleteAccount ... - без изменений)
    const login = async (data: LoginData) => {
        try {
            const userData= await authService.login(data);
            setUser(userData);
        } catch (error: any) {
            setUser(null);
            throw error;
        }
    };

    const register = async (data: RegisterData) => {
        try {
            const userData= await authService.register(data);
            setUser(userData);
        } catch (error: any) {
            setUser(null);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await authService.logout();
            setUser(null);
        } catch (error) {
            setUser(null);
            console.error("Logout failed", error);
        }
    };

    const updateProfile = async (data: UpdateProfileData) => {
        const updatedUser = await authService.updateProfile(data);
        setUser(updatedUser);
    };

    const changePassword = async (data: ChangePasswordData) => {
        await authService.changePassword(data);
    };

    const deleteAccount = async (data: DeleteAccountData) => {
        await authService.deleteAccount(data);
        logout();
    };

    // ... (toggleWishlist - без изменений)
    const toggleWishlist = async (rawgGameId: number) => {
        if (!user) throw new Error("User must be logged in to toggle wishlist");
        const isInWishlist = wishlist.has(rawgGameId);
        try {
            if (isInWishlist) {
                await wishlistService.removeFromWishlist(rawgGameId);
                setWishlist(prevSet => {
                    const newSet = new Set(prevSet);
                    newSet.delete(rawgGameId);
                    return newSet;
                });
            } else {
                await wishlistService.addToWishlist(rawgGameId);
                setWishlist(prevSet => {
                    const newSet = new Set(prevSet);
                    newSet.add(rawgGameId);
                    return newSet;
                });
            }
        } catch (error) {
            console.error("AuthContext: Failed to toggle wishlist", error);
            throw error;
        }
    };

    const resetWishlistInContext = async () => {
        if (!user) throw new Error("User must be logged in to reset wishlist");

        try {
            await wishlistService.resetWishlist();
            setWishlist(new Set());

        } catch (error) {
            console.error("AuthContext: Failed to reset wishlist", error);
            throw error;
        }
    };

    // 3. "Выставляем" наружу
    const value = {
        user,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
        deleteAccount,
        wishlist,
        isWishlistLoading,
        toggleWishlist,
        resetWishlistInContext // <-- "Выставили"
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};