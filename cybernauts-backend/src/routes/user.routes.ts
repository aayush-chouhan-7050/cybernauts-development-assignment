// src/routes/user.routes.ts
import { Router } from 'express';
import * as userController from '../controllers/user.controller';

const router = Router();

router.post('/', userController.handleCreateUser);      // POST /api/users
router.get('/', userController.handleGetAllUsers);      // GET /api/users
router.put('/:id', userController.handleUpdateUser);    // PUT /api/users/:id
router.delete('/:id', userController.handleDeleteUser); // DELETE /api/users/:id

router.post('/:id/link', userController.handleLinkUsers); // POST /api/users/:id/link 
router.delete('/:id/unlink', userController.handleUnlinkUsers); // DELETE /api/users/:id/unlink

export default router;