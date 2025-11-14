import apiClient from './index';

export interface Game {
    id: number;
    name: string;
    background_image: string;
    metacritic: number | null;
    parent_platforms: string[];
}
export interface GameDetail {
    id: number;
    name: string;
    description: string;
    metacritic: number | null;
    released: string;
    background_image: string;
    website: string;
    genres: string[];
    platforms: string[];
}

interface GetGamesParams {
    page: number;
    ordering: string;
    platform?: string;
}
export interface PaginatedGameResponse {
    games: Game[];
    nextPage: number | null;
}
export async function getGameDetails(id: string | number): Promise<GameDetail> {
    try {
        const response = await apiClient.get<GameDetail>(`/games/${id}`);
        return response.data;
    } catch (error: any) {
        console.error(`Failed to fetch game details for ID ${id}:`, error);
        throw new Error('Failed to fetch game details');
    }
}
export async function getTrendingGames({
                                           page = 1,
                                           ordering,
                                           platform,
                                       }: GetGamesParams): Promise<PaginatedGameResponse> {
    const params = new URLSearchParams();
    params.append('page', String(page));
    params.append('ordering', ordering);

    if (platform) {
        params.append('platform', platform);
    }

    try {
        // 4. Передаем параметры в запрос
        const response = await apiClient.get<PaginatedGameResponse>(`/games/trending?${params.toString()}`);
        return response.data;
    } catch (error: any) {
        console.error('Failed to fetch trending games:', error);
        throw new Error('Failed to fetch trending games');
    }
}