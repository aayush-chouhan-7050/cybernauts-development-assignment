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

Retrieves all users in the system.

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
    "createdAt": "2025-01-15T10:30:00.000Z"
  },
  {
    "_id": "550e8400-e29b-41d4-a716-446655440001",
    "username": "Bob",
    "age": 30,
    "hobbies": ["sports", "coding"],
    "friends": ["550e8400-e29b-41d4-a716-446655440000"],
    "createdAt": "2025-01-15T11:00:00.000Z"
  }
]
```

---

### 2. Create User

Creates a new user in the system.

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
| username | string | Yes | User's display name (min 1 character) |
| age | number | Yes | User's age (positive integer) |
| hobbies | string[] | Yes | Array of hobby strings (can be empty) |

**Response:** `201 Created`
```json
{
  "_id": "550e8400-e29b-41d4-a716-446655440002",
  "username": "Charlie",
  "age": 28,
  "hobbies": ["art", "music", "cooking"],
  "friends": [],
  "createdAt": "2025-01-15T12:00:00.000Z"
}
```

**Error Response:** `400 Bad Request`
```json
{
  "message": "Validation Error",
  "details": "username is required"
}
```

---

### 3. Update User

Updates an existing user's information.

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

**Response:** `200 OK`
```json
{
  "_id": "550e8400-e29b-41d4-a716-446655440000",
  "username": "Alice",
  "age": 26,
  "hobbies": ["coding", "music", "photography"],
  "friends": ["550e8400-e29b-41d4-a716-446655440001"],
  "createdAt": "2025-01-15T10:30:00.000Z"
}
```

**Error Response:** `404 Not Found`
```json
{
  "message": "User not found"
}
```

---

### 4. Delete User

Deletes a user from the system. User must not have any friends.

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

---

### 5. Link Users (Create Friendship)

Creates a mutual friendship between two users.

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
| friendId | string | Yes | Second user's UUID |

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
- Safe to call even if friendship doesn't exist

**Error Response:** `404 Not Found`
```json
{
  "message": "One or both users not found."
}
```

---

### 7. Get Graph Data

Returns formatted data for React Flow graph visualization including nodes and edges.

**Endpoint:** `GET /graph`

**Request:**
```http
GET /api/graph HTTP/1.1
Host: localhost:3001
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
        "popularityScore": 3.5
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
  ]
}
```

**Node Types:**
- `highScoreNode`: popularityScore > 5
- `lowScoreNode`: popularityScore ≤ 5

**Popularity Score Calculation:**
```
popularityScore = numberOfFriends + (totalSharedHobbies × 0.5)
```

Where:
- `numberOfFriends`: Count of direct friends
- `totalSharedHobbies`: Sum of hobbies shared with each friend

**Example Calculation:**
- User A has 2 friends
- Shares 2 hobbies with Friend 1
- Shares 1 hobby with Friend 2
- Score = 2 + (3 × 0.5) = 3.5

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

### Not Found Errors (404)
Returned when:
- User ID doesn't exist
- Resource cannot be located

### Conflict Errors (409)
Returned when:
- Attempting to delete a user with active friendships
- Business rule violations

---

## Rate Limiting

Currently, no rate limiting is implemented. For production use, consider implementing rate limiting to prevent abuse.

---

## CORS

CORS is enabled for all origins in development. For production, configure allowed origins in the backend.

---

## Examples

### Complete User Flow Example

**1. Create two users**
```bash
# Using production API
curl -X POST https://cybernauts-backend-qujq.onrender.com/api/users \
  -H "Content-Type: application/json" \
  -d '{"username":"Alice","age":25,"hobbies":["coding","music"]}'

curl -X POST https://cybernauts-backend-qujq.onrender.com/api/users \
  -H "Content-Type: application/json" \
  -d '{"username":"Bob","age":30,"hobbies":["coding","sports"]}'
```

**2. Link them as friends**
```bash
curl -X POST https://cybernauts-backend-qujq.onrender.com/api/users/ALICE_ID/link \
  -H "Content-Type: application/json" \
  -d '{"friendId":"BOB_ID"}'
```

**3. Get graph data**
```bash
curl https://cybernauts-backend-qujq.onrender.com/api/graph
```

**4. Try to delete Alice (will fail)**
```bash
curl -X DELETE https://cybernauts-backend-qujq.onrender.com/api/users/ALICE_ID
# Response: 409 Conflict
```

**5. Unlink users first**
```bash
curl -X DELETE https://cybernauts-backend-qujq.onrender.com/api/users/ALICE_ID/unlink \
  -H "Content-Type: application/json" \
  -d '{"friendId":"BOB_ID"}'
```

**6. Now delete Alice (will succeed)**
```bash
curl -X DELETE https://cybernauts-backend-qujq.onrender.com/api/users/ALICE_ID
# Response: 200 OK
```

---

## Postman Collection

Import this JSON into Postman for easy testing:

```json
{
  "info": {
    "name": "Cybernauts User Network API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Get All Users",
      "request": {
        "method": "GET",
        "url": "{{baseUrl}}/users"
      }
    },
    {
      "name": "Create User",
      "request": {
        "method": "POST",
        "url": "{{baseUrl}}/users",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "body": {
          "mode": "raw",
          "raw": "{\"username\":\"Alice\",\"age\":25,\"hobbies\":[\"coding\",\"music\"]}"
        }
      }
    },
    {
      "name": "Update User",
      "request": {
        "method": "PUT",
        "url": "{{baseUrl}}/users/{{userId}}",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "body": {
          "mode": "raw",
          "raw": "{\"age\":26,\"hobbies\":[\"coding\",\"music\",\"art\"]}"
        }
      }
    },
    {
      "name": "Delete User",
      "request": {
        "method": "DELETE",
        "url": "{{baseUrl}}/users/{{userId}}"
      }
    },
    {
      "name": "Link Users",
      "request": {
        "method": "POST",
        "url": "{{baseUrl}}/users/{{userId}}/link",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "body": {
          "mode": "raw",
          "raw": "{\"friendId\":\"{{friendId}}\"}"
        }
      }
    },
    {
      "name": "Unlink Users",
      "request": {
        "method": "DELETE",
        "url": "{{baseUrl}}/users/{{userId}}/unlink",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "body": {
          "mode": "raw",
          "raw": "{\"friendId\":\"{{friendId}}\"}"
        }
      }
    },
    {
      "name": "Get Graph Data",
      "request": {
        "method": "GET",
        "url": "{{baseUrl}}/graph"
      }
    }
  ],
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:3001/api"
    }
  ]
}
```

**Variables to set in Postman:**
- `baseUrl`: `http://localhost:3001/api` (development) or your production URL
- `userId`: User ID from created user
- `friendId`: Friend's user ID

---