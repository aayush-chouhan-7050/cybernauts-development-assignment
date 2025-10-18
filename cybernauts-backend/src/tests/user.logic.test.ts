// src/tests/user.logic.test.ts
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
   * This test verifies the business rule that a user with friends cannot be deleted. [cite: 46-47, 93]
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
   * This test verifies the accuracy of the popularity score formula. [cite: 43-45, 92]
   */
  it('should correctly calculate the popularity score', async () => {
    // 1. Create three users with specific hobbies
    const userA = await new User({ username: 'Alice', age: 30, hobbies: ['Coding', 'Music'] }).save();
    const userB = await new User({ username: 'Bob', age: 32, hobbies: ['Coding', 'Sports'] }).save();
    const userC = await new User({ username: 'Charlie', age: 28, hobbies: ['Music', 'Art'] }).save();
    
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
   * This test verifies that linking is mutual and unlinking works correctly. [cite: 91]
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
});