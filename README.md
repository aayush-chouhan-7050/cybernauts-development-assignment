# Interactive User Relationship & Hobby Network

A full-stack application for managing user relationships and hobbies with dynamic graph visualization using React Flow.

![Tech Stack](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [Running Tests](#running-tests)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Bonus Features](#bonus-features)
- [Deployment](#deployment)
- [Demo](#demo)

## ✨ Features

### Core Features
- **User Management**: Create, update, and delete users with validation
- **Relationship Management**: Link and unlink users as friends
- **Dynamic Graph Visualization**: Interactive node-based graph using React Flow
- **Popularity Scoring**: Real-time calculation based on friends and shared hobbies
- **Hobby Management**: Drag-and-drop hobbies onto user nodes
- **Smart Deletion**: Prevents deletion of users with active friendships
- **Mutual Connections**: Automatically creates bidirectional friendships

### UI Features
- 🎨 Custom node types based on popularity score
- 🔍 Searchable hobby list with debouncing
- 🎯 Drag-and-drop interface for hobbies
- 📊 Real-time score updates
- 🔔 Toast notifications for all actions
- ⚠️ Confirmation dialogs for destructive actions
- 🛡️ Error boundary for crash protection

## 🛠 Tech Stack

### Backend
- **Runtime**: Node.js with Express
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Testing**: Jest + Supertest
- **Dev Tools**: Nodemon for hot reload

### Frontend
- **Framework**: React 19 with TypeScript
- **State Management**: Redux Toolkit
- **Graph Visualization**: React Flow
- **Notifications**: React Toastify
- **Build Tool**: Vite
- **Styling**: CSS3 with custom components

## 📦 Prerequisites

Before running this project, ensure you have:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn** package manager
- **MongoDB** account - [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (free tier works)
- **Git** - [Download](https://git-scm.com/)

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/aayush-chouhan-7050/cybernauts-development-assignment.git
cd cybernauts-assignment
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd cybernauts-backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your MongoDB connection string
# nano .env or use your preferred editor
```

**Required .env variables:**
```env
PORT=3001
DB_URL=mongodb+srv://username:password@cluster.mongodb.net/cybernauts?retryWrites=true&w=majority
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory (from root)
cd cybernauts-frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your backend URL
# nano .env or use your preferred editor
```

**Required .env variables:**
```env
VITE_API_URL=http://localhost:3001/api
```

## 🏃 Running the Application

### Development Mode

#### Terminal 1 - Backend
```bash
cd cybernauts-backend
npm run dev
```

The backend server will start on `http://localhost:3001`

#### Terminal 2 - Frontend
```bash
cd cybernauts-frontend
npm run dev
```

The frontend will start on `http://localhost:5173`

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

## 🧪 Running Tests

```bash
cd cybernauts-backend
npm test
```

**Test Coverage Includes:**
- ✅ Conflict prevention (unlink before delete)
- ✅ Popularity score calculation
- ✅ Relationship creation and deletion
- ✅ Mutual friendship validation

## 📚 API Documentation

### Base URL
```
http://localhost:3001/api
```

### Endpoints

#### Users

**Get All Users**
```http
GET /users
```

**Create User**
```http
POST /users
Content-Type: application/json

{
  "username": "Alice",
  "age": 25,
  "hobbies": ["coding", "music"]
}
```

**Update User**
```http
PUT /users/:id
Content-Type: application/json

{
  "age": 26,
  "hobbies": ["coding", "music", "art"]
}
```

**Delete User**
```http
DELETE /users/:id
```
⚠️ Returns `409 Conflict` if user has friends

**Link Users**
```http
POST /users/:id/link
Content-Type: application/json

{
  "friendId": "user-id-here"
}
```

**Unlink Users**
```http
DELETE /users/:id/unlink
Content-Type: application/json

{
  "friendId": "user-id-here"
}
```

#### Graph

**Get Graph Data**
```http
GET /graph
```

Returns nodes and edges for React Flow visualization.

### Response Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Validation Error |
| 404 | Not Found |
| 409 | Conflict (e.g., delete user with friends) |
| 500 | Internal Server Error |

## 📁 Project Structure

```
cybernauts-assignment/
├── cybernauts-backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   └── user.controller.ts
│   │   ├── models/
│   │   │   └── user.model.ts
│   │   ├── routes/
│   │   │   └── user.routes.ts
│   │   ├── services/
│   │   │   └── user.service.ts
│   │   ├── tests/
│   │   │   └── user.logic.test.ts
│   │   ├── utils/
│   │   │   └── errors.ts
│   │   └── index.ts
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── cybernauts-frontend/
│   ├── src/
│   │   ├── app/
│   │   │   └── store.ts
│   │   ├── components/
│   │   │   ├── nodes/
│   │   │   │   ├── HighScoreNode.tsx
│   │   │   │   ├── LowScoreNode.tsx
│   │   │   │   └── NodeStyles.css
│   │   │   ├── ErrorBoundary.tsx
│   │   │   ├── NetworkGraph.tsx
│   │   │   └── Sidebar.tsx
│   │   ├── features/
│   │   │   └── graph/
│   │   │       └── graphSlice.ts
│   │   ├── hooks/
│   │   │   └── useDebounce.ts
│   │   ├── services/
│   │   │   └── api.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── .env.example
│   ├── package.json
│   └── vite.config.ts
│
└── README.md
```

## 🎁 Bonus Features Implemented

- ✅ **Development Mode**: Nodemon for hot reload
- ✅ **Custom React Flow Nodes**: Two node types based on popularity score
- ✅ **Animated Transitions**: Smooth CSS transitions on score changes
- ✅ **Debounced Search**: Optimized hobby search with 300ms debounce
- ✅ **Error Boundary**: Graceful error handling in UI
- ✅ **Toast Notifications**: User feedback for all actions

## 🌐 Deployment

### Backend (Railway/Render)

1. Push code to GitHub
2. Create new project on Railway/Render
3. Connect GitHub repository
4. Add environment variables:
   - `PORT=3001`
   - `DB_URL=your_mongodb_connection_string`
5. Deploy

### Frontend (Vercel/Netlify)

1. Push code to GitHub
2. Create new project on Vercel/Netlify
3. Set build command: `npm run build`
4. Set output directory: `dist`
5. Add environment variable:
   - `VITE_API_URL=your_backend_url/api`
6. Deploy

## 🎥 Demo

### Live Demo
- **Frontend**: [Your Vercel URL]
- **Backend API**: [Your Railway URL]

### Screen Recording
[Link to your demo video]

### Demo Features
1. Creating users with hobbies
2. Linking users by dragging nodes
3. Dragging hobbies onto user nodes
4. Real-time popularity score updates
5. Attempting to delete a user with friends (409 error)
6. Unlinking users and then deleting

## 🧮 Popularity Score Formula

```
popularityScore = numberOfFriends + (sharedHobbiesWithAllFriends × 0.5)
```

**Example:**
- User A has 2 friends
- Shares 1 hobby with Friend 1
- Shares 1 hobby with Friend 2
- Score = 2 + (2 × 0.5) = 3.0

## 🔒 Business Rules

1. **Mutual Friendships**: Linking A→B automatically creates B→A
2. **Delete Protection**: Users with friends cannot be deleted (409 Conflict)
3. **No Self-Links**: Users cannot link to themselves
4. **Dynamic Scoring**: Scores recalculate when hobbies or friendships change

## 📄 License

This project is part of a development assignment for Cybernauts.

## 👥 Author

[Aayush Chouhan]
- GitHub: [@aayush-chouhan-7050]
- Email: aayushchouhan7050@gmail.com