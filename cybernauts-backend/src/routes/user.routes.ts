// src/routes/user.routes.ts - Add pagination routes
import { Router } from 'express';
import * as userController from '../controllers/user.controller';

const router = Router();

// routes
router.post('/', userController.handleCreateUser);
router.get('/', userController.handleGetAllUsers);
router.put('/:id', userController.handleUpdateUser);
router.delete('/:id', userController.handleDeleteUser);

router.post('/:id/link', userController.handleLinkUsers);
router.delete('/:id/unlink', userController.handleUnlinkUsers);

// Pagination routes
router.get('/paginated/list', userController.handleGetPaginatedUsers);
router.get('/stats/overview', userController.handleGetUserStats);

export default router;