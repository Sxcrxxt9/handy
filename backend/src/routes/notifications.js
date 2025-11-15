import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { User } from '../models/User.js';
import { PushNotificationService } from '../services/pushNotifications.js';

const router = express.Router();

router.post('/token', verifyToken, async (req, res, next) => {
  try {
    const { token, platform } = req.body ?? {};

    if (!token) {
      return res.status(400).json({
        error: 'Token is required',
      });
    }

    const user = await User.getById(req.user.uid);
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
      });
    }

    await PushNotificationService.registerToken({
      userId: req.user.uid,
      token,
      platform,
      userType: user.type ?? 'unknown',
    });

    return res.json({
      message: 'Push token registered successfully',
    });
  } catch (error) {
    return next(error);
  }
});

export default router;

