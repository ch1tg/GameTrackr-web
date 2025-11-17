import apiClient from './index';
import type {Game} from './game.service';

export interface SearchedUser {
    username: string;
}

export interface SearchAllResponse {
    users: SearchedUser[];
    games: Game[];
}

export interface SearchUsersResponse {
    users: SearchedUser[];
    total_count: number;
    current_page: number;
    total_pages: number;
}


export interface SearchGamesResponse {
    games: Game[];
    nextPage: number | null;
}

export async function searchAll(
    q: string,
    userLimit: number,
    gameLimit: number
): Promise<SearchAllResponse> {

    const params = new URLSearchParams();
    params.append('q', q);
    params.append('user_limit', String(userLimit));
    params.append('game_limit', String(gameLimit));

    try {
        const response = await apiClient.get<SearchAllResponse>(`/search?${params.toString()}`);
        return response.data;
    } catch (error: any) {
        console.error('Failed to fetch universal search results:', error);
        throw new Error('Failed to fetch search results');
    }
}

export async function searchUsers(
    q: string,
    page: number,
    limit: number
): Promise<SearchUsersResponse> {

    const params = new URLSearchParams();
    params.append('q', q);
    params.append('page', String(page));
    params.append('limit', String(limit));

    try {
        console.log(`/search/users?${params.toString()}`)
        const response = await apiClient.get<SearchUsersResponse>(`/search/users?${params.toString()}`);
        return response.data;
    } catch (error: any) {
        console.error('Failed to fetch user search results:', error);
        throw new Error('Failed to fetch user search results');
    }
}

export async function searchGames(
    q: string,
    page: number,
    limit: number
): Promise<SearchGamesResponse> {

    const params = new URLSearchParams();
    params.append('q', q);
    params.append('page', String(page));
    params.append('limit', String(limit));

    try {
        const response = await apiClient.get<SearchGamesResponse>(`/search/games?${params.toString()}`);
        return response.data;
    } catch (error: any) {
        console.error('Failed to fetch game search results:', error);
        throw new Error('Failed to fetch game search results');
    }
}