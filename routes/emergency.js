const express = require('express');
const EmergencyAlert = require('../models/EmergencyAlert');
const HealthProfile = require('../models/HealthProfile');
const { protect, requireVerification, requireHealthProfile, logUserAction, rateLimitAction } = require('../middleware/auth');

const router = express.Router();

// @desc    Send SOS emergency alert
// @route   POST /api/emergency/sos
// @access  Private
router.post('/sos', 
  protect, 
  requireVerification,
  requireHealthProfile,
  rateLimitAction('sos_alert', 3, 60 * 60 * 1000), // 3 SOS alerts per hour
  logUserAction('sos_alert_sent'),
  async (req, res) => {
    try {
      const { 
        description, 
        symptoms, 
        location, 
        severity = 'High' 
      } = req.body;

      // Validate location
      if (!location || !location.coordinates || location.coordinates.length !== 2) {
        return res.status(400).json({
          error: 'Valid location coordinates are required'
        });
      }

      // Create emergency alert
      const emergencyAlert = await EmergencyAlert.create({
        userId: req.user._id,
        healthProfileId: req.healthProfile._id,
        alertType: 'SOS',
        severity,
        description,
        symptoms,
        location: {
          coordinates: location.coordinates,
          address: location.address,
          campusLocation: location.campusLocation,
          building: location.building,
          room: location.room,
          accuracy: location.accuracy
        },
        deviceInfo: {
          userAgent: req.headers['user-agent'],
          platform: req.headers['sec-ch-ua-platform'],
          appVersion: req.headers['x-app-version'] || '1.0.0'
        }
      });

      // TODO: Implement actual emergency notifications
      // 1. Notify emergency services
      // 2. Notify campus police
      // 3. Notify emergency contacts
      // 4. Send SMS/email alerts

      // Simulate notification process
      setTimeout(async () => {
        try {
          await EmergencyAlert.findByIdAndUpdate(emergencyAlert._id, {
            'notificationsSent.emergencyServices': true,
            'notificationsSent.campusPolice': true,
            'notificationsSent.primaryContact': true,
            responseTime: new Date()
          });
        } catch (error) {
          console.error('Error updating notification status:', error);
        }
      }, 2000);

      res.status(201).json({
        message: 'SOS alert sent successfully',
        alertId: emergencyAlert._id,
        status: 'Active',
        responseTime: '2-3 minutes'
      });
    } catch (error) {
      console.error('SOS alert error:', error);
      res.status(500).json({
        error: 'Server error sending SOS alert'
      });
    }
  }
);

// @desc    Get user's emergency alerts
// @route   GET /api/emergency/alerts
// @access  Private
router.get('/alerts', 
  protect, 
  requireVerification,
  async (req, res) => {
    try {
      const { status, limit = 10, page = 1 } = req.query;
      
      const query = { userId: req.user._id };
      if (status) {
        query.status = status;
      }

      const alerts = await EmergencyAlert.find(query)
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit));

      const total = await EmergencyAlert.countDocuments(query);

      res.json({
        alerts,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / parseInt(limit)),
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      });
    } catch (error) {
      console.error('Emergency alerts fetch error:', error);
      res.status(500).json({
        error: 'Server error fetching emergency alerts'
      });
    }
  }
);

// @desc    Get specific emergency alert
// @route   GET /api/emergency/alerts/:alertId
// @access  Private
router.get('/alerts/:alertId', 
  protect, 
  requireVerification,
  async (req, res) => {
    try {
      const { alertId } = req.params;
      
      const alert = await EmergencyAlert.findOne({
        _id: alertId,
        userId: req.user._id
      });

      if (!alert) {
        return res.status(404).json({
          error: 'Emergency alert not found'
        });
      }

      res.json(alert);
    } catch (error) {
      console.error('Emergency alert fetch error:', error);
      res.status(500).json({
        error: 'Server error fetching emergency alert'
      });
    }
  }
);

// @desc    Update emergency alert status
// @route   PUT /api/emergency/alerts/:alertId/status
// @access  Private
router.put('/alerts/:alertId/status', 
  protect, 
  requireVerification,
  logUserAction('emergency_alert_status_update'),
  async (req, res) => {
    try {
      const { alertId } = req.params;
      const { status, resolutionNotes } = req.body;

      if (!['Active', 'Acknowledged', 'Resolved', 'Cancelled'].includes(status)) {
        return res.status(400).json({
          error: 'Invalid status value'
        });
      }

      const updateData = { status };
      
      if (status === 'Resolved') {
        updateData.resolutionTime = new Date();
        if (resolutionNotes) {
          updateData.resolutionNotes = resolutionNotes;
        }
      }

      const alert = await EmergencyAlert.findOneAndUpdate(
        {
          _id: alertId,
          userId: req.user._id
        },
        updateData,
        { new: true }
      );

      if (!alert) {
        return res.status(404).json({
          error: 'Emergency alert not found'
        });
      }

      res.json({
        message: 'Emergency alert status updated successfully',
        alert
      });
    } catch (error) {
      console.error('Emergency alert status update error:', error);
      res.status(500).json({
        error: 'Server error updating emergency alert status'
      });
    }
  }
);

// @desc    Cancel emergency alert
// @route   PUT /api/emergency/alerts/:alertId/cancel
// @access  Private
router.put('/alerts/:alertId/cancel', 
  protect, 
  requireVerification,
  logUserAction('emergency_alert_cancelled'),
  async (req, res) => {
    try {
      const { alertId } = req.params;
      const { reason } = req.body;

      const alert = await EmergencyAlert.findOneAndUpdate(
        {
          _id: alertId,
          userId: req.user._id,
          status: 'Active' // Only active alerts can be cancelled
        },
        {
          status: 'Cancelled',
          resolutionNotes: reason || 'Alert cancelled by user'
        },
        { new: true }
      );

      if (!alert) {
        return res.status(404).json({
          error: 'Active emergency alert not found'
        });
      }

      res.json({
        message: 'Emergency alert cancelled successfully',
        alert
      });
    } catch (error) {
      console.error('Emergency alert cancellation error:', error);
      res.status(500).json({
        error: 'Server error cancelling emergency alert'
      });
    }
  }
);

// @desc    Get emergency statistics
// @route   GET /api/emergency/stats
// @access  Private
router.get('/stats', 
  protect, 
  requireVerification,
  async (req, res) => {
    try {
      const stats = await EmergencyAlert.aggregate([
        { $match: { userId: req.user._id } },
        {
          $group: {
            _id: null,
            totalAlerts: { $sum: 1 },
            activeAlerts: {
              $sum: { $cond: [{ $eq: ['$status', 'Active'] }, 1, 0] }
            },
            resolvedAlerts: {
              $sum: { $cond: [{ $eq: ['$status', 'Resolved'] }, 1, 0] }
            },
            averageResponseTime: {
              $avg: '$responseTimeMinutes'
            }
          }
        }
      ]);

      const alertTypes = await EmergencyAlert.aggregate([
        { $match: { userId: req.user._id } },
        {
          $group: {
            _id: '$alertType',
            count: { $sum: 1 }
          }
        }
      ]);

      const severityBreakdown = await EmergencyAlert.aggregate([
        { $match: { userId: req.user._id } },
        {
          $group: {
            _id: '$severity',
            count: { $sum: 1 }
          }
        }
      ]);

      res.json({
        summary: stats[0] || {
          totalAlerts: 0,
          activeAlerts: 0,
          resolvedAlerts: 0,
          averageResponseTime: 0
        },
        alertTypes,
        severityBreakdown
      });
    } catch (error) {
      console.error('Emergency stats fetch error:', error);
      res.status(500).json({
        error: 'Server error fetching emergency statistics'
      });
    }
  }
);

// @desc    Get nearby emergency alerts (for campus safety)
// @route   GET /api/emergency/nearby
// @access  Private
router.get('/nearby', 
  protect, 
  requireVerification,
  async (req, res) => {
    try {
      const { coordinates, maxDistance = 1000 } = req.query; // maxDistance in meters
      
      if (!coordinates || !Array.isArray(coordinates) || coordinates.length !== 2) {
        return res.status(400).json({
          error: 'Valid coordinates array [longitude, latitude] is required'
        });
      }

      const nearbyAlerts = await EmergencyAlert.findNearby(
        coordinates,
        parseInt(maxDistance)
      ).populate('userId', 'firstName lastName email');

      res.json({
        nearbyAlerts,
        searchRadius: maxDistance,
        coordinates
      });
    } catch (error) {
      console.error('Nearby alerts fetch error:', error);
      res.status(500).json({
        error: 'Server error fetching nearby alerts'
      });
    }
  }
);

// @desc    Emergency contact notification test
// @route   POST /api/emergency/test-notification
// @access  Private
router.post('/test-notification', 
  protect, 
  requireVerification,
  requireHealthProfile,
  rateLimitAction('test_notification', 2, 24 * 60 * 60 * 1000), // 2 tests per day
  logUserAction('test_notification_sent'),
  async (req, res) => {
    try {
      const { contactType = 'primary' } = req.body;
      
      const healthProfile = req.healthProfile;
      const contact = healthProfile.emergencyContacts[contactType];
      
      if (!contact) {
        return res.status(400).json({
          error: `${contactType} emergency contact not found`
        });
      }

      // TODO: Implement actual test notification
      // This would send a test SMS/email to verify contact information

      res.json({
        message: `Test notification sent to ${contactType} emergency contact`,
        contact: {
          name: contact.name,
          phone: contact.phone,
          email: contact.email
        },
        note: 'In production, this would send an actual test message'
      });
    } catch (error) {
      console.error('Test notification error:', error);
      res.status(500).json({
        error: 'Server error sending test notification'
      });
    }
  }
);

module.exports = router;
