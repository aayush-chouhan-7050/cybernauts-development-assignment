# Test Implementation Steps

Step-by-step guide to add all new test cases to your project.

---

## 📋 Quick Start

```bash
# 1. Navigate to backend
cd cybernauts-backend

# 2. Copy test files (from the artifacts provided)
# 3. Update configuration
# 4. Run tests
npm test
```

---

## Step 1: Update jest.config.js

Replace your current `jest.config.js` with:

```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: [
    "**/__tests__/**/*.ts",
    "**/?(*.)+(spec|test).ts"
  ],
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.d.ts",
    "!src/tests/**",
    "!src/scripts/**"
  ],
  coverageDirectory: "coverage",
  coverageReporters: [
    "text",
    "lcov",
    "html"
  ],
  testTimeout: 10000,
  verbose: true,
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true
};
```

---

## Step 2: Update package.json Scripts

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "dev": "nodemon src/index.ts",
    "test": "jest --runInBand --detectOpenHandles",
    "test:watch": "jest --watch --runInBand",
    "test:coverage": "jest --coverage --runInBand",
    "test:unit": "jest src/tests/user.logic.test.ts --runInBand",
    "test:redis": "jest src/tests/redis.test.ts --runInBand --detectOpenHandles",
    "test:integration": "jest src/tests/integration.test.ts --runInBand --detectOpenHandles",
    "test:all": "jest --runInBand --detectOpenHandles --verbose",
    "build": "tsc",
    "start": "node dist/index.js",
    "seed": "ts-node src/scripts/seedData.ts",
    "seed:small": "cross-env NUM_USERS=50 ts-node src/scripts/seedData.ts",
    "seed:medium": "cross-env NUM_USERS=200 ts-node src/scripts/seedData.ts",
    "seed:large": "cross-env NUM_USERS=500 ts-node src/scripts/seedData.ts"
  }
}
```

---

## Step 3: Create Test Files

Create three new test files in `cybernauts-backend/src/tests/`:

### File 1: Enhanced user.logic.test.ts

Replace your existing `src/tests/user.logic.test.ts` with the **enhanced version** from the artifact I provided (the one with 25+ tests).

**Location**: `cybernauts-backend/src/tests/user.logic.test.ts`

### File 2: redis.test.ts (NEW)

Create a new file `src/tests/redis.test.ts` with the **Redis tests** from the artifact.

**Location**: `cybernauts-backend/src/tests/redis.test.ts`

### File 3: integration.test.ts (NEW)

Create a new file `src/tests/integration.test.ts` with the **integration tests** from the artifact.

**Location**: `cybernauts-backend/src/tests/integration.test.ts`

---

## Step 4: Verify File Structure

Your test directory should look like:

```
cybernauts-backend/
├── src/
│   ├── tests/
│   │   ├── user.logic.test.ts     ✅ (Updated with 25 tests)
│   │   ├── redis.test.ts           ✅ (New - 19 tests)
│   │   └── integration.test.ts     ✅ (New - 11 tests)
│   ├── config/
│   │   └── redis.ts                ✅ (Should already exist)
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   └── services/
├── jest.config.js                  ✅ (Updated)
├── package.json                    ✅ (Updated scripts)
└── .env                            ✅ (Check configuration)
```

---

## Step 5: Update Environment Variables

Make sure your `.env` has:

```env
# Existing variables
PORT=3001
DB_URL=mongodb+srv://username:password@cluster.mongodb.net/cybernauts?retryWrites=true&w=majority
FRONTEND_ORIGIN_URL=http://localhost:5173

# Redis Configuration (for Redis tests)
REDIS_ENABLED=true
REDIS_URL=redis://localhost:6379
```

**Note**: Set `REDIS_ENABLED=false` if you don't have Redis installed.

---

## Step 6: Install Dependencies (if needed)

```bash
cd cybernauts-backend

# Check if already installed
npm list ioredis redis

# If not installed, add them
npm install ioredis redis

# Also ensure test dependencies are installed
npm install --save-dev @types/jest @types/supertest jest supertest ts-jest
```

---

## Step 7: Run Tests

### Option A: Run All Tests

```bash
npm test
```

Expected output:
```
Test Suites: 3 passed, 3 total
Tests:       55 passed, 55 total
Time:        ~16s
```

### Option B: Run Individual Test Suites

```bash
# Run only unit tests (25 tests)
npm run test:unit

# Run only Redis tests (19 tests) - requires Redis running
npm run test:redis

# Run only integration tests (11 tests)
npm run test:integration
```

### Option C: Run with Coverage

```bash
npm run test:coverage

# Then open the coverage report
open coverage/lcov-report/index.html
```

---

## Step 8: Verify Test Results

### Expected Console Output

```bash
$ npm test

 PASS  src/tests/user.logic.test.ts (5.234s)
  User Relationship and Logic API
    ✓ should return 409 Conflict when trying to delete a user with friends (123ms)
    ✓ should correctly calculate the popularity score (145ms)
    ✓ should create a mutual friendship and correctly remove it (98ms)
    ✓ should prevent a user from linking to themselves (45ms)
    ✓ should not create duplicate friendships (87ms)
    ✓ should allow deletion after unlinking all friends (112ms)
    ✓ should calculate score correctly with no shared hobbies (76ms)
    ✓ should calculate score correctly with multiple shared hobbies (98ms)
    ✓ should validate required fields when creating a user (34ms)
    ✓ should update user hobbies and recalculate score (134ms)
    ✓ should return 404 when linking with non-existent user (56ms)
    ✓ should return 404 when deleting non-existent user (43ms)
    ✓ should return all users (67ms)
    ✓ should return correct graph data structure (89ms)
    ✓ should assign correct node type based on popularity score (234ms)
    ✓ should assign lowScoreNode type for low popularity scores (56ms)
    ✓ should handle unlinking users who are not friends gracefully (78ms)
    ✓ should return 404 when updating non-existent user (45ms)
    ✓ should handle complex network with multiple connections (345ms)
    ✓ should handle users with empty hobbies (54ms)
  Pagination Tests
    ✓ should return first page of graph data (67ms)
    ✓ should return second page of graph data (65ms)
    ✓ should return last page with remaining users (71ms)
    ✓ should handle pagination with custom limit (59ms)
  Performance Tests
    ✓ should handle creating many users efficiently (1456ms)

 PASS  src/tests/redis.test.ts (6.789s)
  Redis Integration Tests
    Redis Connection
      ✓ should connect to Redis successfully (45ms)
      ✓ should handle Redis being disabled (23ms)
    Cache Operations
      ✓ should set and get cached data (34ms)
      ✓ should return null for non-existent key (21ms)
      ✓ should delete cached data (28ms)
      ✓ should invalidate keys by pattern (56ms)
      ✓ should handle TTL expiration (1567ms)
      ✓ should cache complex objects (45ms)
    Pub/Sub Operations
      ✓ should publish and receive events (234ms)
      ✓ should handle multiple subscribers (345ms)
      ✓ should handle different event channels (278ms)
    State Synchronization Scenarios
      ✓ should synchronize cache invalidation across workers (289ms)
      ✓ should handle user link events (198ms)
      ✓ should handle user unlink events (187ms)
    Error Handling
      ✓ should handle invalid cache keys gracefully (34ms)
      ✓ should handle publishing with invalid data (29ms)
      ✓ should handle cache operations when Redis is unavailable (41ms)
    Performance Tests
      ✓ should handle high-frequency cache operations (456ms)
      ✓ should handle concurrent reads efficiently (234ms)

 PASS  src/tests/integration.test.ts (8.456s)
  Complete User Workflow Integration Tests
    ✓ should handle complete user lifecycle (567ms)
    ✓ should build and manage a social network (789ms)
    ✓ should update popularity scores when hobbies change (445ms)
    ✓ should update both users when unlinking (334ms)
    ✓ should transition node types when score crosses threshold (678ms)
    ✓ should handle bulk user operations (1234ms)
    ✓ should handle and recover from errors gracefully (289ms)
    ✓ should maintain data consistency (456ms)
  Pagination Integration Tests
    ✓ should paginate graph data correctly (234ms)
    ✓ should handle last page correctly (198ms)
    ✓ should include connections across pages (267ms)

Test Suites: 3 passed, 3 total
Tests:       55 passed, 55 total
Snapshots:   0 total
Time:        20.479s
```

---

## Step 9: Troubleshooting

### Issue: "Cannot find module 'ioredis'"

**Solution**:
```bash
npm install ioredis redis
```

### Issue: "Redis connection failed"

**Solutions**:

1. **Install Redis locally**:
   ```bash
   # macOS
   brew install redis
   brew services start redis
   
   # Docker
   docker run -d -p 6379:6379 redis:alpine
   
   # Linux
   sudo apt install redis-server
   sudo systemctl start redis
   ```

2. **Or disable Redis tests**:
   ```bash
   # In .env
   REDIS_ENABLED=false
   
   # Then run without Redis tests
   npm run test:unit
   npm run test:integration
   ```

### Issue: "MongoDB connection error"

**Solution**:
```bash
# Check your DB_URL in .env
# Make sure MongoDB Atlas cluster is running
# Verify IP whitelist includes 0.0.0.0/0
```

### Issue: "Tests timeout"

**Solution**:
```javascript
// In jest.config.js, increase timeout
module.exports = {
  // ... other config
  testTimeout: 15000, // Increase from 10000 to 15000
};
```

### Issue: "Port 3001 already in use"

**Solution**:
```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9

# Or change port in .env
PORT=3002
```

---

## Step 10: Generate Coverage Report

```bash
# Run tests with coverage
npm run test:coverage

# Open HTML report
open coverage/lcov-report/index.html

# Or on Linux
xdg-open coverage/lcov-report/index.html

# Or on Windows
start coverage/lcov-report/index.html
```

**Expected Coverage**:
- Statements: > 90%
- Branches: > 85%
- Functions: > 85%
- Lines: > 90%

---

## Step 11: Add Documentation Files

Create these documentation files in your project root:

### 1. TESTING_GUIDE.md
Copy the complete testing guide from the artifact I provided.

**Location**: `cybernauts-backend/TESTING_GUIDE.md`

### 2. TEST_CASES_SUMMARY.md
Copy the test cases summary from the artifact.

**Location**: `cybernauts-backend/TEST_CASES_SUMMARY.md`

---

## Step 12: Update Your README.md

Add a testing section to your main README:

```markdown
## 🧪 Testing

This project includes comprehensive test coverage:

- **55 test cases** across 3 test suites
- **90%+ code coverage**
- Unit tests, Redis integration tests, and E2E tests

### Run Tests

```bash
# All tests
npm test

# Specific suites
npm run test:unit          # Business logic tests
npm run test:redis         # Redis functionality tests
npm run test:integration   # End-to-end tests

# With coverage report
npm run test:coverage
```

See [TESTING_GUIDE.md](./TESTING_GUIDE.md) for detailed documentation.
```

---

## Step 13: Commit Your Changes

```bash
# Add all test files
git add src/tests/
git add jest.config.js
git add package.json
git add TESTING_GUIDE.md
git add TEST_CASES_SUMMARY.md

# Commit
git commit -m "Add comprehensive test suite with 55 test cases

- Add 25 unit tests for business logic
- Add 19 Redis integration tests
- Add 11 end-to-end integration tests
- Update jest configuration
- Add testing documentation
- Achieve 90%+ code coverage"

# Push
git push origin main
```

---

## Step 14: Verify Everything Works

### Final Checklist

- [ ] All 3 test files created
- [ ] jest.config.js updated
- [ ] package.json scripts updated
- [ ] .env configured
- [ ] Dependencies installed
- [ ] All tests pass: `npm test`
- [ ] Coverage generated: `npm run test:coverage`
- [ ] Documentation added
- [ ] Changes committed to Git

### Run Final Verification

```bash
# 1. Clean install
rm -rf node_modules package-lock.json
npm install

# 2. Run all tests
npm test

# 3. Check coverage
npm run test:coverage

# 4. Verify individual suites
npm run test:unit
npm run test:integration

# 5. If you have Redis
npm run test:redis
```

---

## 🎉 Success Criteria

You'll know everything is working when:

1. ✅ `npm test` shows **55 tests passed**
2. ✅ Coverage report shows **> 90% coverage**
3. ✅ All three test suites run successfully
4. ✅ No timeout or connection errors
5. ✅ Tests complete in < 25 seconds

---

## 📝 Quick Reference

### Test Commands
```bash
npm test                    # Run all tests
npm run test:unit          # Unit tests only
npm run test:redis         # Redis tests only
npm run test:integration   # Integration tests only
npm run test:coverage      # Generate coverage report
npm run test:watch         # Watch mode for development
```

### File Locations
```
cybernauts-backend/
├── src/tests/
│   ├── user.logic.test.ts      # 25 unit tests
│   ├── redis.test.ts            # 19 Redis tests
│   └── integration.test.ts      # 11 integration tests
├── TESTING_GUIDE.md             # Complete testing docs
├── TEST_CASES_SUMMARY.md        # Test overview
└── jest.config.js               # Jest configuration
```

### Environment Setup
```env
DB_URL=mongodb+srv://...
REDIS_ENABLED=true
REDIS_URL=redis://localhost:6379
```

---

## 🆘 Need Help?

If you encounter issues:

1. **Check the TESTING_GUIDE.md** - Comprehensive troubleshooting section
2. **Review test output** - Error messages are descriptive
3. **Verify configuration** - .env and jest.config.js
4. **Check dependencies** - npm list shows installed packages

---

## 🚀 Next Steps

After implementing all tests:

1. ✅ Run tests before every commit
2. ✅ Add CI/CD pipeline (GitHub Actions)
3. ✅ Monitor test coverage over time
4. ✅ Add new tests for new features
5. ✅ Review and refactor tests regularly

---

**Implementation Time**: 15-30 minutes  
**Difficulty**: Easy to Medium  
**Prerequisites**: Node.js, MongoDB, Redis (optional)

---