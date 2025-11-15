import express from 'express';
import { body, validationResult } from 'express-validator';
import { Report } from '../models/Report.js';
import { verifyToken, requireUserType } from '../middleware/auth.js';
import { User } from '../models/User.js';
import { PushNotificationService } from '../services/pushNotifications.js';

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

      try {
        const reporter = await User.getById(req.user.uid);
        await PushNotificationService.notifyVolunteersOfNewReport(report, reporter);
      } catch (pushError) {
        console.error('[reports] Failed to send push notification', pushError);
      }

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
      
      // Get volunteer information for each report
      const reportsWithVolunteer = await Promise.all(
        reports.map(async (report) => {
          if (report.assignedVolunteerId) {
            try {
              const volunteer = await User.getById(report.assignedVolunteerId);
              return {
                ...report,
                volunteerName: volunteer ? `${volunteer.name} ${volunteer.surname || ''}`.trim() : null,
                volunteerTel: volunteer?.tel || null,
              };
            } catch (error) {
              console.error(`[reports] Failed to fetch volunteer for report ${report.id}`, error);
              return {
                ...report,
                volunteerName: null,
                volunteerTel: null,
              };
            }
          }
          return {
            ...report,
            volunteerName: null,
            volunteerTel: null,
          };
        })
      );
      
      res.json({ reports: reportsWithVolunteer });
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
      
      // Send notification to disabled user
      try {
        const reporter = await User.getById(updatedReport.userId);
        const volunteer = await User.getById(req.user.uid);
        await PushNotificationService.notifyUser(updatedReport.userId, {
          title: 'มีอาสาสมัครรับเคสของคุณ',
          body: `${volunteer?.name || 'อาสาสมัคร'} รับเคสของคุณแล้ว กรุณารอการช่วยเหลือ`,
          data: {
            reportId: updatedReport.id,
            type: 'case_accepted',
          },
        });
      } catch (pushError) {
        console.error('[reports] Failed to send push notification to disabled user', pushError);
      }
      
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

      // Only allow status updates, not completion (completion must go through /complete endpoint)
      if (status === 'completed') {
        return res.status(400).json({
          error: 'Invalid status',
          message: 'Use /complete endpoint to complete a report',
        });
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

// Complete a report (disabled users only - confirms completion)
router.post(
  '/:reportId/complete',
  verifyToken,
  requireUserType(['disabled']),
  async (req, res, next) => {
    try {
      const { reportId } = req.params;
      
      const report = await Report.getById(reportId);
      if (!report) {
        return res.status(404).json({
          error: 'Report not found',
        });
      }

      // Check if user owns this report
      if (report.userId !== req.user.uid) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'You can only complete your own reports',
        });
      }

      // Check if report is in progress
      if (report.status !== 'in_progress') {
        return res.status(400).json({
          error: 'Invalid status',
          message: `Report must be in_progress to complete. Current status: ${report.status}`,
        });
      }

      // Update status to completed
      const updatedReport = await Report.updateStatus(reportId, 'completed');

      // Add points to volunteer
      if (updatedReport.assignedVolunteerId) {
        try {
          if (report.type === 'sos') {
            await User.addPoints(updatedReport.assignedVolunteerId, 500); // 500 points for SOS
          } else {
            await User.addPoints(updatedReport.assignedVolunteerId, 200); // 200 points for normal
          }

          // Send notification to volunteer
          await PushNotificationService.notifyUser(updatedReport.assignedVolunteerId, {
            title: 'เคสของคุณได้รับการยืนยันว่าจบแล้ว',
            body: `คุณได้รับ ${report.type === 'sos' ? '50' : '20'} คะแนน`,
            data: {
              reportId: updatedReport.id,
              type: 'case_completed',
              points: report.type === 'sos' ? 50 : 20,
            },
          });
        } catch (pointsError) {
          console.error('[reports] Failed to add points or send notification', pointsError);
        }
      }
      
      res.json({
        message: 'Report completed successfully',
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

      // Get disabled user information (for volunteers)
      let disabledUser = null;
      if (isAssignedVolunteer && report.userId) {
        try {
          const user = await User.getById(report.userId);
          if (user && user.type === 'disabled') {
            disabledUser = {
              name: user.name,
              surname: user.surname,
              tel: user.tel,
            };
          }
        } catch (userError) {
          // Silently fail - not critical
          console.error('[reports] Failed to fetch disabled user info', userError);
        }
      }

      res.json({ 
        report,
        ...(disabledUser && { disabledUser })
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;

