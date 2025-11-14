import apiClient from './index';

export interface WishlistItem {
    id: number;
    user_id: number;
    rawg_game_id: number;
    added_on: string;
}

export async function getWishlist(): Promise<WishlistItem[]> {
    try {
        const response = await apiClient.get<WishlistItem[]>('/wishlist/');
        return response.data;
    } catch (error: any) {
        console.error("Failed to fetch wishlist:", error);
        throw new Error('Failed to fetch wishlist.');
    }
}

export async function addToWishlist(rawgGameId: number): Promise<WishlistItem> {
    try {
        const response = await apiClient.post<WishlistItem>('/wishlist/', {
            rawg_game_id: rawgGameId,
        });
        return response.data;
    } catch (error: any){
        console.error(`Failed to add game ${rawgGameId} to wishlist:`, error);
        throw new Error('Failed to add game to wishlist.');
    }
}

export async function removeFromWishlist(rawgGameId: number): Promise<void> {
    try {
        await apiClient.delete(`/wishlist/${rawgGameId}`);
    } catch (error: any) {
        console.error(`Failed to remove game ${rawgGameId} from wishlist:`, error);
        throw new Error('Failed to remove game from wishlist.');
    }
}

export async function resetWishlist(): Promise<void> {
    try {
        await apiClient.delete('/wishlist/');
    } catch (error: any) {
        console.error("Failed to reset wishlist:", error);
        throw new Error('Failed to reset wishlist.');
    }
}