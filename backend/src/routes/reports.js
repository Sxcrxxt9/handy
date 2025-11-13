import express from 'express';
import { body, validationResult } from 'express-validator';
import { Report } from '../models/Report.js';
import { verifyToken, requireUserType } from '../middleware/auth.js';
import { User } from '../models/User.js';

const router = express.Router();

// Validation middleware
const validateReport = [
  body('type').isIn(['normal', 'sos']).withMessage('Type must be "normal" or "sos"'),
  body('details').notEmpty().withMessage('Details are required'),
  body('latitude').isFloat().withMessage('Valid latitude is required'),
  body('longitude').isFloat().withMessage('Valid longitude is required'),
];

// Create a new report (disabled users only)
router.post(
  '/',
  verifyToken,
  requireUserType(['disabled']),
  validateReport,
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { type, details, location, latitude, longitude } = req.body;

      const report = await Report.create({
        userId: req.user.uid,
        type,
        details,
        location,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
      });

      res.status(201).json({
        message: 'Report created successfully',
        report,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get user's reports (disabled users)
router.get(
  '/my-reports',
  verifyToken,
  requireUserType(['disabled']),
  async (req, res, next) => {
    try {
      const { status } = req.query;
      const reports = await Report.getByUserId(req.user.uid, status || null);
      
      res.json({ reports });
    } catch (error) {
      next(error);
    }
  }
);

// Get available cases (volunteers)
router.get(
  '/available-cases',
  verifyToken,
  requireUserType(['volunteer']),
  async (req, res, next) => {
    try {
      const cases = await Report.getAvailableCases();
      
      res.json({ cases });
    } catch (error) {
      next(error);
    }
  }
);

// Get volunteer's assigned cases
router.get(
  '/my-cases',
  verifyToken,
  requireUserType(['volunteer']),
  async (req, res, next) => {
    try {
      const cases = await Report.getByVolunteerId(req.user.uid);
      
      res.json({ cases });
    } catch (error) {
      next(error);
    }
  }
);

// Accept/Assign a case (volunteers)
router.post(
  '/:reportId/accept',
  verifyToken,
  requireUserType(['volunteer']),
  async (req, res, next) => {
    try {
      const { reportId } = req.params;
      
      const report = await Report.getById(reportId);
      if (!report) {
        return res.status(404).json({
          error: 'Report not found',
        });
      }

      if (report.status !== 'pending') {
        return res.status(400).json({
          error: 'Report is not available',
          message: `Report status is ${report.status}`,
        });
      }

      const updatedReport = await Report.assignVolunteer(reportId, req.user.uid);
      
      res.json({
        message: 'Case accepted successfully',
        report: updatedReport,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Update report status
router.patch(
  '/:reportId/status',
  verifyToken,
  async (req, res, next) => {
    try {
      const { reportId } = req.params;
      const { status } = req.body;

      const validStatuses = ['pending', 'assigned', 'in_progress', 'completed', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          error: 'Invalid status',
          message: `Status must be one of: ${validStatuses.join(', ')}`,
        });
      }

      const report = await Report.getById(reportId);
      if (!report) {
        return res.status(404).json({
          error: 'Report not found',
        });
      }

      // Check permissions
      const isOwner = report.userId === req.user.uid;
      const isAssignedVolunteer = report.assignedVolunteerId === req.user.uid;

      if (!isOwner && !isAssignedVolunteer) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'You do not have permission to update this report',
        });
      }

      // If completing, add points to volunteer
      if (status === 'completed' && isAssignedVolunteer && report.type === 'sos') {
        await User.addPoints(req.user.uid, 50); // 50 points for SOS
      } else if (status === 'completed' && isAssignedVolunteer && report.type === 'normal') {
        await User.addPoints(req.user.uid, 20); // 20 points for normal
      }

      const updatedReport = await Report.updateStatus(reportId, status);
      
      res.json({
        message: 'Report status updated successfully',
        report: updatedReport,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get single report by ID
router.get(
  '/:reportId',
  verifyToken,
  async (req, res, next) => {
    try {
      const { reportId } = req.params;
      const report = await Report.getById(reportId);
      
      if (!report) {
        return res.status(404).json({
          error: 'Report not found',
        });
      }

      // Check permissions
      const isOwner = report.userId === req.user.uid;
      const isAssignedVolunteer = report.assignedVolunteerId === req.user.uid;

      if (!isOwner && !isAssignedVolunteer) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'You do not have permission to view this report',
        });
      }

      res.json({ report });
    } catch (error) {
      next(error);
    }
  }
);

export default router;

