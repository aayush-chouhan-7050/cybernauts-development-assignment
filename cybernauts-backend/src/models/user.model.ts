// src/models/user.model.ts
import { Schema, model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

// Define the User interface for TypeScript
export interface IUser {
  _id: string;
  username: string;
  age: number;
  hobbies: string[];
  friends: string[];
  createdAt: Date;
  position: { x: number; y: number };
}

// Define the Mongoose Schema
const userSchema = new Schema<IUser>({
  _id: {
    type: String,
    default: () => uuidv4(),
  },
  username: {
    type: String,
    required: true,
    trim: true,
  },
  age: {
    type: Number,
    required: true,
  },
  hobbies: {
    type: [String],
    required: true,
    default: [],
  },
  friends: {
    type: [String],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  position: {
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 },
  },
});

// Create and export the User model
const User = model<IUser>('User', userSchema);
export default User;