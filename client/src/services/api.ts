import axios from 'axios';
import { TopUsersResponse, PostsResponse } from '../types';

const API_BASE_URL = 'http://localhost:3001';

export const api = {
    getTopUsers: async (): Promise<TopUsersResponse> => {
        const response = await axios.get(`${API_BASE_URL}/users`);
        return response.data;
    },

    getPosts: async (type: 'popular' | 'latest'): Promise<PostsResponse> => {
        const response = await axios.get(`${API_BASE_URL}/posts`, {
            params: { type }
        });
        return response.data;
    }
}; 