import express from 'express';
import { User } from '../models/User.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Register new user (after Firebase Auth)
router.post('/register', verifyToken, async (req, res, next) => {
  try {
    const { type, name, surname, tel } = req.body;
    const { uid, email } = req.user;

    if (!type || !['volunteer', 'disabled'].includes(type)) {
      return res.status(400).json({
        error: 'Invalid user type',
        message: 'Type must be either "volunteer" or "disabled"',
      });
    }

    // Check if user already exists
    const existingUser = await User.getById(uid);
    if (existingUser) {
      return res.status(400).json({
        error: 'User already exists',
      });
    }

    const user = await User.create({
      uid,
      email,
      type,
      name,
      surname,
      tel,
    });

    res.status(201).json({
      message: 'User registered successfully',
      user,
    });
  } catch (error) {
    next(error);
  }
});

// Get current user profile
router.get('/me', verifyToken, async (req, res, next) => {
  try {
    const user = await User.getById(req.user.uid);
    
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
      });
    }

    res.json({ user });
  } catch (error) {
    next(error);
  }
});

// Update user profile
router.put('/me', verifyToken, async (req, res, next) => {
  try {
    const { name, surname, tel } = req.body;
    const updateData = {};

    if (name) updateData.name = name;
    if (surname) updateData.surname = surname;
    if (tel) updateData.tel = tel;

    const updatedUser = await User.update(req.user.uid, updateData);

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
});

export default router;

