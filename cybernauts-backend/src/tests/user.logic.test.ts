// src/tests/user.logic.test.ts - Enhanced with more test cases
import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/user.model';
import userRoutes from '../routes/user.routes';
import { handleGetGraphData } from '../controllers/user.controller';

jest.mock('uuid');

// --- TEST SETUP ---

dotenv.config();

// Initialize a minimal express app for testing
const app = express();
app.use(express.json());
app.use('/api/users', userRoutes);
app.get('/api/graph', handleGetGraphData);

// Connect to a separate test database before all tests run
beforeAll(async () => {
  const db_url = process.env.DB_URL;
  if (!db_url) {
    throw new Error('DB_URL not found in .env.test file');
  }
  const test_db_url = db_url.replace(/([^/]+)$/, 'testDatabase');
  await mongoose.connect(test_db_url);
});

// Clear the database before each test to ensure isolation
beforeEach(async () => {
  await User.deleteMany({});
});

// Disconnect from the database after all tests are done
afterAll(async () => {
  await mongoose.connection.close();
});


// --- TEST SUITES ---

describe('User Relationship and Logic API', () => {

  /**
   * Test Case 1: Conflict Prevention (Unlink Before Delete)
   * This test verifies the business rule that a user with friends cannot be deleted.
   */
  it('should return 409 Conflict when trying to delete a user with friends', async () => {
    // 1. Create two users
    const userA = await new User({ username: 'Alice', age: 30, hobbies: [] }).save();
    const userB = await new User({ username: 'Bob', age: 32, hobbies: [] }).save();

    // 2. Link them
    await request(app)
      .post(`/api/users/${userA._id}/link`)
      .send({ friendId: userB._id });

    // 3. Attempt to delete one user
    const response = await request(app).delete(`/api/users/${userA._id}`);

    // 4. Assert the response is a 409 Conflict
    expect(response.status).toBe(409);
    expect(response.body.message).toContain('User cannot be deleted while they have friends');
  });


  /**
   * Test Case 2: Popularity Score Calculation
   * This test verifies the accuracy of the popularity score formula.
   */
  it('should correctly calculate the popularity score', async () => {
    // 1. Create three users with specific hobbies
    const userA = await new User({ username: 'Alice', age: 30, hobbies: ['coding', 'music'] }).save();
    const userB = await new User({ username: 'Bob', age: 32, hobbies: ['coding', 'sports'] }).save();
    const userC = await new User({ username: 'Charlie', age: 28, hobbies: ['music', 'art'] }).save();
    
    // 2. Link Alice to Bob and Charlie
    await request(app).post(`/api/users/${userA._id}/link`).send({ friendId: userB._id });
    await request(app).post(`/api/users/${userA._id}/link`).send({ friendId: userC._id });

    // 3. Fetch the graph data
    const response = await request(app).get('/api/graph');
    
    // 4. Find Alice and check her score
    // Expected Score = 2 friends + (1 shared hobby with Bob + 1 shared hobby with Charlie) * 0.5
    // Expected Score = 2 + (2 * 0.5) = 3
    const aliceNode = response.body.nodes.find((node: any) => node.id === userA._id);
    expect(aliceNode.data.popularityScore).toBe(3);
  });

  
  /**
   * Test Case 3: Relationship Creation & Deletion (Linking)
   * This test verifies that linking is mutual and unlinking works correctly.
   */
  it('should create a mutual friendship and correctly remove it', async () => {
    // 1. Create two users
    const userA = await new User({ username: 'Alice', age: 30, hobbies: [] }).save();
    const userB = await new User({ username: 'Bob', age: 32, hobbies: [] }).save();

    // 2. Link them
    const linkResponse = await request(app)
      .post(`/api/users/${userA._id}/link`)
      .send({ friendId: userB._id });
    expect(linkResponse.status).toBe(200);

    // 3. Verify the link is mutual
    const updatedUserA = await User.findById(userA._id);
    const updatedUserB = await User.findById(userB._id);
    expect(updatedUserA?.friends).toContain(userB._id);
    expect(updatedUserB?.friends).toContain(userA._id);

    // 4. Unlink them
    const unlinkResponse = await request(app)
      .delete(`/api/users/${userA._id}/unlink`)
      .send({ friendId: userB._id });
    expect(unlinkResponse.status).toBe(200);

    // 5. Verify the link is removed from both
    const finalUserA = await User.findById(userA._id);
    const finalUserB = await User.findById(userB._id);
    expect(finalUserA?.friends.length).toBe(0);
    expect(finalUserB?.friends.length).toBe(0);
  });


  /**
   * Test Case 4: Self-Linking Prevention
   * Users should not be able to link to themselves.
   */
  it('should prevent a user from linking to themselves', async () => {
    const user = await new User({ username: 'Alice', age: 30, hobbies: [] }).save();

    const response = await request(app)
      .post(`/api/users/${user._id}/link`)
      .send({ friendId: user._id });

    expect(response.status).toBe(500); // Should fail with error
  });


  /**
   * Test Case 5: Duplicate Link Prevention
   * Linking the same users twice should not create duplicate friendships.
   */
  it('should not create duplicate friendships', async () => {
    const userA = await new User({ username: 'Alice', age: 30, hobbies: [] }).save();
    const userB = await new User({ username: 'Bob', age: 32, hobbies: [] }).save();

    // Link once
    await request(app)
      .post(`/api/users/${userA._id}/link`)
      .send({ friendId: userB._id });

    // Link again
    await request(app)
      .post(`/api/users/${userA._id}/link`)
      .send({ friendId: userB._id });

    // Verify only one friendship exists
    const updatedUserA = await User.findById(userA._id);
    expect(updatedUserA?.friends.length).toBe(1);
  });


  /**
   * Test Case 6: Delete User After Unlinking
   * After unlinking, user should be deletable.
   */
  it('should allow deletion after unlinking all friends', async () => {
    const userA = await new User({ username: 'Alice', age: 30, hobbies: [] }).save();
    const userB = await new User({ username: 'Bob', age: 32, hobbies: [] }).save();

    // Link them
    await request(app)
      .post(`/api/users/${userA._id}/link`)
      .send({ friendId: userB._id });

    // Unlink them
    await request(app)
      .delete(`/api/users/${userA._id}/unlink`)
      .send({ friendId: userB._id });

    // Delete should succeed
    const deleteResponse = await request(app).delete(`/api/users/${userA._id}`);
    expect(deleteResponse.status).toBe(200);

    // Verify user is deleted
    const deletedUser = await User.findById(userA._id);
    expect(deletedUser).toBeNull();
  });


  /**
   * Test Case 7: Popularity Score with No Shared Hobbies
   * Users with no shared hobbies should only count friends.
   */
  it('should calculate score correctly with no shared hobbies', async () => {
    const userA = await new User({ username: 'Alice', age: 30, hobbies: ['coding'] }).save();
    const userB = await new User({ username: 'Bob', age: 32, hobbies: ['sports'] }).save();

    await request(app)
      .post(`/api/users/${userA._id}/link`)
      .send({ friendId: userB._id });

    const response = await request(app).get('/api/graph');
    const aliceNode = response.body.nodes.find((node: any) => node.id === userA._id);

    // Score = 1 friend + (0 shared hobbies * 0.5) = 1
    expect(aliceNode.data.popularityScore).toBe(1);
  });


  /**
   * Test Case 8: Popularity Score with Multiple Shared Hobbies
   * Users sharing multiple hobbies should have higher scores.
   */
  it('should calculate score correctly with multiple shared hobbies', async () => {
    const userA = await new User({ 
      username: 'Alice', 
      age: 30, 
      hobbies: ['coding', 'music', 'art', 'gaming'] 
    }).save();
    
    const userB = await new User({ 
      username: 'Bob', 
      age: 32, 
      hobbies: ['coding', 'music', 'art', 'gaming'] 
    }).save();

    await request(app)
      .post(`/api/users/${userA._id}/link`)
      .send({ friendId: userB._id });

    const response = await request(app).get('/api/graph');
    const aliceNode = response.body.nodes.find((node: any) => node.id === userA._id);

    // Score = 1 friend + (4 shared hobbies * 0.5) = 3
    expect(aliceNode.data.popularityScore).toBe(3);
  });


  /**
   * Test Case 9: Create User with Validation
   * Test input validation for user creation.
   */
  it('should validate required fields when creating a user', async () => {
    const invalidUser = { username: '', age: 25 };

    const response = await request(app)
      .post('/api/users')
      .send(invalidUser);

    expect(response.status).toBe(400);
  });


  /**
   * Test Case 10: Update User Hobbies
   * Updating hobbies should recalculate popularity score.
   */
  it('should update user hobbies and recalculate score', async () => {
    const userA = await new User({ username: 'Alice', age: 30, hobbies: ['coding'] }).save();
    const userB = await new User({ username: 'Bob', age: 32, hobbies: ['coding', 'music'] }).save();

    await request(app)
      .post(`/api/users/${userA._id}/link`)
      .send({ friendId: userB._id });

    // Update Alice's hobbies to match Bob
    await request(app)
      .put(`/api/users/${userA._id}`)
      .send({ hobbies: ['coding', 'music'] });

    const response = await request(app).get('/api/graph');
    const aliceNode = response.body.nodes.find((node: any) => node.id === userA._id);

    // Score = 1 friend + (2 shared hobbies * 0.5) = 2
    expect(aliceNode.data.popularityScore).toBe(2);
  });


  /**
   * Test Case 11: Link Non-Existent User
   * Should return 404 when trying to link with non-existent user.
   */
  it('should return 404 when linking with non-existent user', async () => {
    const user = await new User({ username: 'Alice', age: 30, hobbies: [] }).save();
    const fakeUserId = 'non-existent-id';

    const response = await request(app)
      .post(`/api/users/${user._id}/link`)
      .send({ friendId: fakeUserId });

    expect(response.status).toBe(404);
  });


  /**
   * Test Case 12: Delete Non-Existent User
   * Should return 404 when deleting non-existent user.
   */
  it('should return 404 when deleting non-existent user', async () => {
    const fakeUserId = 'non-existent-id';

    const response = await request(app).delete(`/api/users/${fakeUserId}`);

    expect(response.status).toBe(404);
  });


  /**
   * Test Case 13: Get All Users
   * Should return all users in the database.
   */
  it('should return all users', async () => {
    await new User({ username: 'Alice', age: 30, hobbies: ['coding'] }).save();
    await new User({ username: 'Bob', age: 32, hobbies: ['sports'] }).save();
    await new User({ username: 'Charlie', age: 28, hobbies: ['music'] }).save();

    const response = await request(app).get('/api/users');

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(3);
  });


  /**
   * Test Case 14: Graph Data Structure
   * Verify graph endpoint returns correct data structure.
   */
  it('should return correct graph data structure', async () => {
    const userA = await new User({ username: 'Alice', age: 30, hobbies: ['coding'] }).save();
    const userB = await new User({ username: 'Bob', age: 32, hobbies: ['sports'] }).save();

    await request(app)
      .post(`/api/users/${userA._id}/link`)
      .send({ friendId: userB._id });

    const response = await request(app).get('/api/graph');

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('nodes');
    expect(response.body).toHaveProperty('edges');
    expect(Array.isArray(response.body.nodes)).toBe(true);
    expect(Array.isArray(response.body.edges)).toBe(true);
    expect(response.body.nodes.length).toBe(2);
    expect(response.body.edges.length).toBe(1);
  });


  /**
   * Test Case 15: Node Types Based on Score
   * High score nodes should have type 'highScoreNode'.
   */
  it('should assign correct node type based on popularity score', async () => {
    // Create a user with high score (> 5)
    const userA = await new User({ 
      username: 'Alice', 
      age: 30, 
      hobbies: ['coding', 'music', 'art'] 
    }).save();
    
    // Create multiple friends with shared hobbies
    for (let i = 0; i < 4; i++) {
      const friend = await new User({ 
        username: `Friend${i}`, 
        age: 25 + i, 
        hobbies: ['coding', 'music'] 
      }).save();
      
      await request(app)
        .post(`/api/users/${userA._id}/link`)
        .send({ friendId: friend._id });
    }

    const response = await request(app).get('/api/graph');
    const aliceNode = response.body.nodes.find((node: any) => node.id === userA._id);

    // Score = 4 friends + (2 shared × 4 friends × 0.5) = 4 + 4 = 8
    expect(aliceNode.data.popularityScore).toBeGreaterThan(5);
    expect(aliceNode.type).toBe('highScoreNode');
  });


  /**
   * Test Case 16: Low Score Node Type
   * Low score nodes should have type 'lowScoreNode'.
   */
  it('should assign lowScoreNode type for low popularity scores', async () => {
    const user = await new User({ username: 'Alice', age: 30, hobbies: ['coding'] }).save();

    const response = await request(app).get('/api/graph');
    const userNode = response.body.nodes.find((node: any) => node.id === user._id);

    // Score = 0 friends + 0 shared = 0
    expect(userNode.data.popularityScore).toBeLessThanOrEqual(5);
    expect(userNode.type).toBe('lowScoreNode');
  });


  /**
   * Test Case 17: Unlink Non-Existent Friendship
   * Unlinking users who aren't friends should not error.
   */
  it('should handle unlinking users who are not friends gracefully', async () => {
    const userA = await new User({ username: 'Alice', age: 30, hobbies: [] }).save();
    const userB = await new User({ username: 'Bob', age: 32, hobbies: [] }).save();

    const response = await request(app)
      .delete(`/api/users/${userA._id}/unlink`)
      .send({ friendId: userB._id });

    expect(response.status).toBe(200); // Should succeed (idempotent operation)
  });


  /**
   * Test Case 18: Update Non-Existent User
   * Should return 404 when updating non-existent user.
   */
  it('should return 404 when updating non-existent user', async () => {
    const fakeUserId = 'non-existent-id';

    const response = await request(app)
      .put(`/api/users/${fakeUserId}`)
      .send({ age: 35 });

    expect(response.status).toBe(404);
  });


  /**
   * Test Case 19: Complex Network Scenario
   * Test a complex network with multiple users and connections.
   */
  it('should handle complex network with multiple connections', async () => {
    // Create 5 users
    const users = await Promise.all([
      new User({ username: 'Alice', age: 30, hobbies: ['coding', 'music'] }).save(),
      new User({ username: 'Bob', age: 32, hobbies: ['coding', 'sports'] }).save(),
      new User({ username: 'Charlie', age: 28, hobbies: ['music', 'art'] }).save(),
      new User({ username: 'David', age: 35, hobbies: ['sports', 'cooking'] }).save(),
      new User({ username: 'Eve', age: 27, hobbies: ['art', 'cooking'] }).save(),
    ]);

    // Create a network: Alice connects to all, others connect to each other
    for (let i = 1; i < users.length; i++) {
      await request(app)
        .post(`/api/users/${users[0]._id}/link`)
        .send({ friendId: users[i]._id });
    }

    // Bob and Charlie are friends
    await request(app)
      .post(`/api/users/${users[1]._id}/link`)
      .send({ friendId: users[2]._id });

    const response = await request(app).get('/api/graph');

    expect(response.body.nodes.length).toBe(5);
    expect(response.body.edges.length).toBe(5); // Alice has 4 friends + Bob-Charlie

    const aliceNode = response.body.nodes.find((n: any) => n.data.label === 'Alice');
    expect(aliceNode.data.popularityScore).toBeGreaterThan(4); // High score due to many connections
  });


  /**
   * Test Case 20: Edge Case - Empty Hobbies
   * User with empty hobbies array should still work.
   */
  it('should handle users with empty hobbies', async () => {
    const user = await new User({ username: 'Alice', age: 30, hobbies: [] }).save();

    const response = await request(app).get('/api/graph');
    const userNode = response.body.nodes.find((node: any) => node.id === user._id);

    expect(userNode.data.hobbies).toEqual([]);
    expect(userNode.data.popularityScore).toBe(0);
  });
});


// --- PAGINATION TESTS ---

describe('Pagination Tests', () => {
  beforeEach(async () => {
    // Create 150 test users
    const users = [];
    for (let i = 0; i < 150; i++) {
      users.push({
        username: `User${i}`,
        age: 20 + (i % 50),
        hobbies: ['coding', 'music'],
        friends: [],
        createdAt: new Date(),
        position: { x: i * 10, y: i * 10 }
      });
    }
    await User.insertMany(users);
  });

  it('should return first page of graph data', async () => {
    const response = await request(app).get('/api/graph?page=1&limit=50');

    expect(response.status).toBe(200);
    expect(response.body.nodes.length).toBe(50);
    expect(response.body.pagination.page).toBe(1);
    expect(response.body.pagination.total).toBe(150);
    expect(response.body.pagination.hasMore).toBe(true);
  });

  it('should return second page of graph data', async () => {
    const response = await request(app).get('/api/graph?page=2&limit=50');

    expect(response.status).toBe(200);
    expect(response.body.nodes.length).toBe(50);
    expect(response.body.pagination.page).toBe(2);
    expect(response.body.pagination.hasMore).toBe(true);
  });

  it('should return last page with remaining users', async () => {
    const response = await request(app).get('/api/graph?page=3&limit=50');

    expect(response.status).toBe(200);
    expect(response.body.nodes.length).toBe(50);
    expect(response.body.pagination.page).toBe(3);
    expect(response.body.pagination.hasMore).toBe(false);
  });

  it('should handle pagination with custom limit', async () => {
    const response = await request(app).get('/api/graph?page=1&limit=25');

    expect(response.status).toBe(200);
    expect(response.body.nodes.length).toBe(25);
    expect(response.body.pagination.totalPages).toBe(6);
  });
});


// --- PERFORMANCE TESTS ---

describe('Performance Tests', () => {
  it('should handle creating many users efficiently', async () => {
    const startTime = Date.now();
    
    const promises = [];
    for (let i = 0; i < 50; i++) {
      promises.push(
        request(app)
          .post('/api/users')
          .send({ username: `User${i}`, age: 20 + i, hobbies: ['coding'] })
      );
    }
    
    await Promise.all(promises);
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Should complete in under 10 seconds
    expect(duration).toBeLessThan(10000);
    
    const users = await User.find();
    expect(users.length).toBe(50);
  });
});