// src/controllers/user.controller.ts
import { Request, Response } from 'express';
import * as userService from '../services/user.service';
import { ConflictError } from '../utils/errors';

// Existing handlers...
export const handleCreateUser = async (req: Request, res: Response) => {
  try {
    const user = await userService.createUser(req.body);
    res.status(201).json(user);
  } catch (error: any) {
    res.status(400).json({ message: 'Validation Error', details: error.message });
  }
};

export const handleGetAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await userService.getAllUsers();
    res.status(200).json(users);
  } catch (error: any) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// NEW: Paginated users endpoint
export const handleGetPaginatedUsers = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const search = req.query.search as string;

    const result = await userService.getPaginatedUsers(page, limit, search);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const handleUpdateUser = async (req: Request, res: Response) => {
  try {
    const user = await userService.updateUser(req.params.id, req.body);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error: any) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const handleDeleteUser = async (req: Request, res: Response) => {
    try {
        const user = await userService.deleteUser(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error: any) {
        if (error instanceof ConflictError) {
            return res.status(409).json({ message: error.message });
        }
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

export const handleLinkUsers = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { friendId } = req.body; 
        if (!friendId) {
            return res.status(400).json({ message: 'friendId is required in the body' });
        }
        await userService.linkUsers(id, friendId);
        res.status(200).json({ message: 'Users linked successfully' });
    } catch (error: any) {
        if (error.message.includes('not found')) {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: 'Internal Server Error', details: error.message });
    }
};

export const handleUnlinkUsers = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { friendId } = req.body;
        if (!friendId) {
            return res.status(400).json({ message: 'friendId is required in the body' });
        }
        await userService.unlinkUsers(id, friendId);
        res.status(200).json({ message: 'Users unlinked successfully' });
    } catch (error: any) {
        if (error.message.includes('not found')) {
            return res.status(404).json({ message: error.message });
        }
        res.status(500).json({ message: 'Internal Server Error', details: error.message });
    }
};

// NEW: Paginated graph data endpoint
export const handleGetGraphData = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 100;
        const includeConnections = req.query.includeConnections !== 'false';
        
        const graphData = await userService.getGraphData(page, limit, includeConnections);
        res.status(200).json(graphData);
    } catch (error: any) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// NEW: Get user stats for dashboard
export const handleGetUserStats = async (req: Request, res: Response) => {
    try {
        const stats = await userService.getUserStats();
        res.status(200).json(stats);
    } catch (error: any) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
};