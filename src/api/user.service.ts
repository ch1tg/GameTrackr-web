import apiClient from './index';
import type { Game } from './game.service';


export interface PublicUser {
    id: number;
    username: string;
    registered_on: string;

}
interface GetWishlistParams {
    page?: number;
    limit?: number;
}
export interface WishlistApiResponse {
    games: Game[];
    hasNextPage: boolean;
}

export async function getWishlistByUsername(
    username: string,
    params: GetWishlistParams = {}
): Promise<WishlistApiResponse> { // <-- 3. Используем НОВЫЙ тип

    const queryParams = new URLSearchParams();
    if (params.page) {
        queryParams.append('page', String(params.page));
    }
    if (params.limit) {
        queryParams.append('limit', String(params.limit));
    }

    try {
        const response = await apiClient.get<WishlistApiResponse>(
            `/users/${username}/wishlist?${queryParams.toString()}`
        );
        return response.data;
    } catch (error: any) {
        console.error(`Failed to fetch wishlist for ${username}:`, error);
        throw new Error('Failed to fetch wishlist.');
    }
}

export const getUserByUsername = async (username: string): Promise<PublicUser> => {
    try {
        const response = await apiClient.get<PublicUser>(`/users/${username}`);
        return response.data;
    } catch (err: any) {
        if (err.response && err.response.data && err.response.data.error) {
            throw new Error(err.response.data.error);
        }
        throw new Error('Не удалось загрузить профиль пользователя');
    }
};



