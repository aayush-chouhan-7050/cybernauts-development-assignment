// src/services/user.service.ts
import User, { IUser } from '../models/user.model';
import { ConflictError } from '../utils/errors';

// Service to create a new user
export const createUser = async (
  userData: Omit<IUser, '_id' | 'createdAt' | 'friends' | 'position'>
): Promise<IUser> => {
  const sanitizedHobbies = userData.hobbies.map((h) => h.trim().toLowerCase());
  const user = new User({
    ...userData,
    hobbies: sanitizedHobbies,
    position: { x: Math.random() * 400, y: Math.random() * 400 },
  });
  return await user.save();
};

// Service to get all users
export const getAllUsers = async (): Promise<IUser[]> => {
  return await User.find();
};

// Service to update a user by their ID
export const updateUser = async (
  id: string,
  userData: Partial<IUser>
): Promise<IUser | null> => {
  if (userData.hobbies) {
    userData.hobbies = userData.hobbies.map((h) => h.trim().toLowerCase());
  }
  return await User.findByIdAndUpdate(id, userData, { new: true });
};

// Service to link two users as friends
export const linkUsers = async (
  userId: string,
  friendId: string
): Promise<void> => {
  if (userId === friendId) {
    throw new Error('Users cannot link to themselves.');
  }

  const user = await User.findById(userId);
  const friend = await User.findById(friendId);

  if (!user || !friend) {
    throw new Error('One or both users not found.');
  }

  if (!user.friends.includes(friendId)) {
    user.friends.push(friendId);
  }

  if (!friend.friends.includes(userId)) {
    friend.friends.push(userId);
  }

  await user.save();
  await friend.save();
};

// Service to unlink two users
export const unlinkUsers = async (
  userId: string,
  friendId: string
): Promise<void> => {
  const user = await User.findById(userId);
  const friend = await User.findById(friendId);

  if (!user || !friend) {
    throw new Error('One or both users not found.');
  }

  user.friends = user.friends.filter((id) => id !== friendId);
  friend.friends = friend.friends.filter((id) => id !== userId);

  await user.save();
  await friend.save();
};

// Modified service to delete a user by their ID
export const deleteUser = async (id: string): Promise<IUser | null> => {
  const user = await User.findById(id);
  if (!user) return null;
  if (user.friends.length > 0) {
    throw new ConflictError(
      'User cannot be deleted while they have friends. Please unlink them first.'
    );
  }

  return await User.findByIdAndDelete(id);
};

// Service to get all users and relationships formatted for the graph
export const getGraphData = async () => {
  const users = await User.find().lean();
  const userMap = new Map<string, IUser>(
    users.map((user) => [user._id, user])
  );
  const edges: { id: string; source: string; target: string }[] = [];

  const nodes = users.map((user) => {
    const numberOfFriends = user.friends.length;
    let sharedHobbiesCount = 0;

    user.friends.forEach((friendId) => {
      const friend = userMap.get(friendId);
      if (friend) {
        const shared = user.hobbies.filter((hobby) =>
          friend.hobbies.includes(hobby)
        );
        sharedHobbiesCount += shared.length;
        const edgeId1 = `e-${user._id}-${friendId}`;
        const edgeId2 = `e-${friendId}-${user._id}`;
        if (!edges.some((edge) => edge.id === edgeId1 || edge.id === edgeId2)) {
          edges.push({ id: edgeId1, source: user._id, target: friendId });
        }
      }
    });

    const popularityScore = numberOfFriends + sharedHobbiesCount * 0.5;
    const nodeType = popularityScore > 5 ? 'highScoreNode' : 'lowScoreNode';

    return {
      id: user._id,
      type: nodeType,
      data: {
        label: user.username,
        age: user.age,
        hobbies: user.hobbies,
        popularityScore: popularityScore,
      },
      position: user.position || { x: Math.random() * 400, y: Math.random() * 400 },
    };
  });

  return { nodes, edges };
};