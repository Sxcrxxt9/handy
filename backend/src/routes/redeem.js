import express from 'express';
import { body, validationResult } from 'express-validator';
import { Redeem } from '../models/Redeem.js';
import { verifyToken, requireUserType } from '../middleware/auth.js';

const router = express.Router();

// Validation middleware
const validateRedeem = [
  body('rewardName').notEmpty().withMessage('Reward name is required'),
  body('pointsRequired').isInt({ min: 1 }).withMessage('Points required must be a positive integer'),
];

// Create redeem request (volunteers only)
router.post(
  '/',
  verifyToken,
  requireUserType(['volunteer']),
  validateRedeem,
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { rewardName, rewardDescription, pointsRequired } = req.body;

      const redeem = await Redeem.create({
        volunteerId: req.user.uid,
        rewardName,
        rewardDescription,
        pointsRequired: parseInt(pointsRequired),
      });

      res.status(201).json({
        message: 'Redeem request created successfully',
        redeem,
      });
    } catch (error) {
      if (error.message === 'Insufficient points') {
        return res.status(400).json({
          error: 'Insufficient points',
          message: error.message,
        });
      }
      next(error);
    }
  }
);

// Get volunteer's redeem history
router.get(
  '/my-redeems',
  verifyToken,
  requireUserType(['volunteer']),
  async (req, res, next) => {
    try {
      const redeems = await Redeem.getByVolunteerId(req.user.uid);
      
      res.json({ redeems });
    } catch (error) {
      next(error);
    }
  }
);

// Get single redeem by ID
router.get(
  '/:redeemId',
  verifyToken,
  requireUserType(['volunteer']),
  async (req, res, next) => {
    try {
      const { redeemId } = req.params;
      const redeem = await Redeem.getById(redeemId);
      
      if (!redeem) {
        return res.status(404).json({
          error: 'Redeem not found',
        });
      }

      // Check if redeem belongs to user
      if (redeem.volunteerId !== req.user.uid) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'You do not have permission to view this redeem',
        });
      }

      res.json({ redeem });
    } catch (error) {
      next(error);
    }
  }
);

export default router;

