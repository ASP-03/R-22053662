const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const NodeCache = require('node-cache');
const axios = require('axios');

const app = express();
const cache = new NodeCache({ stdTTL: 300 }); // Cache for 5 minutes

// Middleware
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Base API URL
const BASE_API_URL = 'http://20.244.56.144/evaluation-service';

// Authentication credentials
const credentials = {
    email: "22053662@kiit.ac.in",
    name: "ankit sandeep pandey",
    rollNo: "22053662",
    accessCode: "nwpwrZ",
    clientID: "556c9d0a-fba3-4deb-aaae-86e811fa643c",
    clientSecret: "ADHgrNkbQXrCAcAJ"
};

// Create axios instance
const api = axios.create({
    baseURL: BASE_API_URL
});

// Function to get authentication token
async function getAuthToken() {
    try {
        const response = await axios.post(`${BASE_API_URL}/auth`, credentials);
        return response.data.token_type + ' ' + response.data.access_token;
    } catch (error) {
        console.error('Error getting auth token:', error.response?.data || error.message);
        throw error;
    }
}

// Middleware to ensure valid auth token
const ensureAuthToken = async (req, res, next) => {
    try {
        const token = await getAuthToken();
        api.defaults.headers.common['Authorization'] = token;
        next();
    } catch (error) {
        next(error);
    }
};

// Error handler middleware
const errorHandler = (error, req, res, next) => {
    console.error('API Error:', error.response?.data || error.message);
    if (error.response) {
        // External API error
        res.status(error.response.status).json({
            error: 'External API error',
            message: error.response.data?.message || 'An error occurred while fetching data'
        });
    } else if (error.request) {
        // Network error
        res.status(503).json({
            error: 'Network error',
            message: 'Unable to reach the external service'
        });
    } else {
        // Other errors
        res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
};

// Cache middleware
const cacheMiddleware = (duration) => {
    return (req, res, next) => {
        const key = req.originalUrl;
        const cachedResponse = cache.get(key);

        if (cachedResponse) {
            return res.json(cachedResponse);
        }
        res.originalJson = res.json;
        res.json = (body) => {
            cache.set(key, body, duration);
            res.originalJson(body);
        };
        next();
    };
};

// Get top users (users with highest number of posts)
app.get('/users', ensureAuthToken, cacheMiddleware(300), async (req, res, next) => {
    try {
        // Get all users
        const usersResponse = await api.get('/users');
        if (!usersResponse.data?.users) {
            return res.status(404).json({ error: 'No users found' });
        }
        const users = usersResponse.data.users;

        // Get posts for each user
        const userPostCounts = {};
        for (const [id, name] of Object.entries(users)) {
            try {
                const postsResponse = await api.get(`/users/${id}/posts`);
                userPostCounts[id] = {
                    name,
                    postCount: postsResponse.data?.posts?.length || 0
                };
            } catch (error) {
                console.error(`Error fetching posts for user ${id}:`, error);
                userPostCounts[id] = {
                    name,
                    postCount: 0
                };
            }
        }

        // Sort users by post count and get top 5
        const topUsers = Object.entries(userPostCounts)
            .sort(([, a], [, b]) => b.postCount - a.postCount)
            .slice(0, 5)
            .map(([id, data]) => ({
                id,
                name: data.name,
                postCount: data.postCount
            }));

        res.json({ topUsers });
    } catch (error) {
        next(error);
    }
});

// Get top/latest posts
app.get('/posts', ensureAuthToken, cacheMiddleware(300), async (req, res, next) => {
    try {
        const { type = 'popular' } = req.query;
        
        // Get all users first
        const usersResponse = await api.get('/users');
        if (!usersResponse.data?.users) {
            return res.status(404).json({ error: 'No users found' });
        }
        const users = usersResponse.data.users;

        // Collect all posts with their comments
        let allPosts = [];
        for (const [userId, userName] of Object.entries(users)) {
            try {
                const postsResponse = await api.get(`/users/${userId}/posts`);
                const userPosts = postsResponse.data?.posts || [];

                for (const post of userPosts) {
                    try {
                        const commentsResponse = await api.get(`/posts/${post.id}/comments`);
                        allPosts.push({
                            ...post,
                            userName,
                            commentCount: commentsResponse.data?.comments?.length || 0,
                            comments: commentsResponse.data?.comments || []
                        });
                    } catch (error) {
                        console.error(`Error fetching comments for post ${post.id}:`, error);
                        allPosts.push({
                            ...post,
                            userName,
                            commentCount: 0,
                            comments: []
                        });
                    }
                }
            } catch (error) {
                console.error(`Error fetching posts for user ${userId}:`, error);
            }
        }

        if (allPosts.length === 0) {
            return res.json({ posts: [] });
        }

        let result;
        if (type === 'popular') {
            // Sort by comment count and get posts with maximum comments
            const maxComments = Math.max(...allPosts.map(post => post.commentCount));
            result = allPosts
                .filter(post => post.commentCount === maxComments)
                .map(({ id, content, userName, commentCount }) => ({
                    id,
                    content,
                    userName,
                    commentCount
                }));
        } else if (type === 'latest') {
            // Sort by post ID (assuming higher ID means newer post) and get latest 5
            result = allPosts
                .sort((a, b) => b.id - a.id)
                .slice(0, 5)
                .map(({ id, content, userName, commentCount }) => ({
                    id,
                    content,
                    userName,
                    commentCount
                }));
        }

        res.json({ posts: result });
    } catch (error) {
        next(error);
    }
});

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 