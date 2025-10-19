// src/tests/integration.test.ts - End-to-End Integration Tests
import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/user.model';
import userRoutes from '../routes/user.routes';
import { handleGetGraphData } from '../controllers/user.controller';

dotenv.config();

const app = express();
app.use(express.json());
app.use('/api/users', userRoutes);
app.get('/api/graph', handleGetGraphData);

beforeAll(async () => {
  const db_url = process.env.DB_URL;
  if (!db_url) {
    throw new Error('DB_URL not found in .env file');
  }
  const test_db_url = db_url.replace(/([^/]+)$/, 'testDatabaseIntegration');
  await mongoose.connect(test_db_url);
});

beforeEach(async () => {
  await User.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Complete User Workflow Integration Tests', () => {
  
  /**
   * Test Case 1: Complete User Lifecycle
   * Create → Update → Link → Unlink → Delete
   */
  it('should handle complete user lifecycle', async () => {
    // Step 1: Create first user
    const createResponse1 = await request(app)
      .post('/api/users')
      .send({
        username: 'Alice',
        age: 30,
        hobbies: ['coding', 'music']
      });
    
    expect(createResponse1.status).toBe(201);
    const alice = createResponse1.body;
    expect(alice._id).toBeDefined();
    
    // Step 2: Create second user
    const createResponse2 = await request(app)
      .post('/api/users')
      .send({
        username: 'Bob',
        age: 32,
        hobbies: ['coding', 'sports']
      });
    
    expect(createResponse2.status).toBe(201);
    const bob = createResponse2.body;
    
    // Step 3: Update Alice
    const updateResponse = await request(app)
      .put(`/api/users/${alice._id}`)
      .send({
        age: 31,
        hobbies: ['coding', 'music', 'art']
      });
    
    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.age).toBe(31);
    expect(updateResponse.body.hobbies).toContain('art');
    
    // Step 4: Link Alice and Bob
    const linkResponse = await request(app)
      .post(`/api/users/${alice._id}/link`)
      .send({ friendId: bob._id });
    
    expect(linkResponse.status).toBe(200);
    
    // Step 5: Verify link in graph
    const graphResponse = await request(app).get('/api/graph');
    expect(graphResponse.body.edges.length).toBe(1);
    
    // Step 6: Try to delete Alice (should fail)
    const deleteAttempt = await request(app)
      .delete(`/api/users/${alice._id}`);
    
    expect(deleteAttempt.status).toBe(409);
    
    // Step 7: Unlink users
    const unlinkResponse = await request(app)
      .delete(`/api/users/${alice._id}/unlink`)
      .send({ friendId: bob._id });
    
    expect(unlinkResponse.status).toBe(200);
    
    // Step 8: Delete Alice (should succeed)
    const deleteResponse = await request(app)
      .delete(`/api/users/${alice._id}`);
    
    expect(deleteResponse.status).toBe(200);
    
    // Step 9: Verify deletion
    const finalUsers = await request(app).get('/api/users');
    expect(finalUsers.body.length).toBe(1);
    expect(finalUsers.body[0].username).toBe('Bob');
  });

  /**
   * Test Case 2: Social Network Simulation
   * Create multiple users and build a network
   */
  it('should build and manage a social network', async () => {
    // Create 5 users with more shared hobbies to increase Alice's score
    const usernames = ['Alice', 'Bob', 'Charlie', 'David', 'Eve'];
    const hobbies = [
      ['coding', 'music', 'art'],      // Alice - 3 hobbies
      ['coding', 'music', 'sports'],   // Bob - shares 2 with Alice
      ['music', 'art', 'reading'],     // Charlie - shares 2 with Alice
      ['coding', 'art', 'cooking'],    // David - shares 2 with Alice
      ['coding', 'music', 'gaming']    // Eve - shares 2 with Alice
    ];
    
    const users = [];
    for (let i = 0; i < usernames.length; i++) {
      const response = await request(app)
        .post('/api/users')
        .send({
          username: usernames[i],
          age: 25 + i,
          hobbies: hobbies[i]
        });
      users.push(response.body);
    }
    
    // Create connections
    // Alice connects to everyone
    for (let i = 1; i < users.length; i++) {
      await request(app)
        .post(`/api/users/${users[0]._id}/link`)
        .send({ friendId: users[i]._id });
    }
    
    // Bob connects to Charlie
    await request(app)
      .post(`/api/users/${users[1]._id}/link`)
      .send({ friendId: users[2]._id });
    
    // David connects to Eve
    await request(app)
      .post(`/api/users/${users[3]._id}/link`)
      .send({ friendId: users[4]._id });
    
    // Verify graph
    const graphResponse = await request(app).get('/api/graph');
    
    expect(graphResponse.body.nodes.length).toBe(5);
    expect(graphResponse.body.edges.length).toBe(6);
    
    // Alice should have highest popularity score
    // Score = 4 friends + (2+2+2+2 shared hobbies * 0.5) = 4 + 4 = 8
    const aliceNode = graphResponse.body.nodes.find(
      (n: any) => n.data.label === 'Alice'
    );
    
    expect(aliceNode.data.popularityScore).toBeGreaterThan(5);
    expect(aliceNode.type).toBe('highScoreNode');
  });

  /**
   * Test Case 3: Hobby-Based Popularity
   * Test score changes with hobby updates
   */
  it('should update popularity scores when hobbies change', async () => {
    // Create users with different hobbies
    const alice = await request(app)
      .post('/api/users')
      .send({
        username: 'Alice',
        age: 30,
        hobbies: ['coding']
      });
    
    const bob = await request(app)
      .post('/api/users')
      .send({
        username: 'Bob',
        age: 32,
        hobbies: ['sports']
      });
    
    const charlie = await request(app)
      .post('/api/users')
      .send({
        username: 'Charlie',
        age: 28,
        hobbies: ['music']
      });
    
    // Link all to Alice
    await request(app)
      .post(`/api/users/${alice.body._id}/link`)
      .send({ friendId: bob.body._id });
    
    await request(app)
      .post(`/api/users/${alice.body._id}/link`)
      .send({ friendId: charlie.body._id });
    
    // Initial score (no shared hobbies)
    let graph = await request(app).get('/api/graph');
    let aliceNode = graph.body.nodes.find((n: any) => n.data.label === 'Alice');
    
    const initialScore = aliceNode.data.popularityScore;
    expect(initialScore).toBe(2); // 2 friends, 0 shared hobbies
    
    // Update Bob's hobbies to match Alice
    await request(app)
      .put(`/api/users/${bob.body._id}`)
      .send({ hobbies: ['coding', 'sports'] });
    
    // Check updated score
    graph = await request(app).get('/api/graph');
    aliceNode = graph.body.nodes.find((n: any) => n.data.label === 'Alice');
    
    // Score = 2 friends + (1 shared hobby * 0.5) = 2.5
    expect(aliceNode.data.popularityScore).toBe(2.5);
    
    // Update Charlie's hobbies to also match
    await request(app)
      .put(`/api/users/${charlie.body._id}`)
      .send({ hobbies: ['coding', 'music'] });
    
    // Check final score
    graph = await request(app).get('/api/graph');
    aliceNode = graph.body.nodes.find((n: any) => n.data.label === 'Alice');
    
    // Score = 2 friends + (2 shared hobbies * 0.5) = 3
    expect(aliceNode.data.popularityScore).toBe(3);
  });

  /**
   * Test Case 4: Cascading Friendship Deletion
   * Verify unlinking updates both users
   */
  it('should update both users when unlinking', async () => {
    const alice = await request(app)
      .post('/api/users')
      .send({ username: 'Alice', age: 30, hobbies: ['coding'] });
    
    const bob = await request(app)
      .post('/api/users')
      .send({ username: 'Bob', age: 32, hobbies: ['sports'] });
    
    const charlie = await request(app)
      .post('/api/users')
      .send({ username: 'Charlie', age: 28, hobbies: ['music'] });
    
    // Create network: Alice-Bob, Alice-Charlie, Bob-Charlie
    await request(app)
      .post(`/api/users/${alice.body._id}/link`)
      .send({ friendId: bob.body._id });
    
    await request(app)
      .post(`/api/users/${alice.body._id}/link`)
      .send({ friendId: charlie.body._id });
    
    await request(app)
      .post(`/api/users/${bob.body._id}/link`)
      .send({ friendId: charlie.body._id });
    
    // Verify all connections
    let graph = await request(app).get('/api/graph');
    expect(graph.body.edges.length).toBe(3);
    
    // Unlink Alice-Bob
    await request(app)
      .delete(`/api/users/${alice.body._id}/unlink`)
      .send({ friendId: bob.body._id });
    
    // Verify connection removed
    graph = await request(app).get('/api/graph');
    expect(graph.body.edges.length).toBe(2);
    
    // Verify both users' friend lists updated
    const aliceData = await User.findById(alice.body._id);
    const bobData = await User.findById(bob.body._id);
    
    expect(aliceData?.friends).not.toContain(bob.body._id);
    expect(bobData?.friends).not.toContain(alice.body._id);
    
    // But they should still have other friends
    expect(aliceData?.friends.length).toBe(1); // Still has Charlie
    expect(bobData?.friends.length).toBe(1); // Still has Charlie
  });

  /**
   * Test Case 5: Node Type Transitions
   * Test node type changes based on score thresholds
   */
  it('should transition node types when score crosses threshold', async () => {
    const alice = await request(app)
      .post('/api/users')
      .send({
        username: 'Alice',
        age: 30,
        hobbies: ['coding', 'music', 'art']
      });
    
    // Initially low score node
    let graph = await request(app).get('/api/graph');
    let aliceNode = graph.body.nodes.find((n: any) => n.data.label === 'Alice');
    expect(aliceNode.type).toBe('lowScoreNode');
    
    // Create friends with shared hobbies to push score > 5
    const friends = [];
    for (let i = 0; i < 4; i++) {
      const friend = await request(app)
        .post('/api/users')
        .send({
          username: `Friend${i}`,
          age: 25 + i,
          hobbies: ['coding', 'music'] // 2 shared with Alice
        });
      friends.push(friend.body);
      
      await request(app)
        .post(`/api/users/${alice.body._id}/link`)
        .send({ friendId: friend.body._id });
    }
    
    // Now should be high score node
    // Score = 4 friends + (2 shared * 4 friends * 0.5) = 4 + 4 = 8
    graph = await request(app).get('/api/graph');
    aliceNode = graph.body.nodes.find((n: any) => n.data.label === 'Alice');
    
    expect(aliceNode.data.popularityScore).toBeGreaterThan(5);
    expect(aliceNode.type).toBe('highScoreNode');
    
    // Unlink to drop score back below threshold
    for (const friend of friends) {
      await request(app)
        .delete(`/api/users/${alice.body._id}/unlink`)
        .send({ friendId: friend._id });
    }
    
    // Should be low score node again
    graph = await request(app).get('/api/graph');
    aliceNode = graph.body.nodes.find((n: any) => n.data.label === 'Alice');
    
    expect(aliceNode.data.popularityScore).toBe(0);
    expect(aliceNode.type).toBe('lowScoreNode');
  });

  /**
   * Test Case 6: Bulk Operations
   * Test creating and managing many users efficiently
   */
  it('should handle bulk user operations', async () => {
    const userCount = 20;
    const users = [];
    
    // Create 20 users
    for (let i = 0; i < userCount; i++) {
      const response = await request(app)
        .post('/api/users')
        .send({
          username: `User${i}`,
          age: 20 + i,
          hobbies: ['coding', 'music', 'art'].slice(0, (i % 3) + 1)
        });
      users.push(response.body);
    }
    
    // Verify all created
    const allUsers = await request(app).get('/api/users');
    expect(allUsers.body.length).toBe(userCount);
    
    // Create random connections
    const connectionCount = 30;
    for (let i = 0; i < connectionCount; i++) {
      const user1 = users[Math.floor(Math.random() * users.length)];
      const user2 = users[Math.floor(Math.random() * users.length)];
      
      if (user1._id !== user2._id) {
        await request(app)
          .post(`/api/users/${user1._id}/link`)
          .send({ friendId: user2._id })
          .catch(() => {}); // Ignore duplicate link errors
      }
    }
    
    // Verify graph contains all nodes
    const graph = await request(app).get('/api/graph');
    expect(graph.body.nodes.length).toBe(userCount);
    expect(graph.body.edges.length).toBeGreaterThan(0);
  });

  /**
   * Test Case 7: Error Recovery
   * Test system behavior with invalid operations
   */
  it('should handle and recover from errors gracefully', async () => {
    // Try to link non-existent users
    const linkResponse1 = await request(app)
      .post('/api/users/invalid-id-1/link')
      .send({ friendId: 'invalid-id-2' });
    
    expect(linkResponse1.status).toBe(404);
    
    // Create a valid user
    const user = await request(app)
      .post('/api/users')
      .send({ username: 'Alice', age: 30, hobbies: ['coding'] });
    
    // Try to link with non-existent friend
    const linkResponse2 = await request(app)
      .post(`/api/users/${user.body._id}/link`)
      .send({ friendId: 'invalid-id' });
    
    expect(linkResponse2.status).toBe(404);
    
    // System should still work normally
    const allUsers = await request(app).get('/api/users');
    expect(allUsers.body.length).toBe(1);
    
    // Update should still work
    const updateResponse = await request(app)
      .put(`/api/users/${user.body._id}`)
      .send({ age: 31 });
    
    expect(updateResponse.status).toBe(200);
  });

  /**
   * Test Case 8: Data Consistency
   * Verify data remains consistent across operations
   */
  it('should maintain data consistency', async () => {
    // Create users
    const alice = await request(app)
      .post('/api/users')
      .send({ username: 'Alice', age: 30, hobbies: ['coding'] });
    
    const bob = await request(app)
      .post('/api/users')
      .send({ username: 'Bob', age: 32, hobbies: ['coding'] });
    
    // Link them
    await request(app)
      .post(`/api/users/${alice.body._id}/link`)
      .send({ friendId: bob.body._id });
    
    // Verify database state
    const aliceDB = await User.findById(alice.body._id);
    const bobDB = await User.findById(bob.body._id);
    
    expect(aliceDB?.friends).toContain(bob.body._id);
    expect(bobDB?.friends).toContain(alice.body._id);
    
    // Verify API state matches
    const allUsers = await request(app).get('/api/users');
    const aliceAPI = allUsers.body.find((u: any) => u._id === alice.body._id);
    const bobAPI = allUsers.body.find((u: any) => u._id === bob.body._id);
    
    expect(aliceAPI.friends).toContain(bob.body._id);
    expect(bobAPI.friends).toContain(alice.body._id);
    
    // Verify graph state matches
    const graph = await request(app).get('/api/graph');
    const edge = graph.body.edges.find(
      (e: any) =>
        (e.source === alice.body._id && e.target === bob.body._id) ||
        (e.source === bob.body._id && e.target === alice.body._id)
    );
    
    expect(edge).toBeDefined();
  });
});

describe('Pagination Integration Tests', () => {
  
  beforeEach(async () => {
    // Create 100 test users for pagination
    const users = [];
    for (let i = 0; i < 100; i++) {
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

  it('should paginate graph data correctly', async () => {
    // Page 1
    const page1 = await request(app).get('/api/graph?page=1&limit=25');
    expect(page1.body.nodes.length).toBe(25);
    expect(page1.body.pagination.page).toBe(1);
    expect(page1.body.pagination.hasMore).toBe(true);
    
    // Page 2
    const page2 = await request(app).get('/api/graph?page=2&limit=25');
    expect(page2.body.nodes.length).toBe(25);
    expect(page2.body.pagination.page).toBe(2);
    
    // Verify no overlap
    const page1Ids = new Set(page1.body.nodes.map((n: any) => n.id));
    const page2Ids = new Set(page2.body.nodes.map((n: any) => n.id));
    
    page2Ids.forEach(id => {
      expect(page1Ids.has(id)).toBe(false);
    });
  });

  it('should handle last page correctly', async () => {
    const lastPage = await request(app).get('/api/graph?page=4&limit=25');
    
    expect(lastPage.body.nodes.length).toBe(25);
    expect(lastPage.body.pagination.hasMore).toBe(false);
    expect(lastPage.body.pagination.totalPages).toBe(4);
  });

  it('should include connections across pages', async () => {
    // Get all users
    const allUsers = await User.find().limit(10);
    
    // Create cross-page connections
    if (allUsers.length >= 2) {
      await request(app)
        .post(`/api/users/${allUsers[0]._id}/link`)
        .send({ friendId: allUsers[1]._id });
    }
    
    // Get first page with connections
    const page1 = await request(app).get(
      '/api/graph?page=1&limit=5&includeConnections=true'
    );
    
    expect(page1.body.edges).toBeDefined();
  });
});