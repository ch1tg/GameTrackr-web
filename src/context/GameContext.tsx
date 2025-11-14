import React, { createContext, useState, useContext } from 'react';
import type { ReactNode } from 'react'; // <-- Исправление 1
import type { SetStateAction } from 'react';
import type { Dispatch } from 'react';
import * as gameService from '../api/game.service';

interface GameContextType {
    games: gameService.Game[];
    setGames: Dispatch<SetStateAction<gameService.Game[]>>;
    isLoading: boolean;
    isFetchingMore: boolean;
    page: number;
    setPage: Dispatch<SetStateAction<number>>;
    hasNextPage: boolean;
    setHasNextPage: Dispatch<SetStateAction<boolean>>;
    error: string | null;
    ordering: string;
    setOrdering: Dispatch<SetStateAction<string>>;
    platform: string;
    setPlatform: Dispatch<SetStateAction<string>>;
    fetchGames: (pageNum: number, currentOrdering: string, currentPlatform: string) => Promise<void>;
    loadMoreGames: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [games, setGames] = useState<gameService.Game[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFetchingMore, setIsFetchingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [hasNextPage, setHasNextPage] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [ordering, setOrdering] = useState<string>('-added');
    const [platform, setPlatform] = useState<string>('');

    const fetchGames = async (pageNum: number, currentOrdering: string, currentPlatform: string) => {
        if (pageNum === 1) {
            setIsLoading(true);
            setError(null);
        } else {
            setIsFetchingMore(true);
        }

        try {
            const data = await gameService.getTrendingGames({
                page: pageNum,
                ordering: currentOrdering,
                platform: currentPlatform || undefined,
            });

            setGames(prevGames => {
                const newGames = data.games.filter(
                    g => !(prevGames.map(pg => pg.id).includes(g.id))
                );
                return pageNum === 1 ? data.games : [...prevGames, ...newGames];
            });

            setPage(pageNum);
            setHasNextPage(data.nextPage !== null);

        } catch (err: any) {
            console.error("GameContext: Failed to fetch games:", err);
            setError("Failed to load games. Try refreshing.");
        } finally {
            setIsLoading(false);
            setIsFetchingMore(false);
        }
    };

    const loadMoreGames = () => {
        if (isLoading || isFetchingMore || !hasNextPage) return;
        fetchGames(page + 1, ordering, platform);
    };
    // --- КОНЕЦ ЛОГИКИ ---

    const value = {
        games,
        setGames,
        isLoading,
        isFetchingMore,
        page,
        setPage,
        hasNextPage,
        setHasNextPage,
        error,
        ordering,
        setOrdering,
        platform,
        setPlatform,
        fetchGames,
        loadMoreGames
    };

    return (
        <GameContext.Provider value={value}>
            {children}
        </GameContext.Provider>
    );
};

export const useGame = () => {
    const context = useContext(GameContext);
    if (context === undefined) {
        throw new Error('useGame must be used within a GameProvider');
    }
    return context;
};