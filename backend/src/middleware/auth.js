import { getAuth } from 'firebase-admin/auth';
import { app } from '../config/firebase.js';

const auth = getAuth(app);

export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'No token provided' 
      });
    }

    const token = authHeader.split('Bearer ')[1];
    
    try {
      const decodedToken = await auth.verifyIdToken(token);
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
      };
      next();
    } catch (error) {
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'Invalid token' 
      });
    }
  } catch (error) {
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
};

export const requireUserType = (allowedTypes) => {
  return async (req, res, next) => {
    try {
      const { User } = await import('../models/User.js');
      const user = await User.getById(req.user.uid);
      
      if (!user) {
        return res.status(404).json({ 
          error: 'User not found' 
        });
      }

      if (!allowedTypes.includes(user.type)) {
        return res.status(403).json({ 
          error: 'Forbidden',
          message: `This endpoint requires one of these user types: ${allowedTypes.join(', ')}` 
        });
      }

      req.userType = user.type;
      req.userData = user;
      next();
    } catch (error) {
      return res.status(500).json({ 
        error: 'Internal server error',
        message: error.message 
      });
    }
  };
};

