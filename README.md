# Interactive User Relationship & Hobby Network

A full-stack application for managing user relationships and hobbies with dynamic graph visualization using React Flow.

![Tech Stack](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)

## 🌐 Live Demo

**Try it now without any setup!**

- **Frontend Application**: https://cybernauts-development-assignment.vercel.app/
- **Backend API**: https://cybernauts-backend-qujq.onrender.com/api
- **API Health Check**: https://cybernauts-backend-qujq.onrender.com/

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Quick Start](#-quick-start)
- [Installation](#-installation)
- [Running the Application](#-running-the-application)
- [Running Tests](#-running-tests)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [Business Logic](#-business-logic)
- [Bonus Features](#-bonus-features)
- [Deployment](#-deployment)
- [Screen Recording](#-screen-recording)

---

## ✨ Features

### Core Features (As Per Requirements)

#### Backend
- **CRUD API**: Full user management with validation
- **Relationship Management**: Link/unlink users as friends
- **Graph Data Endpoint**: Returns nodes and edges for visualization
- **Popularity Score**: Real-time calculation based on friends and shared hobbies
- **Smart Deletion**: Prevents deletion of users with active friendships (409 Conflict)
- **Mutual Connections**: Automatically creates bidirectional friendships
- **Circular Reference Prevention**: Treats A→B and B→A as one mutual connection

#### Frontend
- **Dynamic Graph Visualization**: Interactive node-based graph using React Flow
- **Draggable Hobbies**: Drag-and-drop hobbies onto user nodes
- **User Management Panel**: Create/edit users with validation
- **Real-time Updates**: Scores and node types update dynamically
- **Search & Filter**: Searchable hobby list with debouncing
- **Toast Notifications**: User feedback for all actions
- **Confirmation Dialogs**: For destructive actions
- **Error Boundary**: Graceful error handling

### Advanced Features

#### UI/UX
- 🎨 Custom node types based on popularity score
- 🎯 Smooth animations on node type transitions
- 📊 Real-time score updates
- 🔔 Toast notifications for all actions
- ⚠️ Confirmation dialogs for destructive actions
- 🛡️ Error boundary for crash protection

#### Performance
- ⚡ Lazy loading with pagination
- 🔄 Infinite scroll support
- 🚀 Redis caching for API responses
- ⏱️ Debounced search (300ms)
- 🎯 Optimized re-renders

---

## 🛠 Tech Stack

### Backend
- **Runtime**: Node.js with Express
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Caching**: Redis (ioredis)
- **Clustering**: Node.js Cluster API
- **Testing**: Jest + Supertest (55+ test cases)
- **Dev Tools**: Nodemon for hot reload

### Frontend
- **Framework**: React 19 with TypeScript
- **State Management**: Redux Toolkit with redux-undo
- **Graph Visualization**: React Flow
- **Notifications**: React Toastify
- **Build Tool**: Vite
- **HTTP Client**: Axios
- **Styling**: CSS3 with custom components

---

## 📦 Prerequisites

Before running this project, ensure you have:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn** package manager
- **MongoDB** account - [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (free tier works)
- **Redis** (optional, for state synchronization) - [Redis](https://redis.io/)
- **Git** - [Download](https://git-scm.com/)

---

## 🚀 Quick Start

### For the Impatient

```bash
# Clone the repository
git clone <your-repo-url>
cd cybernauts-assignment

# Backend setup
cd cybernauts-backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URL
npm run dev

# Frontend setup (in a new terminal)
cd cybernauts-frontend
npm install
cp .env.example .env
npm run dev
```

Visit `http://localhost:5173` in your browser!

**For detailed setup instructions**, see [QUICKSTART.md](./QUICKSTART.md)

---

## 🔧 Installation

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd cybernauts-assignment
```

### 2. Backend Setup

```bash
cd cybernauts-backend
npm install

# Create environment file
cp .env.example .env
```

**Edit `cybernauts-backend/.env`:**
```env
PORT=3001
DB_URL=mongodb+srv://username:password@cluster.mongodb.net/cybernauts?retryWrites=true&w=majority
FRONTEND_ORIGIN_URL=http://localhost:5173

# Optional: Redis Configuration
REDIS_ENABLED=false
REDIS_URL=redis://localhost:6379
```

### 3. Frontend Setup

```bash
cd cybernauts-frontend
npm install

# Create environment file
cp .env.example .env
```

**Edit `cybernauts-frontend/.env`:**
```env
VITE_API_URL=http://localhost:3001/api
```

---

## 🏃 Running the Application

### Development Mode

#### Terminal 1 - Backend
```bash
cd cybernauts-backend
npm run dev
```

✅ Server starts on `http://localhost:3001`

#### Terminal 2 - Frontend
```bash
cd cybernauts-frontend
npm run dev
```

✅ Frontend starts on `http://localhost:5173`

### Production Build

#### Backend
```bash
cd cybernauts-backend
npm run build
npm start
```

#### Frontend
```bash
cd cybernauts-frontend
npm run build
npm run preview
```

---

## 🧪 Running Tests

The project includes **55+ comprehensive test cases** covering all requirements.

```bash
cd cybernauts-backend

# Run all tests
npm test

# Run specific test suites
npm run test:unit          # Business logic tests (25 tests)
npm run test:redis         # Redis integration tests (19 tests)
npm run test:integration   # End-to-end tests (11 tests)

# Generate coverage report
npm run test:coverage

# Open coverage report
open coverage/lcov-report/index.html
```

**Test Coverage:**
- ✅ Relationship creation/deletion
- ✅ Popularity score calculation
- ✅ Conflict prevention (unlink before delete)
- ✅ Pagination functionality
- ✅ Redis state synchronization
- ✅ Error handling
- ✅ Edge cases

**See [TESTING_GUIDE.md](./TESTING_GUIDE.md) for detailed testing documentation.**

---

## 📚 API Documentation

### Base URL
```
Development: http://localhost:3001/api
Production: https://cybernauts-backend-qujq.onrender.com/api
```

### Quick Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/users` | Get all users |
| `POST` | `/users` | Create new user |
| `PUT` | `/users/:id` | Update user |
| `DELETE` | `/users/:id` | Delete user (if no friends) |
| `POST` | `/users/:id/link` | Link users as friends |
| `DELETE` | `/users/:id/unlink` | Unlink friendship |
| `GET` | `/graph` | Get graph data (nodes + edges) |

### Example Requests

**Create User:**
```bash
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "Alice",
    "age": 25,
    "hobbies": ["coding", "music"]
  }'
```

**Link Users:**
```bash
curl -X POST http://localhost:3001/api/users/{userId}/link \
  -H "Content-Type: application/json" \
  -d '{"friendId": "{friendId}"}'
```

**Get Graph Data:**
```bash
curl http://localhost:3001/api/graph
```

**📖 For complete API documentation, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)**

**📮 Import the Postman collection: [Cybernauts-API.postman_collection.json](./Cybernauts-API.postman_collection.json)**

---

## 📁 Project Structure

```
cybernauts-assignment/
├── cybernauts-backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── redis.ts              # Redis configuration
│   │   ├── controllers/
│   │   │   └── user.controller.ts    # API request handlers
│   │   ├── models/
│   │   │   └── user.model.ts         # MongoDB schema
│   │   ├── routes/
│   │   │   └── user.routes.ts        # API routes
│   │   ├── services/
│   │   │   └── user.service.ts       # Business logic & scoring
│   │   ├── tests/
│   │   │   ├── user.logic.test.ts    # Unit tests (25)
│   │   │   ├── redis.test.ts         # Redis tests (19)
│   │   │   └── integration.test.ts   # Integration tests (11)
│   │   ├── utils/
│   │   │   └── errors.ts             # Custom error classes
│   │   ├── scripts/
│   │   │   └── seedData.ts           # Database seeding script
│   │   └── index.ts                  # Entry point with clustering
│   ├── .env.example
│   ├── package.json
│   ├── jest.config.js
│   └── tsconfig.json
│
├── cybernauts-frontend/
│   ├── src/
│   │   ├── app/
│   │   │   └── store.ts              # Redux store
│   │   ├── components/
│   │   │   ├── nodes/
│   │   │   │   ├── HighScoreNode.tsx # Custom high score node
│   │   │   │   ├── LowScoreNode.tsx  # Custom low score node
│   │   │   │   └── NodeStyles.css    # Node animations
│   │   │   ├── ErrorBoundary.tsx     # Error handling
│   │   │   ├── NetworkGraph.tsx      # React Flow graph
│   │   │   └── Sidebar.tsx           # User management UI
│   │   ├── features/
│   │   │   └── graph/
│   │   │       └── graphSlice.ts     # Redux slice
│   │   ├── hooks/
│   │   │   └── useDebounce.ts        # Debounce hook
│   │   ├── services/
│   │   │   └── api.ts                # Axios client
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── .env.example
│   ├── package.json
│   └── vite.config.ts
│
├── API_DOCUMENTATION.md              # Complete API reference
├── DEPLOYMENT.md                     # Deployment guide
├── QUICKSTART.md                     # Quick setup guide
├── TESTING_GUIDE.md                  # Testing documentation
├── REDIS.md                          # Redis implementation guide
├── SEED_DATA_GUIDE.md                # Database seeding guide
└── README.md                         # This file
```

---

## 🎯 Business Logic

### Popularity Score Formula

```
popularityScore = numberOfFriends + (totalSharedHobbies × 0.5)
```

**Example:**
- User A has 2 friends
- Shares 2 hobbies with Friend 1
- Shares 1 hobby with Friend 2
- **Score = 2 + (3 × 0.5) = 3.5**

### Node Types

- **HighScoreNode** (Green): `popularityScore > 5`
- **LowScoreNode** (Red): `popularityScore ≤ 5`

### Business Rules

1. **Mutual Friendships**: Linking A→B automatically creates B→A
2. **Delete Protection**: Users with friends cannot be deleted (returns 409 Conflict)
3. **No Self-Links**: Users cannot link to themselves
4. **Duplicate Prevention**: Same link cannot be created twice
5. **Dynamic Scoring**: Scores recalculate when hobbies or friendships change

---

## 🎁 Bonus Features Implemented

### 1. Development & Scaling ✅

**Clustering:**
```typescript
// Backend uses Node.js cluster API
if (cluster.isPrimary) {
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
}
```

**Redis State Synchronization:**
- Pub/Sub pattern for cross-worker communication
- Cache layer for API responses
- TTL-based cache invalidation
- Event broadcasting for real-time updates

**To enable Redis:**
```env
REDIS_ENABLED=true
REDIS_URL=redis://localhost:6379
```

**See [REDIS.md](./REDIS.md) for complete Redis implementation guide.**

### 2. API Test Coverage ✅

**55+ test cases including:**
- 25 unit tests for business logic
- 19 Redis integration tests
- 11 end-to-end integration tests

```bash
npm run test:all
```

**Coverage Report:**
- Statements: > 90%
- Branches: > 85%
- Functions: > 85%
- Lines: > 90%

### 3. Custom React-Flow Nodes ✅

**Two node types with smooth transitions:**
```typescript
// HighScoreNode: popularityScore > 5
// LowScoreNode: popularityScore ≤ 5
```

**Features:**
- Smooth CSS transitions on type changes
- Dynamic sizing based on score
- Visual feedback for popularity

### 4. Performance Optimization ✅

**Lazy Loading:**
- Toggle on/off in UI
- Pagination support (50-100 users per page)
- Infinite scroll capability
- "Load More" button

**Debouncing:**
- Hobby search: 300ms debounce
- API calls: Optimized with Redux

**Caching:**
- Redis caching for graph data
- 2-5 minute TTL
- Automatic invalidation on mutations

---

## 🌐 Deployment

### Live Production URLs

- **Frontend**: https://cybernauts-development-assignment.vercel.app/
- **Backend**: https://cybernauts-backend-qujq.onrender.com/api
- **Health Check**: https://cybernauts-backend-qujq.onrender.com/

### Deployment Details

**Backend (Render):**
- Node.js environment
- Automatic deployments from GitHub
- Environment variables configured
- MongoDB Atlas connected
- Redis enabled (Upstash)

**Frontend (Vercel):**
- Vite build
- Automatic deployments from GitHub
- Environment variable: `VITE_API_URL`
- CDN optimized

**Database:**
- MongoDB Atlas (Free tier)
- Cluster: `cybernauts`
- Connection pooling enabled

**📖 For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)**

---

## 🎥 Screen Recording

**Watch the Full Demo:** [Cybernauts Assignment Walkthrough](https://www.youtube.com/watch?v=jbe_gySXAAY)

---

## 🔒 Response Codes

| Code | Status | Description |
|------|--------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request parameters or validation error |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Business rule violation (e.g., delete user with friends) |
| 500 | Internal Server Error | Server error |

---

## 📖 Additional Documentation

- **[QUICKSTART.md](./QUICKSTART.md)** - Get started in 5 minutes
- **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** - Complete API reference
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Deployment guide
- **[TESTING_GUIDE.md](./TESTING_GUIDE.md)** - Testing documentation
- **[REDIS.md](./REDIS.md)** - Redis implementation
- **[SEED_DATA_GUIDE.md](./SEED_DATA_GUIDE.md)** - Database seeding

---

## 🎓 Learning Resources

- [React Flow Documentation](https://reactflow.dev/)
- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)
- [Express.js Guide](https://expressjs.com/)
- [MongoDB Manual](https://docs.mongodb.com/)
- [Redis Documentation](https://redis.io/docs/)

---

## 🐛 Troubleshooting

### Common Issues

**"Cannot connect to MongoDB"**
- Check your `DB_URL` in `.env`
- Verify MongoDB Atlas IP whitelist (0.0.0.0/0)
- Check username/password

**"Port already in use"**
```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9
```

**"Network Error / CORS Error"**
- Verify backend is running
- Check `VITE_API_URL` in frontend `.env`
- Ensure CORS is enabled in backend

**"Redis connection failed"**
```bash
# Start Redis with Docker
docker run -d -p 6379:6379 redis:alpine

# Or disable Redis
REDIS_ENABLED=false
```

---

## 🤝 Contributing

This is a development assignment project. 

---

## 📄 License

This project is part of a development assignment for Cybernauts.

---

## 👥 Author

**Aayush Chouhan**
- GitHub: [@aayush-chouhan-7050](https://github.com/aayush-chouhan-7050)
- Email: aayushchouhan7050@gmail.com

---

## 🙏 Acknowledgments

- Cybernauts for the assignment opportunity
- React Flow for the excellent graph visualization library
- MongoDB Atlas for database hosting
- Render and Vercel for deployment platforms

---

## 📊 Project Stats

- **Backend**: 2,500+ lines of TypeScript
- **Frontend**: 1,800+ lines of TypeScript/TSX
- **Tests**: 55+ test cases
- **Test Coverage**: > 90%
- **Documentation**: 8 comprehensive guides
- **API Endpoints**: 7 RESTful endpoints
- **Deployment**: Fully deployed and operational

---

## ✨ Features at a Glance

| Feature | Status | Implementation |
|---------|--------|----------------|
| CRUD API | ✅ | Express + TypeScript |
| Graph Visualization | ✅ | React Flow |
| State Management | ✅ | Redux Toolkit |
| Popularity Scoring | ✅ | Custom algorithm |
| Delete Protection | ✅ | 409 Conflict handling |
| Drag & Drop | ✅ | React DnD |
| Custom Nodes | ✅ | High/Low score types |
| Animations | ✅ | CSS transitions |
| Testing | ✅ | Jest + Supertest (55+) |
| Clustering | ✅ | Node.js Cluster API |
| Redis Caching | ✅ | ioredis with pub/sub |
| Pagination | ✅ | Lazy loading |
| Debouncing | ✅ | 300ms delay |
| Error Boundary | ✅ | React error handling |
| Undo/Redo | ✅ | redux-undo |
| Toast Notifications | ✅ | React Toastify |
| Deployment | ✅ | Render + Vercel |

---