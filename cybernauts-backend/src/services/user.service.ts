import User, { IUser } from '../models/user.model';
import { ConflictError } from '../utils/errors';
import {
  publishEvent,
  CHANNELS,
  cacheSet,
  cacheGet,
  cacheDelete,
  cacheInvalidatePattern,
} from '../config/redis';

// Define interfaces for complex return types for better type safety
interface IPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

interface IGraphData {
  nodes: any[];
  edges: { id: string; source: string; target: string }[];
  pagination: IPagination;
}

interface IUserStats {
  totalUsers: number;
  totalConnections: number;
  avgConnections: string;
  totalHobbies: number;
  topHobbies: { hobby: string; count: number }[];
}


// Cache keys
const CACHE_KEYS = {
  allUsers: 'users:all',
  graphData: (page: number, limit: number) => `graph:${page}:${limit}`,
  user: (id: string) => `user:${id}`,
  stats: 'stats:overview',
};

export const createUser = async (
  userData: Omit<IUser, '_id' | 'friends' | 'position' | 'createdAt' | 'updatedAt'>
): Promise<IUser> => {
  const sanitizedHobbies = userData.hobbies.map((h) => h.trim().toLowerCase());
  const user = new User({
    ...userData,
    hobbies: sanitizedHobbies,
    position: { x: Math.random() * 400, y: Math.random() * 400 },
  });

  const savedUser = await user.save();
  // Publish event for other workers
  await publishEvent(CHANNELS.USER_CREATED, {
    userId: savedUser._id,
    timestamp: Date.now(),
  });
  // Invalidate cache
  await cacheInvalidatePattern('users:*');
  await cacheInvalidatePattern('graph:*');
  await cacheDelete(CACHE_KEYS.stats);
  return savedUser;
};

export const getAllUsers = async (): Promise<IUser[]> => {
  // Try cache first
  const cached = await cacheGet(CACHE_KEYS.allUsers);
  if (cached) {
    return cached;
  }
  const users = await User.find();

  // Cache for 5 minutes
  await cacheSet(CACHE_KEYS.allUsers, users, 300);

  return users;
};

export const getPaginatedUsers = async (
  page: number,
  limit: number,
  search?: string
): Promise<{ users: IUser[]; pagination: IPagination }> => {
  const skip = (page - 1) * limit;

  let query = {};
  if (search) {
    query = {
      $or: [
        { username: { $regex: search, $options: 'i' } },
        { hobbies: { $regex: search, $options: 'i' } },
      ],
    };
  }
  const [users, total] = await Promise.all([
    User.find(query).skip(skip).limit(limit).lean(),
    User.countDocuments(query),
  ]);
  return {
    users,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: skip + users.length < total,
    },
  };
};

export const updateUser = async (
  id: string,
  userData: Partial<IUser>
): Promise<IUser | null> => {
  if (userData.hobbies) {
    userData.hobbies = userData.hobbies.map((h) => h.trim().toLowerCase());
  }

  const user = await User.findByIdAndUpdate(id, userData, { new: true });
  if (user) {
    // Publish event
    await publishEvent(CHANNELS.USER_UPDATED, {
      userId: id,
      timestamp: Date.now(),
    });
    // Invalidate cache
    await cacheDelete(CACHE_KEYS.user(id));
    await cacheInvalidatePattern('users:*');
    await cacheInvalidatePattern('graph:*');
    await cacheDelete(CACHE_KEYS.stats);
  }
  return user;
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
  if (!user.friends.includes(friendId as any)) {
    user.friends.push(friendId as any);
  }
  if (!friend.friends.includes(userId as any)) {
    friend.friends.push(userId as any);
  }
  await user.save();
  await friend.save();
  // Publish event
  await publishEvent(CHANNELS.USER_LINKED, {
    userId,
    friendId,
    timestamp: Date.now(),
  });
  // Invalidate cache
  await cacheDelete(CACHE_KEYS.user(userId));
  await cacheDelete(CACHE_KEYS.user(friendId));
  await cacheInvalidatePattern('graph:*');
  await cacheDelete(CACHE_KEYS.stats);
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
  user.friends = user.friends.filter((id) => id.toString() !== friendId);
  friend.friends = friend.friends.filter((id) => id.toString() !== userId);
  await user.save();
  await friend.save();
  // Publish event
  await publishEvent(CHANNELS.USER_UNLINKED, {
    userId,
    friendId,
    timestamp: Date.now(),
  });
  // Invalidate cache
  await cacheDelete(CACHE_KEYS.user(userId));
  await cacheDelete(CACHE_KEYS.user(friendId));
  await cacheInvalidatePattern('graph:*');
  await cacheDelete(CACHE_KEYS.stats);
};

export const deleteUser = async (id: string): Promise<IUser | null> => {
  const user = await User.findById(id);
  if (!user) return null;

  if (user.friends.length > 0) {
    throw new ConflictError(
      'User cannot be deleted while they have friends. Please unlink them first.'
    );
  }
  const deletedUser = await User.findByIdAndDelete(id);
  if (deletedUser) {
    // Publish event
    await publishEvent(CHANNELS.USER_DELETED, {
      userId: id,
      timestamp: Date.now(),
    });
    // Invalidate cache
    await cacheDelete(CACHE_KEYS.user(id));
    await cacheInvalidatePattern('users:*');
    await cacheInvalidatePattern('graph:*');
    await cacheDelete(CACHE_KEYS.stats);
  }
  return deletedUser;
};

export const getGraphData = async (
  page: number = 1,
  limit: number = 100,
  includeConnections: boolean = true
): Promise<IGraphData> => {
  // Try cache first
  const cacheKey = CACHE_KEYS.graphData(page, limit);
  const cached = await cacheGet(cacheKey);
  if (cached) {
    return cached;
  }
  const skip = (page - 1) * limit;

  const users = await User.find().skip(skip).limit(limit).lean<IUser[]>();
  const total = await User.countDocuments();

  const userMap = new Map<string, IUser>();

  if (includeConnections) {
    const userIds = users.map((u) => u._id.toString());
    const friendIds = new Set<string>();

    users.forEach((user) => {
      user.friends.forEach((fid) => friendIds.add(fid.toString()));
    });

    const additionalUserIds = Array.from(friendIds).filter(
      (id) => !userIds.includes(id)
    );

    const additionalUsers = await User.find({
      _id: { $in: additionalUserIds },
    }).lean<IUser[]>();

    [...users, ...additionalUsers].forEach((user) => {
      userMap.set(user._id.toString(), user);
    });
  } else {
    users.forEach((user) => {
      userMap.set(user._id.toString(), user);
    });
  }
  const edges: { id: string; source: string; target: string }[] = [];
  const edgeSet = new Set<string>();
  const nodes = users.map((user) => {
    const numberOfFriends = user.friends.length;
    let sharedHobbiesCount = 0;
    if (includeConnections) {
      user.friends.forEach((friendId) => {
        const friend = userMap.get(friendId.toString());
        if (friend) {
          const shared = user.hobbies.filter((hobby) =>
            friend.hobbies.includes(hobby)
          );
          sharedHobbiesCount += shared.length;

          const edgeKey = [user._id.toString(), friendId.toString()].sort().join('-');

          if (!edgeSet.has(edgeKey)) {
            edgeSet.add(edgeKey);
            edges.push({
              id: `e-${user._id.toString()}-${friendId.toString()}`,
              source: user._id.toString(),
              target: friendId.toString(),
            });
          }
        }
      });
    }
    const popularityScore = numberOfFriends + sharedHobbiesCount * 0.5;
    const nodeType = popularityScore > 5 ? 'highScoreNode' : 'lowScoreNode';
    return {
      id: user._id.toString(),
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
  const result: IGraphData = {
    nodes,
    edges,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: skip + users.length < total,
    },
  };
  // Cache for 2 minutes
  await cacheSet(cacheKey, result, 120);
  return result;
};

export const getUserStats = async (): Promise<IUserStats> => {
  // Try cache first
  const cached = await cacheGet(CACHE_KEYS.stats);
  if (cached) {
    return cached;
  }
  const total = await User.countDocuments();
  const allUsers = await User.find().lean<IUser[]>();

  const totalConnections = allUsers.reduce(
    (sum, user) => sum + user.friends.length,
    0
  );
  const avgConnections = total > 0 ? totalConnections / total : 0;

  const hobbiesSet = new Set<string>();
  allUsers.forEach((user) => {
    user.hobbies.forEach((hobby) => hobbiesSet.add(hobby));
  });

  const hobbyCount: { [key: string]: number } = {};
  allUsers.forEach((user) => {
    user.hobbies.forEach((hobby) => {
      hobbyCount[hobby] = (hobbyCount[hobby] || 0) + 1;
    });
  });

  const topHobbies = Object.entries(hobbyCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([hobby, count]) => ({ hobby, count }));

  const stats: IUserStats = {
    totalUsers: total,
    totalConnections: totalConnections / 2, // Each connection is counted twice
    avgConnections: avgConnections.toFixed(2),
    totalHobbies: hobbiesSet.size,
    topHobbies,
  };
  // Cache for 5 minutes
  await cacheSet(CACHE_KEYS.stats, stats, 300);
  return stats;
};