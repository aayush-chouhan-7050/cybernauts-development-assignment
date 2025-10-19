# API Documentation - Cybernauts User Network

## Base URL

```
Development: http://localhost:3001/api
Production: https://cybernauts-backend-qujq.onrender.com/api
```

**Live API Endpoint:** https://cybernauts-backend-qujq.onrender.com/api

**Health Check:** https://cybernauts-backend-qujq.onrender.com/

## Authentication

Currently, no authentication is required. All endpoints are publicly accessible.

## Response Format

All responses follow this structure:

**Success Response:**
```json
{
  "data": { ... },
  "message": "Success message (optional)"
}
```

**Error Response:**
```json
{
  "message": "Error description",
  "details": "Additional error information (optional)"
}
```

---

## Endpoints

### 1. Get All Users

Retrieves all users in the system with their complete information.

**Endpoint:** `GET /users`

**Request:**
```http
GET /api/users HTTP/1.1
Host: localhost:3001
```

**Response:** `200 OK`
```json
[
  {
    "_id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "Alice",
    "age": 25,
    "hobbies": ["coding", "music"],
    "friends": ["550e8400-e29b-41d4-a716-446655440001"],
    "createdAt": "2025-01-15T10:30:00.000Z",
    "position": { "x": 150, "y": 200 }
  },
  {
    "_id": "550e8400-e29b-41d4-a716-446655440001",
    "username": "Bob",
    "age": 30,
    "hobbies": ["sports", "coding"],
    "friends": ["550e8400-e29b-41d4-a716-446655440000"],
    "createdAt": "2025-01-15T11:00:00.000Z",
    "position": { "x": 350, "y": 200 }
  }
]
```

---

### 2. Create User

Creates a new user in the system. All fields are required as per assignment specifications.

**Endpoint:** `POST /users`

**Request:**
```http
POST /api/users HTTP/1.1
Host: localhost:3001
Content-Type: application/json

{
  "username": "Charlie",
  "age": 28,
  "hobbies": ["art", "music", "cooking"]
}
```

**Request Body Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| friendId | string | Yes | Second user's UUID |

**Response:** `200 OK`
```json
{
  "message": "Users unlinked successfully"
}
```

**Behavior:**
- Removes friendship from both users
- Safe to call even if friendship doesn't exist (idempotent)
- Triggers popularity score recalculation for both users
- Allows user deletion after unlinking

**Error Response:** `404 Not Found`
```json
{
  "message": "One or both users not found."
}
```

---

### 7. Get Graph Data

Returns formatted data for React Flow graph visualization including nodes and edges with popularity scores.

**Endpoint:** `GET /graph`

**Request:**
```http
GET /api/graph HTTP/1.1
Host: localhost:3001
```

**Query Parameters (Optional):**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number | 1 | Page number for pagination |
| limit | number | 100 | Users per page |
| includeConnections | boolean | true | Include cross-page connections |

**Examples:**
```http
# Get first page with 50 users
GET /api/graph?page=1&limit=50

# Get second page
GET /api/graph?page=2&limit=50

# Get without connections (faster)
GET /api/graph?includeConnections=false
```

**Response:** `200 OK`
```json
{
  "nodes": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "type": "highScoreNode",
      "data": {
        "label": "Alice",
        "age": 25,
        "hobbies": ["coding", "music"],
        "popularityScore": 6.5
      },
      "position": {
        "x": 150,
        "y": 200
      }
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "type": "lowScoreNode",
      "data": {
        "label": "Bob",
        "age": 30,
        "hobbies": ["sports", "coding"],
        "popularityScore": 2.5
      },
      "position": {
        "x": 350,
        "y": 200
      }
    }
  ],
  "edges": [
    {
      "id": "e-550e8400-e29b-41d4-a716-446655440000-550e8400-e29b-41d4-a716-446655440001",
      "source": "550e8400-e29b-41d4-a716-446655440000",
      "target": "550e8400-e29b-41d4-a716-446655440001"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 100,
    "total": 200,
    "totalPages": 2,
    "hasMore": true
  }
}
```

**Node Types (As Per Assignment):**
- `highScoreNode`: popularityScore > 5
- `lowScoreNode`: popularityScore ≤ 5

**Popularity Score Calculation (As Per Assignment):**
```
popularityScore = numberOfFriends + (totalSharedHobbies × 0.5)
```

Where:
- `numberOfFriends`: Count of direct friends
- `totalSharedHobbies`: Sum of hobbies shared with each friend

**Example Calculation:**
```
User A has 2 friends:
- Friend 1: shares "coding" and "music" (2 hobbies)
- Friend 2: shares "coding" (1 hobby)

Score = 2 friends + (3 shared hobbies × 0.5)
Score = 2 + 1.5 = 3.5
```

**Detailed Example:**
```
Alice: hobbies = ["coding", "music", "art"]
Bob: hobbies = ["coding", "music"]
Charlie: hobbies = ["music", "art"]

Alice links to Bob and Charlie:
- Shared with Bob: "coding", "music" (2 hobbies)
- Shared with Charlie: "music", "art" (2 hobbies)

Alice's score = 2 friends + (4 shared hobbies × 0.5) = 4.0
```

**Performance:**
- Cached for 2 minutes in Redis (if enabled)
- Optimized for large datasets with pagination
- Includes cross-page connections when requested

---

## Pagination Support

The graph endpoint supports pagination for handling large datasets efficiently.

**Benefits:**
- Faster initial load times
- Reduced memory usage
- Better performance with 100+ users
- Supports lazy loading in frontend

**Usage:**
```bash
# Load first 50 users
GET /api/graph?page=1&limit=50

# Load next 50 users
GET /api/graph?page=2&limit=50
```

**See [SEED_DATA_GUIDE.md](./SEED_DATA_GUIDE.md) for testing with large datasets.**

---

## Status Codes

| Code | Status | Description |
|------|--------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request parameters or validation error |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Business rule violation (e.g., delete user with friends) |
| 500 | Internal Server Error | Server error |

---

## Error Handling

### Validation Errors (400)
Returned when:
- Required fields are missing
- Data types are incorrect
- Values are out of valid range

**Example:**
```json
{
  "message": "Validation Error",
  "details": "age must be a positive number"
}
```

### Not Found Errors (404)
Returned when:
- User ID doesn't exist
- Resource cannot be located

**Example:**
```json
{
  "message": "User not found"
}
```

### Conflict Errors (409)
Returned when:
- Attempting to delete a user with active friendships
- Business rule violations

**Example (As Per Assignment Requirement):**
```json
{
  "message": "User cannot be deleted while they have friends. Please unlink them first."
}
```

### Internal Server Errors (500)
Returned when:
- Database connection fails
- Unexpected server errors occur

---

## Rate Limiting

Currently, no rate limiting is implemented. For production use, consider implementing rate limiting to prevent abuse.

**Recommended:**
- 100 requests per minute per IP
- 1000 requests per hour per IP

---

## CORS

CORS is enabled for specified origins:

**Development:**
```
Origin: http://localhost:5173
```

**Production:**
```
Origin: https://cybernauts-development-assignment.vercel.app
```

---

## Examples

### Complete User Flow Example

**1. Create two users**
```bash
# Create Alice
curl -X POST https://cybernauts-backend-qujq.onrender.com/api/users \
  -H "Content-Type: application/json" \
  -d '{"username":"Alice","age":25,"hobbies":["coding","music"]}'

# Response:
# {"_id":"550e8400-...","username":"Alice",...}

# Create Bob
curl -X POST https://cybernauts-backend-qujq.onrender.com/api/users \
  -H "Content-Type: application/json" \
  -d '{"username":"Bob","age":30,"hobbies":["coding","sports"]}'

# Response:
# {"_id":"660e8400-...","username":"Bob",...}
```

**2. Link them as friends**
```bash
curl -X POST https://cybernauts-backend-qujq.onrender.com/api/users/ALICE_ID/link \
  -H "Content-Type: application/json" \
  -d '{"friendId":"BOB_ID"}'

# Response:
# {"message":"Users linked successfully"}
```

**3. Get graph data**
```bash
curl https://cybernauts-backend-qujq.onrender.com/api/graph

# Response shows both users connected with calculated scores
```

**4. Try to delete Alice (will fail - As Per Assignment)**
```bash
curl -X DELETE https://cybernauts-backend-qujq.onrender.com/api/users/ALICE_ID

# Response: 409 Conflict
# {"message":"User cannot be deleted while they have friends. Please unlink them first."}
```

**5. Unlink users first**
```bash
curl -X DELETE https://cybernauts-backend-qujq.onrender.com/api/users/ALICE_ID/unlink \
  -H "Content-Type: application/json" \
  -d '{"friendId":"BOB_ID"}'

# Response:
# {"message":"Users unlinked successfully"}
```

**6. Now delete Alice (will succeed)**
```bash
curl -X DELETE https://cybernauts-backend-qujq.onrender.com/api/users/ALICE_ID

# Response: 200 OK
# {"message":"User deleted successfully"}
```

---

## Postman Collection

A complete Postman collection is available for easy API testing.

**Import:** [Cybernauts-API.postman_collection.json](./Cybernauts-API.postman_collection.json)

**Collection includes:**
- All CRUD operations
- Relationship management
- Graph data retrieval
- Pre-configured test scenarios
- Environment variables setup

**Variables to set:**
- `baseUrl`: `http://localhost:3001/api` (development) or production URL
- `userId`: User ID from created user
- `friendId`: Friend's user ID

**Pre-configured Test Scenarios:**
1. Complete User Flow (create → link → unlink → delete)
2. Popularity Score Testing
3. Error Handling Validation
4. Pagination Testing

---

## WebSocket / Real-time Updates

Currently, the API uses HTTP polling. For real-time updates across multiple clients, Redis pub/sub is used for server-side state synchronization.

**Future Enhancement:** WebSocket support for real-time client notifications.

---

## Performance Optimization

### Caching (Redis)

When Redis is enabled, API responses are cached:

| Endpoint | Cache Duration | Cache Key |
|----------|----------------|-----------|
| `GET /users` | 5 minutes | `users:all` |
| `GET /graph` | 2 minutes | `graph:{page}:{limit}` |
| `GET /users/stats` | 5 minutes | `stats:overview` |

**Cache Invalidation:**
- Automatic on mutations (create, update, delete, link, unlink)
- TTL-based expiration
- Pattern-based invalidation

### Clustering

The backend uses Node.js clustering to utilize all CPU cores:

```javascript
// Automatically forks workers based on CPU count
Workers: 4 (on 4-core machine)
```

**Benefits:**
- 4x request handling capacity
- Load balancing across workers
- Fault tolerance (worker auto-restart)
- State synchronization via Redis

---

## Testing the API

### Using curl

```bash
# Health check
curl https://cybernauts-backend-qujq.onrender.com/

# Get all users
curl https://cybernauts-backend-qujq.onrender.com/api/users

# Create user
curl -X POST https://cybernauts-backend-qujq.onrender.com/api/users \
  -H "Content-Type: application/json" \
  -d '{"username":"TestUser","age":25,"hobbies":["testing"]}'
```

### Using Postman

1. Import the collection: `Cybernauts-API.postman_collection.json`
2. Set environment variables
3. Run individual requests or entire test suites

### Using the Test Suite

```bash
cd cybernauts-backend
npm test
```

**55+ automated tests cover:**
- All API endpoints
- Business logic
- Error scenarios
- Edge cases
- Performance

---

## API Versioning

Current version: **v1** (implicit)

Future versions will use URL versioning:
```
/api/v2/users
```

---

## Security Considerations

**Current Implementation:**
- Input validation on all endpoints
- CORS protection
- Prevents SQL injection (using MongoDB ODM)
- Error messages don't expose sensitive data

**Production Recommendations:**
- Add JWT authentication
- Implement rate limiting
- Add request size limits
- Use HTTPS only
- Add API key authentication
- Implement request logging
- Add input sanitization

---

## Debugging

### Enable Debug Logs

```bash
# Backend logs
DEBUG=* npm run dev

# View Redis operations
REDIS_LOG=true npm run dev
```

### Check Health

```bash
curl https://cybernauts-backend-qujq.onrender.com/

# Response shows worker ID and Redis status
{
  "status": "API is running",
  "worker": 91,
  "redis": "connected"
}
```

---

## Support

For issues or questions:
- Check [TESTING_GUIDE.md](./TESTING_GUIDE.md)
- Review [DEPLOYMENT.md](./DEPLOYMENT.md)
- See [QUICKSTART.md](./QUICKSTART.md)

---
  
**API Version**: 1.0  
**Assignment**: Cybernauts Development Assignment Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| username | string | **Yes** | User's display name (min 1 character) |
| age | number | **Yes** | User's age (positive integer) |
| hobbies | string[] | **Yes** | Array of hobby strings (can be empty array) |

**Response:** `201 Created`
```json
{
  "_id": "550e8400-e29b-41d4-a716-446655440002",
  "username": "Charlie",
  "age": 28,
  "hobbies": ["art", "music", "cooking"],
  "friends": [],
  "createdAt": "2025-01-15T12:00:00.000Z",
  "position": { "x": 200, "y": 300 }
}
```

**Error Response:** `400 Bad Request`
```json
{
  "message": "Validation Error",
  "details": "username is required"
}
```

**Validation Rules:**
- Username: Required, non-empty string
- Age: Required, positive number
- Hobbies: Required array (can be empty)

---

### 3. Update User

Updates an existing user's information. All fields are optional.

**Endpoint:** `PUT /users/:id`

**Request:**
```http
PUT /api/users/550e8400-e29b-41d4-a716-446655440000 HTTP/1.1
Host: localhost:3001
Content-Type: application/json

{
  "age": 26,
  "hobbies": ["coding", "music", "photography"]
}
```

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | User's UUID |

**Request Body Parameters (all optional):**

| Field | Type | Description |
|-------|------|-------------|
| username | string | Updated username |
| age | number | Updated age |
| hobbies | string[] | Updated hobbies array |
| position | object | Updated node position {x, y} |

**Response:** `200 OK`
```json
{
  "_id": "550e8400-e29b-41d4-a716-446655440000",
  "username": "Alice",
  "age": 26,
  "hobbies": ["coding", "music", "photography"],
  "friends": ["550e8400-e29b-41d4-a716-446655440001"],
  "createdAt": "2025-01-15T10:30:00.000Z",
  "position": { "x": 150, "y": 200 }
}
```

**Error Response:** `404 Not Found`
```json
{
  "message": "User not found"
}
```

**Business Logic:**
- Updating hobbies triggers popularity score recalculation
- Hobbies are automatically normalized (trimmed and lowercased)

---

### 4. Delete User

Deletes a user from the system. **User must not have any friends** (as per assignment requirement).

**Endpoint:** `DELETE /users/:id`

**Request:**
```http
DELETE /api/users/550e8400-e29b-41d4-a716-446655440002 HTTP/1.1
Host: localhost:3001
```

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | User's UUID |

**Response:** `200 OK`
```json
{
  "message": "User deleted successfully"
}
```

**Error Response:** `409 Conflict`
```json
{
  "message": "User cannot be deleted while they have friends. Please unlink them first."
}
```

**Error Response:** `404 Not Found`
```json
{
  "message": "User not found"
}
```

**Business Rule (As Per Assignment):**
> A user cannot be deleted while still connected as a friend to others — must unlink first.

This prevents orphaned relationships and maintains data integrity.

---

### 5. Link Users (Create Friendship)

Creates a **mutual friendship** between two users (A→B and B→A as one connection).

**Endpoint:** `POST /users/:id/link`

**Request:**
```http
POST /api/users/550e8400-e29b-41d4-a716-446655440000/link HTTP/1.1
Host: localhost:3001
Content-Type: application/json

{
  "friendId": "550e8400-e29b-41d4-a716-446655440001"
}
```

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | First user's UUID |

**Request Body Parameters:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| friendId | string | **Yes** | Second user's UUID |

**Response:** `200 OK`
```json
{
  "message": "Users linked successfully"
}
```

**Behavior:**
- Creates bidirectional friendship (A→B and B→A)
- Prevents duplicate links
- Prevents self-linking
- Triggers popularity score recalculation for both users

**Business Rules (As Per Assignment):**
> Circular Friendship Prevention: Prevent A → B and B → A from being stored as separate links (treat as one mutual connection).

**Error Response:** `404 Not Found`
```json
{
  "message": "One or both users not found."
}
```

**Error Response:** `400 Bad Request`
```json
{
  "message": "friendId is required in the body"
}
```

**Error Response:** `500 Internal Server Error`
```json
{
  "message": "Users cannot link to themselves."
}
```

---

### 6. Unlink Users (Remove Friendship)

Removes a mutual friendship between two users.

**Endpoint:** `DELETE /users/:id/unlink`

**Request:**
```http
DELETE /api/users/550e8400-e29b-41d4-a716-446655440000/unlink HTTP/1.1
Host: localhost:3001
Content-Type: application/json

{
  "friendId": "550e8400-e29b-41d4-a716-446655440001"
}
```

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | First user's UUID |

**Request Body