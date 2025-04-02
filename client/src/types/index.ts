export interface User {
    id: string;
    name: string;
    postCount: number;
}

export interface Post {
    id: number;
    content: string;
    userName: string;
    commentCount: number;
}

export interface TopUsersResponse {
    topUsers: User[];
}

export interface PostsResponse {
    posts: Post[];
} 