// cybernauts-backend/src/scripts/seedData.ts
// Run this script to populate database with test data

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import User from '../models/user.model';

dotenv.config();

// Configuration
const NUM_USERS = 200; // Change this to create more/fewer users
const MIN_FRIENDS_PER_USER = 2;
const MAX_FRIENDS_PER_USER = 8;

// Sample data
const firstNames = [
  'Alice', 'Bob', 'Charlie', 'David', 'Emma', 'Frank', 'Grace', 'Henry',
  'Iris', 'Jack', 'Kate', 'Liam', 'Mia', 'Noah', 'Olivia', 'Peter',
  'Quinn', 'Rachel', 'Sam', 'Tara', 'Uma', 'Victor', 'Wendy', 'Xavier',
  'Yara', 'Zack', 'Amy', 'Ben', 'Cara', 'Dan', 'Eva', 'Felix',
  'Gina', 'Hugo', 'Ivy', 'Jake', 'Luna', 'Max', 'Nina', 'Oscar',
  'Penny', 'Ryan', 'Sara', 'Tom', 'Violet', 'Will', 'Zoe', 'Adam',
  'Bella', 'Chris', 'Diana', 'Eli', 'Fiona', 'George', 'Hannah', 'Ian'
];

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas',
  'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White',
  'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young'
];

const hobbies = [
  'coding', 'music', 'reading', 'gaming', 'sports', 'cooking', 'art', 'photography',
  'traveling', 'dancing', 'hiking', 'yoga', 'swimming', 'cycling', 'running', 'writing',
  'gardening', 'painting', 'singing', 'chess', 'fishing', 'camping', 'skiing', 'surfing',
  'meditation', 'knitting', 'pottery', 'movies', 'theater', 'volunteering', 'blogging',
  'podcasting', 'animation', 'baking', 'crafts', 'origami', 'calligraphy', 'woodworking'
];

// Helper functions
function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomElements<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

function generateUsername(): string {
  const firstName = getRandomElement(firstNames);
  const lastName = getRandomElement(lastNames);
  const number = Math.floor(Math.random() * 1000);
  return `${firstName}${lastName}${number}`;
}

function generateAge(): number {
  return Math.floor(Math.random() * 50) + 18; // Age between 18-67
}

function generateHobbies(): string[] {
  const numHobbies = Math.floor(Math.random() * 5) + 2; // 2-6 hobbies
  return getRandomElements(hobbies, numHobbies);
}

function generatePosition(index: number, total: number): { x: number; y: number } {
  // Arrange in a grid-like pattern with some randomness
  const cols = Math.ceil(Math.sqrt(total));
  const row = Math.floor(index / cols);
  const col = index % cols;
  
  const spacing = 250;
  const randomOffset = 50;
  
  return {
    x: col * spacing + (Math.random() - 0.5) * randomOffset,
    y: row * spacing + (Math.random() - 0.5) * randomOffset
  };
}

// Main seeding function
async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...\n');

    // Connect to MongoDB
    const DB_URL = process.env.DB_URL;
    if (!DB_URL) {
      throw new Error('DB_URL not found in .env file');
    }

    await mongoose.connect(DB_URL);
    console.log('✅ Connected to MongoDB\n');

    // Clear existing users (optional - comment out if you want to keep existing data)
    const existingCount = await User.countDocuments();
    if (existingCount > 0) {
      console.log(`⚠️  Found ${existingCount} existing users`);
      console.log('🗑️  Clearing existing users...');
      await User.deleteMany({});
      console.log('✅ Cleared existing users\n');
    }

    // Create users
    console.log(`👥 Creating ${NUM_USERS} users...`);
    const users = [];
    const userIds: string[] = [];

    for (let i = 0; i < NUM_USERS; i++) {
      const userId = uuidv4();
      userIds.push(userId);

      const user = {
        _id: userId,
        username: generateUsername(),
        age: generateAge(),
        hobbies: generateHobbies(),
        friends: [], // Will populate later
        createdAt: new Date(),
        position: generatePosition(i, NUM_USERS)
      };

      users.push(user);

      if ((i + 1) % 50 === 0) {
        console.log(`   Created ${i + 1}/${NUM_USERS} users...`);
      }
    }

    // Insert users into database
    await User.insertMany(users);
    console.log(`✅ Created ${NUM_USERS} users\n`);

    // Create friendships
    console.log('🤝 Creating friendships...');
    let totalConnections = 0;

    for (let i = 0; i < NUM_USERS; i++) {
      const user = await User.findById(userIds[i]);
      if (!user) continue;

      // Determine number of friends for this user
      const numFriends = Math.floor(
        Math.random() * (MAX_FRIENDS_PER_USER - MIN_FRIENDS_PER_USER + 1)
      ) + MIN_FRIENDS_PER_USER;

      // Get random friends
      const availableFriends = userIds.filter(id => 
        id !== user._id && !user.friends.includes(id)
      );
      
      const friendsToAdd = getRandomElements(availableFriends, 
        Math.min(numFriends, availableFriends.length)
      );

      // Add bidirectional friendships
      for (const friendId of friendsToAdd) {
        const friend = await User.findById(friendId);
        if (friend) {
          // Add friend to user
          if (!user.friends.includes(friendId)) {
            user.friends.push(friendId);
          }
          
          // Add user to friend
          if (!friend.friends.includes(user._id)) {
            friend.friends.push(user._id);
            await friend.save();
          }
          
          totalConnections++;
        }
      }

      await user.save();

      if ((i + 1) % 50 === 0) {
        console.log(`   Processed ${i + 1}/${NUM_USERS} users...`);
      }
    }

    console.log(`✅ Created ${totalConnections} connections\n`);

    // Display statistics
    console.log('📊 Database Statistics:');
    console.log('=' .repeat(50));
    
    const allUsers = await User.find().lean();
    
    const totalUsers = allUsers.length;
    const totalFriendships = allUsers.reduce((sum, u) => sum + u.friends.length, 0) / 2;
    const avgFriends = (totalFriendships * 2 / totalUsers).toFixed(2);
    
    const hobbySet = new Set<string>();
    allUsers.forEach(u => u.hobbies.forEach(h => hobbySet.add(h)));
    
    const avgHobbies = (allUsers.reduce((sum, u) => sum + u.hobbies.length, 0) / totalUsers).toFixed(2);
    
    console.log(`Total Users:          ${totalUsers}`);
    console.log(`Total Friendships:    ${totalFriendships}`);
    console.log(`Avg Friends/User:     ${avgFriends}`);
    console.log(`Total Unique Hobbies: ${hobbySet.size}`);
    console.log(`Avg Hobbies/User:     ${avgHobbies}`);
    console.log('=' .repeat(50));

    // Show sample users
    console.log('\n📝 Sample Users:');
    const sampleUsers = allUsers.slice(0, 5);
    sampleUsers.forEach((user, index) => {
      console.log(`\n${index + 1}. ${user.username} (Age: ${user.age})`);
      console.log(`   Hobbies: ${user.hobbies.join(', ')}`);
      console.log(`   Friends: ${user.friends.length}`);
    });

    console.log('\n✅ Database seeding completed successfully!');
    console.log('🚀 You can now test lazy loading with this data.\n');

    // Close connection
    await mongoose.connection.close();
    console.log('👋 Disconnected from MongoDB');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run the script
seedDatabase();