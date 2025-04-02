# Social Media Analytics Microservice

This microservice provides analytics endpoints for a social media platform, offering insights about users and posts.


## Features

- Get top 5 users with the highest number of posts
- Get popular posts (posts with maximum comments)
- Get latest 5 posts
- Built-in caching mechanism
- Rate limiting to prevent abuse
- CORS enabled

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the server:
   ```bash
   npm start
   ```

   For development with auto-reload:
   ```bash
   npm run dev
   ```

## API Endpoints

### 1. Get Top Users
```
GET /users
```
Returns the top 5 users with the highest number of posts.

Response format:
```json
{
  "topUsers": [
    {
      "id": "string",
      "name": "string",
      "postCount": number
    }
  ]
}
```

### 2. Get Posts
```
GET /posts?type=popular|latest
```
Query Parameters:
- `type`: (optional) Either "popular" or "latest". Defaults to "popular"
  - popular: Returns posts with the maximum number of comments
  - latest: Returns the 5 most recent posts

Response format:
```json
{
  "posts": [
    {
      "id": number,
      "content": "string",
      "userName": "string",
      "commentCount": number
    }
  ]
}
```

## Performance Considerations

- Caching is implemented with a 5-minute TTL
- Rate limiting is set to 100 requests per 15 minutes per IP
- Efficient data retrieval with minimal API calls
- Response data is optimized to include only necessary fields

## Error Handling

The API returns appropriate HTTP status codes:
- 200: Successful request
- 500: Internal server error

All errors include a JSON response with an error message. #   2 2 0 5 3 6 6 2 
 
 