
import apiClient from './index';


export interface User {
    id: number;
    username: string;
    email: string;
}

export interface LoginData {
    username?: string;
    email?: string;
    password: string;
}


export interface RegisterData {
    username: string;
    email: string;
    password: string;
}




export const login = async (data: LoginData) => {
    try {
        const response = await apiClient.post<User>('/auth/login', data);
        return response.data;

    } catch (err: any) {
        if (err.response && err.response.data && err.response.data.error) {
            throw new Error(err.response.data.error);
        }
        throw new Error('Сервер не отвечает');
    }
};

export const register = async (data: RegisterData) => {
    try {
        const response = await apiClient.post<User>('/auth/register', data);
        return response.data;

    } catch (err: any) {
        if (err.response && err.response.data) {
            throw new Error(err.response.data.error || 'Ошибка регистрации');
        }
        throw new Error('Сервер не отвечает');
    }


};
export const getMe = async (): Promise<User> => {
    try {
        const response = await apiClient.get<User>('/auth/me');
        return response.data;
    } catch (err) {
        throw new Error('Failed to fetch user');
    }
};

export const logout = async (): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>('/auth/logout');
    return response.data;
};



export interface UpdateProfileData {
    username?: string;
    email?: string;
}


export interface ChangePasswordData {
    old_password: string;
    new_password: string;
}

export interface DeleteAccountData {
    password: string;
}

export const updateProfile = async (data: UpdateProfileData): Promise<User> => {
    try {
        const response = await apiClient.patch<User>('/auth/me', data);
        return response.data;
    } catch (err: any) {
        if (err.response && err.response.data && err.response.data.error) {
            throw new Error(err.response.data.error);
        }
        throw new Error('Сервер не отвечает');
    }
};


export const changePassword = async (data: ChangePasswordData): Promise<void> => {
    try {
        await apiClient.put('/auth/me/password', data);
    } catch (err: any) {
        if (err.response && err.response.data && err.response.data.error) {
            throw new Error(err.response.data.error);
        }
        throw new Error('Сервер не отвечает');
    }
};

export const deleteAccount = async (data: DeleteAccountData): Promise<void> => {
    try {
        await apiClient.delete('/auth/me', { data });
    } catch (err: any) {
        if (err.response && err.response.data && err.response.data.error) {
            throw new Error(err.response.data.error);
        }
        throw new Error('Сервер не отвечает');
    }
};