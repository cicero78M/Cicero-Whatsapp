import express from 'express';
import userRoutes from './userRoutes.js';
import clientRoutes from './clientRoutes.js';
import authRoutes from './authRoutes.js';
import approvalRequestRoutes from './approvalRequestRoutes.js';
import premiumRequestRoutes from './premiumRequestRoutes.js';

const router = express.Router();

// Menu-related routes for WhatsApp access
router.use('/clients', clientRoutes);
router.use('/users', userRoutes);
router.use('/auth', authRoutes);
router.use('/approvals', approvalRequestRoutes);
router.use('/premium-requests', premiumRequestRoutes);

export default router;
