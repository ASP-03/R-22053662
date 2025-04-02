import React from 'react';
import { useQuery } from 'react-query';
import { api } from '../services/api';
import {
    Card,
    CardContent,
    Typography,
    List,
    ListItem,
    ListItemText,
    CircularProgress,
    Box
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export const TopUsers: React.FC = () => {
    const { data, isLoading, error } = useQuery('topUsers', api.getTopUsers);

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Typography color="error" align="center">
                Error loading top users
            </Typography>
        );
    }

    if (!data?.topUsers || data.topUsers.length === 0) {
        return (
            <Card>
                <CardContent>
                    <Typography align="center">
                        No users found
                    </Typography>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardContent>
                <Typography variant="h5" gutterBottom>
                    Top Users by Post Count
                </Typography>
                
                <Box height={300} mb={4}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data.topUsers}>
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="postCount" fill="#8884d8" />
                        </BarChart>
                    </ResponsiveContainer>
                </Box>

                <List>
                    {data.topUsers.map((user) => (
                        <ListItem key={user.id}>
                            <ListItemText
                                primary={user.name}
                                secondary={`${user.postCount} posts`}
                            />
                        </ListItem>
                    ))}
                </List>
            </CardContent>
        </Card>
    );
}; 