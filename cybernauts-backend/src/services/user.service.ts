// src/services/user.service.ts - Add pagination and lazy loading
import User, { IUser } from '../models/user.model';
import { ConflictError } from '../utils/errors';

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

export const getAllUsers = async (): Promise<IUser[]> => {
  return await User.find();
};

// NEW: Paginated users with search
export const getPaginatedUsers = async (
  page: number,
  limit: number,
  search?: string
) => {
  const skip = (page - 1) * limit;
  
  let query = {};
  if (search) {
    query = {
      $or: [
        { username: { $regex: search, $options: 'i' } },
        { hobbies: { $regex: search, $options: 'i' } }
      ]
    };
  }

  const [users, total] = await Promise.all([
    User.find(query).skip(skip).limit(limit).lean(),
    User.countDocuments(query)
  ]);

  return {
    users,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: skip + users.length < total
    }
  };
};

export const updateUser = async (
  id: string,
  userData: Partial<IUser>
): Promise<IUser | null> => {
  if (userData.hobbies) {
    userData.hobbies = userData.hobbies.map((h) => h.trim().toLowerCase());
  }
  return await User.findByIdAndUpdate(id, userData, { new: true });
};

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

// NEW: Lazy-loaded graph data with pagination
export const getGraphData = async (
  page: number = 1,
  limit: number = 100,
  includeConnections: boolean = true
) => {
  const skip = (page - 1) * limit;
  
  // Get paginated users
  const users = await User.find().skip(skip).limit(limit).lean();
  const total = await User.countDocuments();
  
  // Create a map of all users for connection lookup
  const userMap = new Map<string, IUser>();
  
  if (includeConnections) {
    // If we need connections, also fetch friends of current batch
    const userIds = users.map(u => u._id);
    const friendIds = new Set<string>();
    
    users.forEach(user => {
      user.friends.forEach(fid => friendIds.add(fid));
    });
    
    // Fetch friends that aren't in current batch
    const additionalUsers = await User.find({
      _id: { $in: Array.from(friendIds).filter(id => !userIds.includes(id)) }
    }).lean();
    
    // Combine all users for the map
    [...users, ...additionalUsers].forEach(user => {
      userMap.set(user._id, user);
    });
  } else {
    users.forEach(user => {
      userMap.set(user._id, user);
    });
  }

  const edges: { id: string; source: string; target: string }[] = [];
  const edgeSet = new Set<string>();

  const nodes = users.map((user) => {
    const numberOfFriends = user.friends.length;
    let sharedHobbiesCount = 0;

    if (includeConnections) {
      user.friends.forEach((friendId) => {
        const friend = userMap.get(friendId);
        if (friend) {
          const shared = user.hobbies.filter((hobby) =>
            friend.hobbies.includes(hobby)
          );
          sharedHobbiesCount += shared.length;
          
          // Create unique edge ID (sorted to prevent duplicates)
          const edgeKey = [user._id, friendId].sort().join('-');
          
          if (!edgeSet.has(edgeKey)) {
            edgeSet.add(edgeKey);
            edges.push({ 
              id: `e-${user._id}-${friendId}`, 
              source: user._id, 
              target: friendId 
            });
          }
        }
      });
    }

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

  return { 
    nodes, 
    edges,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: skip + users.length < total
    }
  };
};

// NEW: Get statistics for dashboard
export const getUserStats = async () => {
  const total = await User.countDocuments();
  const allUsers = await User.find().lean();
  
  // Calculate average connections
  const totalConnections = allUsers.reduce((sum, user) => sum + user.friends.length, 0);
  const avgConnections = total > 0 ? totalConnections / total : 0;
  
  // Get all unique hobbies
  const hobbiesSet = new Set<string>();
  allUsers.forEach(user => {
    user.hobbies.forEach(hobby => hobbiesSet.add(hobby));
  });
  
  // Find most popular hobbies
  const hobbyCount: { [key: string]: number } = {};
  allUsers.forEach(user => {
    user.hobbies.forEach(hobby => {
      hobbyCount[hobby] = (hobbyCount[hobby] || 0) + 1;
    });
  });
  
  const topHobbies = Object.entries(hobbyCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([hobby, count]) => ({ hobby, count }));
  
  return {
    totalUsers: total,
    totalConnections: totalConnections / 2, // Divide by 2 for mutual connections
    avgConnections: avgConnections.toFixed(2),
    totalHobbies: hobbiesSet.size,
    topHobbies
  };
};