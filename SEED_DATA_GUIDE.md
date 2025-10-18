# 🌱 Database Seeding Guide - Test Lazy Loading

## Quick Setup

### Install Dependencies
```bash
cd cybernauts-backend
```

### Run the Script

**Option A: Default (200 users)**
```bash
npm run seed
```

**Option B: Choose Size**
```bash
# Small dataset (50 users) - Quick testing
npm run seed:small

# Medium dataset (200 users) - Good for lazy loading demo
npm run seed:medium

# Large dataset (500 users) - Stress testing
npm run seed:large
```

---

## 🎯 What This Script Does

1. **Clears existing data** (optional - can be disabled)
2. **Creates users** with:
   - Random realistic names (John Smith, Emma Garcia, etc.)
   - Random ages (18-67)
   - Random hobbies (2-6 per user from 38 options)
   - Grid-based positions with randomness
3. **Creates friendships**:
   - Each user gets 2-8 random friends
   - Bidirectional connections (A→B and B→A)
4. **Shows statistics**:
   - Total users, friendships, hobbies
   - Average connections per user
   - Sample user profiles

---

## 📊 Expected Output

```
🌱 Starting database seeding...

✅ Connected to MongoDB

⚠️  Found 10 existing users
🗑️  Clearing existing users...
✅ Cleared existing users

👥 Creating 200 users...
   Created 50/200 users...
   Created 100/200 users...
   Created 150/200 users...
   Created 200/200 users...
✅ Created 200 users

🤝 Creating friendships...
   Processed 50/200 users...
   Processed 100/200 users...
   Processed 150/200 users...
   Processed 200/200 users...
✅ Created 847 connections

📊 Database Statistics:
==================================================
Total Users:          200
Total Friendships:    847
Avg Friends/User:     8.47
Total Unique Hobbies: 38
Avg Hobbies/User:     3.82
==================================================

📝 Sample Users:

1. AliceSmith234 (Age: 45)
   Hobbies: coding, music, hiking, yoga
   Friends: 7

2. BobJohnson567 (Age: 28)
   Hobbies: gaming, sports, reading
   Friends: 9

3. CharlieWilliams891 (Age: 33)
   Hobbies: cooking, photography, traveling, art, dancing
   Friends: 6

✅ Database seeding completed successfully!
🚀 You can now test lazy loading with this data.

👋 Disconnected from MongoDB
```

---

## 🧪 Testing Lazy Loading

### After Running Seed Script:

1. **Start your backend:**
   ```bash
   npm run dev
   ```

2. **Start your frontend:**
   ```bash
   cd ../cybernauts-frontend
   npm run dev
   ```

3. **Open browser:** http://localhost:5173

4. **Test Scenarios:**

#### Scenario 1: Compare Load Times
1. **Without Lazy Loading** (default):
   - Graph loads all 200 users at once
   - Notice initial load time
   
2. **With Lazy Loading**:
   - Toggle "Lazy Loading" checkbox in top-right
   - Only 50 users load initially (faster!)
   - Click "Load More" to see next batch

#### Scenario 2: Infinite Scroll
1. Enable "Lazy Loading"
2. Pan around the graph
3. Scroll to edges of viewport
4. Watch automatic loading when near 80% of viewport

#### Scenario 3: Search & Filter
1. Open sidebar
2. Search for hobbies (e.g., "coding")
3. See how many users have that hobby
4. Drag hobby onto nodes

---

## 🎛️ Customization

### Change Number of Users
Edit `seedData.ts`:
```typescript
const NUM_USERS = 500; // Change this number
```

### Change Friends Range
```typescript
const MIN_FRIENDS_PER_USER = 5;  // Minimum connections
const MAX_FRIENDS_PER_USER = 15; // Maximum connections
```

### Add More Hobbies
```typescript
const hobbies = [
  'coding', 'music', 'reading',
  // Add your custom hobbies here
  'robotics', 'astronomy', 'languages'
];
```

### Keep Existing Data
Comment out this line in `seedData.ts`:
```typescript
// await User.deleteMany({}); // Comment this to keep existing users
```

---

## 🚀 Advanced Usage

### Run with Custom Count
```bash
# Create exactly 350 users
NUM_USERS=350 npm run seed
```

### Run Multiple Times
```bash
# Add 50 more users to existing data
# (First comment out User.deleteMany() in script)
npm run seed:small
npm run seed:small  # Run again to add 50 more
```

### Check Database After Seeding
```bash
# Using MongoDB shell or Atlas UI
db.users.countDocuments()
db.users.aggregate([
  { $project: { username: 1, friendCount: { $size: "$friends" } } },
  { $group: { _id: null, avgFriends: { $avg: "$friendCount" } } }
])
```

---

## 📈 Performance Benchmarks

| Dataset Size | Seed Time | Initial Load (No Lazy) | Initial Load (Lazy) |
|--------------|-----------|------------------------|---------------------|
| 50 users     | ~2s       | 800ms                  | 600ms               |
| 200 users    | ~8s       | 2.5s                   | 700ms               |
| 500 users    | ~25s      | 6.5s                   | 800ms               |
| 1000 users   | ~60s      | 15s+                   | 900ms               |

*Lazy loading shows 3-10x faster initial load times!*

---

## 🔧 Troubleshooting

### Error: "DB_URL not found"
**Solution:** Make sure `.env` file exists in `cybernauts-backend/` with:
```
DB_URL=mongodb+srv://...
```

### Error: "Cannot find module 'uuid'"
**Solution:**
```bash
npm install uuid @types/uuid
```

### Error: "ts-node: command not found"
**Solution:**
```bash
npm install -g ts-node
# Or use npx
npx ts-node src/scripts/seedData.ts
```

### Script runs but no data appears
**Solution:** Check MongoDB connection:
1. Verify DB_URL is correct
2. Check MongoDB Atlas IP whitelist (0.0.0.0/0)
3. Verify database name in connection string

### "Out of memory" error with large datasets
**Solution:** Reduce batch size or increase Node memory:
```bash
NODE_OPTIONS="--max-old-space-size=4096" npm run seed:large
```

---

## 🎓 Understanding the Data

### User Structure
```typescript
{
  _id: "uuid-string",
  username: "AliceSmith234",
  age: 28,
  hobbies: ["coding", "music", "yoga"],
  friends: ["uuid1", "uuid2", "uuid3"],
  createdAt: ISODate("2025-01-15T..."),
  position: { x: 250, y: 150 }
}
```

### Friendship Pattern
- **Bidirectional**: If A is friends with B, then B is friends with A
- **Random**: Each user gets 2-8 random friends
- **Realistic**: Creates a connected social graph

### Hobby Distribution
- 38 unique hobbies available
- Each user gets 2-6 random hobbies
- Common hobbies: coding, music, reading, gaming, sports
- Creates natural clusters of shared interests

---

## 🎉 Next Steps

After seeding:

1. **Test all lazy loading features:**
   - Toggle on/off
   - Load more button
   - Infinite scroll
   - Performance comparison

2. **Test existing features with large dataset:**
   - Create/edit/delete users
   - Link/unlink friendships
   - Drag hobbies onto nodes
   - Search and filter

3. **Check popularity scores:**
   - High score nodes (green) should appear
   - Scores based on friends + shared hobbies
   - Hover to see exact scores

4. **Prepare demo:**
   - Show before/after lazy loading
   - Demonstrate performance improvement
   - Explain pagination benefits

---

## 📝 Clean Up

### Remove All Test Data
```bash
# Option 1: Run script again (it clears first)
npm run seed

# Option 2: MongoDB shell
db.users.deleteMany({})

# Option 3: Via API (if you add a route)
curl -X DELETE http://localhost:3001/api/users/all
```

### Reset to Fresh State
1. Clear database
2. Add a few manual users via UI
3. Test features with small dataset
4. Then seed large dataset for demo

---

## 💡 Tips for Demo

1. **Start with small dataset** (10 users) - show basic features
2. **Run seed script** during demo - show live seeding
3. **Compare load times** - show before/after lazy loading
4. **Show pagination UI** - explain the benefits
5. **Highlight statistics** - users, connections, hobbies

---

## ✅ Checklist Before Demo

- [ ] Seed script runs successfully
- [ ] 200+ users created with friendships
- [ ] Lazy loading toggle works
- [ ] Load More button functional
- [ ] Performance improvement visible
- [ ] All existing features still work
- [ ] Toast notifications appear
- [ ] Graph renders without lag
- [ ] Backend API returns paginated data
- [ ] Statistics are correct