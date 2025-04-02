import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { api } from '../services/api';
import {
    Card,
    CardContent,
    Typography,
    CircularProgress,
    Box,
    ToggleButton,
    ToggleButtonGroup,
    Paper,
    Stack,
    Alert
} from '@mui/material';
import { TrendingUp, AccessTime } from '@mui/icons-material';

export const Posts: React.FC = () => {
    const [postType, setPostType] = useState<'popular' | 'latest'>('popular');
    
    const { data, isLoading, error } = useQuery(
        ['posts', postType],
        () => api.getPosts(postType),
        { keepPreviousData: true }
    );

    const handleTypeChange = (
        _event: React.MouseEvent<HTMLElement>,
        newType: 'popular' | 'latest' | null
    ) => {
        if (newType !== null) {
            setPostType(newType);
        }
    };

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Card>
                <CardContent>
                    <Alert severity="error">
                        Error loading posts. Please try again later.
                    </Alert>
                </CardContent>
            </Card>
        );
    }

    const posts = data?.posts || [];

    return (
        <Card>
            <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h5">
                        {postType === 'popular' ? 'Popular Posts' : 'Latest Posts'}
                    </Typography>
                    <ToggleButtonGroup
                        value={postType}
                        exclusive
                        onChange={handleTypeChange}
                        aria-label="post type"
                    >
                        <ToggleButton value="popular" aria-label="popular posts">
                            <TrendingUp sx={{ mr: 1 }} />
                            Popular
                        </ToggleButton>
                        <ToggleButton value="latest" aria-label="latest posts">
                            <AccessTime sx={{ mr: 1 }} />
                            Latest
                        </ToggleButton>
                    </ToggleButtonGroup>
                </Box>

                {posts.length === 0 ? (
                    <Alert severity="info">
                        No posts found for the selected filter.
                    </Alert>
                ) : (
                    <Stack spacing={3}>
                        {posts.map((post) => (
                            <Paper key={post.id} elevation={2} sx={{ p: 2 }}>
                                <Typography variant="h6" gutterBottom>
                                    {post.content}
                                </Typography>
                                <Typography color="textSecondary" variant="body2">
                                    Posted by {post.userName}
                                </Typography>
                                <Typography color="textSecondary" variant="body2">
                                    {post.commentCount} comments
                                </Typography>
                            </Paper>
                        ))}
                    </Stack>
                )}
            </CardContent>
        </Card>
    );
}; 