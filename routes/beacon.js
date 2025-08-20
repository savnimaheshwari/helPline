const express = require('express');
const EmergencyAlert = require('../models/EmergencyAlert');
const { protect, requireVerification, requireHealthProfile, logUserAction, rateLimitAction } = require('../middleware/auth');

const router = express.Router();

// @desc    Activate campus beacon
// @route   POST /api/beacon/activate
// @access  Private
router.post('/activate', 
  protect, 
  requireVerification,
  requireHealthProfile,
  rateLimitAction('beacon_activation', 5, 60 * 60 * 1000), // 5 activations per hour
  logUserAction('beacon_activated'),
  async (req, res) => {
    try {
      const { 
        location, 
        duration = 300, // 5 minutes default
        description,
        shareWithCampus = true 
      } = req.body;

      // Validate location
      if (!location || !location.coordinates || location.coordinates.length !== 2) {
        return res.status(400).json({
          error: 'Valid location coordinates are required'
        });
      }

      // Check if user already has an active beacon
      const existingBeacon = await EmergencyAlert.findOne({
        userId: req.user._id,
        beaconActive: true,
        status: 'Active'
      });

      if (existingBeacon) {
        return res.status(400).json({
          error: 'You already have an active beacon. Please deactivate it first.'
        });
      }

      // Create beacon alert
      const beaconAlert = await EmergencyAlert.create({
        userId: req.user._id,
        healthProfileId: req.healthProfile._id,
        alertType: 'Beacon Activation',
        severity: 'Low',
        description: description || 'Campus safety beacon activated',
        location: {
          coordinates: location.coordinates,
          address: location.address,
          campusLocation: location.campusLocation,
          building: location.building,
          room: location.room,
          accuracy: location.accuracy
        },
        beaconActive: true,
        beaconStartTime: new Date(),
        beaconEndTime: new Date(Date.now() + duration * 1000),
        shareWithCampus,
        deviceInfo: {
          userAgent: req.headers['user-agent'],
          platform: req.headers['sec-ch-ua-platform'],
          appVersion: req.headers['x-app-version'] || '1.0.0'
        }
      });

      // Set beacon to auto-deactivate after duration
      setTimeout(async () => {
        try {
          await EmergencyAlert.findByIdAndUpdate(beaconAlert._id, {
            beaconActive: false,
            status: 'Resolved',
            resolutionNotes: 'Beacon automatically deactivated after time limit'
          });
        } catch (error) {
          console.error('Error auto-deactivating beacon:', error);
        }
      }, duration * 1000);

      res.status(201).json({
        message: 'Campus beacon activated successfully',
        alertId: beaconAlert._id,
        beaconActive: true,
        duration: `${duration} seconds`,
        expiresAt: new Date(Date.now() + duration * 1000).toISOString()
      });
    } catch (error) {
      console.error('Beacon activation error:', error);
      res.status(500).json({
        error: 'Server error activating beacon'
      });
    }
  }
);

// @desc    Deactivate campus beacon
// @route   PUT /api/beacon/deactivate
// @access  Private
router.put('/deactivate', 
  protect, 
  requireVerification,
  logUserAction('beacon_deactivated'),
  async (req, res) => {
    try {
      const beaconAlert = await EmergencyAlert.findOneAndUpdate(
        {
          userId: req.user._id,
          beaconActive: true,
          status: 'Active'
        },
        {
          beaconActive: false,
          beaconEndTime: new Date(),
          status: 'Resolved',
          resolutionNotes: 'Beacon manually deactivated by user'
        },
        { new: true }
      );

      if (!beaconAlert) {
        return res.status(404).json({
          error: 'No active beacon found'
        });
      }

      res.json({
        message: 'Campus beacon deactivated successfully',
        beaconActive: false,
        deactivatedAt: beaconAlert.beaconEndTime
      });
    } catch (error) {
      console.error('Beacon deactivation error:', error);
      res.status(500).json({
        error: 'Server error deactivating beacon'
      });
    }
  }
);

// @desc    Get beacon status
// @route   GET /api/beacon/status
// @access  Private
router.get('/status', 
  protect, 
  requireVerification,
  async (req, res) => {
    try {
      const beaconAlert = await EmergencyAlert.findOne({
        userId: req.user._id,
        beaconActive: true,
        status: 'Active'
      });

      if (!beaconAlert) {
        return res.json({
          beaconActive: false,
          message: 'No active beacon'
        });
      }

      const now = new Date();
      const timeRemaining = Math.max(0, Math.ceil((beaconAlert.beaconEndTime - now) / 1000));

      res.json({
        beaconActive: true,
        alertId: beaconAlert._id,
        location: beaconAlert.location,
        startTime: beaconAlert.beaconStartTime,
        endTime: beaconAlert.beaconEndTime,
        timeRemaining,
        shareWithCampus: beaconAlert.shareWithCampus,
        description: beaconAlert.description
      });
    } catch (error) {
      console.error('Beacon status fetch error:', error);
      res.status(500).json({
        error: 'Server error fetching beacon status'
      });
    }
  }
);

// @desc    Get nearby beacons (for campus safety)
// @route   GET /api/beacon/nearby
// @access  Private
router.get('/nearby', 
  protect, 
  requireVerification,
  async (req, res) => {
    try {
      const { coordinates, maxDistance = 2000 } = req.query; // maxDistance in meters
      
      if (!coordinates || !Array.isArray(coordinates) || coordinates.length !== 2) {
        return res.status(400).json({
          error: 'Valid coordinates array [longitude, latitude] is required'
        });
      }

      const nearbyBeacons = await EmergencyAlert.find({
        beaconActive: true,
        status: 'Active',
        'location.coordinates': {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: coordinates
            },
            $maxDistance: parseInt(maxDistance)
          }
        }
      }).populate('userId', 'firstName lastName email');

      res.json({
        nearbyBeacons,
        searchRadius: maxDistance,
        coordinates,
        totalActive: nearbyBeacons.length
      });
    } catch (error) {
      console.error('Nearby beacons fetch error:', error);
      res.status(500).json({
        error: 'Server error fetching nearby beacons'
      });
    }
  }
);

// @desc    Get beacon history
// @route   GET /api/beacon/history
// @access  Private
router.get('/history', 
  protect, 
  requireVerification,
  async (req, res) => {
    try {
      const { limit = 20, page = 1 } = req.query;
      
      const beacons = await EmergencyAlert.find({
        userId: req.user._id,
        alertType: 'Beacon Activation'
      })
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit));

      const total = await EmergencyAlert.countDocuments({
        userId: req.user._id,
        alertType: 'Beacon Activation'
      });

      res.json({
        beacons,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / parseInt(limit)),
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      });
    } catch (error) {
      console.error('Beacon history fetch error:', error);
      res.status(500).json({
        error: 'Server error fetching beacon history'
      });
    }
  }
);

// @desc    Update beacon location
// @route   PUT /api/beacon/location
// @access  Private
router.put('/location', 
  protect, 
  requireVerification,
  logUserAction('beacon_location_updated'),
  async (req, res) => {
    try {
      const { location } = req.body;

      if (!location || !location.coordinates || location.coordinates.length !== 2) {
        return res.status(400).json({
          error: 'Valid location coordinates are required'
        });
      }

      const beaconAlert = await EmergencyAlert.findOneAndUpdate(
        {
          userId: req.user._id,
          beaconActive: true,
          status: 'Active'
        },
        {
          location: {
            coordinates: location.coordinates,
            address: location.address,
            campusLocation: location.campusLocation,
            building: location.building,
            room: location.room,
            accuracy: location.accuracy
          },
          updatedAt: Date.now()
        },
        { new: true }
      );

      if (!beaconAlert) {
        return res.status(404).json({
          error: 'No active beacon found'
        });
      }

      res.json({
        message: 'Beacon location updated successfully',
        location: beaconAlert.location
      });
    } catch (error) {
      console.error('Beacon location update error:', error);
      res.status(500).json({
        error: 'Server error updating beacon location'
      });
    }
  }
);

// @desc    Extend beacon duration
// @route   PUT /api/beacon/extend
// @access  Private
router.put('/extend', 
  protect, 
  requireVerification,
  rateLimitAction('beacon_extension', 3, 60 * 60 * 1000), // 3 extensions per hour
  logUserAction('beacon_extended'),
  async (req, res) => {
    try {
      const { additionalDuration = 300 } = req.body; // 5 minutes default

      const beaconAlert = await EmergencyAlert.findOne({
        userId: req.user._id,
        beaconActive: true,
        status: 'Active'
      });

      if (!beaconAlert) {
        return res.status(404).json({
          error: 'No active beacon found'
        });
      }

      const newEndTime = new Date(beaconAlert.beaconEndTime.getTime() + additionalDuration * 1000);

      beaconAlert.beaconEndTime = newEndTime;
      await beaconAlert.save();

      res.json({
        message: 'Beacon duration extended successfully',
        newEndTime: newEndTime.toISOString(),
        additionalDuration: `${additionalDuration} seconds`
      });
    } catch (error) {
      console.error('Beacon extension error:', error);
      res.status(500).json({
        error: 'Server error extending beacon duration'
      });
    }
  }
);

// @desc    Get campus safety statistics
// @route   GET /api/beacon/stats
// @access  Private
router.get('/stats', 
  protect, 
  requireVerification,
  async (req, res) => {
    try {
      const stats = await EmergencyAlert.aggregate([
        { 
          $match: { 
            userId: req.user._id,
            alertType: 'Beacon Activation'
          } 
        },
        {
          $group: {
            _id: null,
            totalBeacons: { $sum: 1 },
            activeBeacons: {
              $sum: { $cond: [{ $eq: ['$beaconActive', true] }, 1, 0] }
            },
            totalDuration: {
              $sum: {
                $cond: [
                  { $and: [{ $ne: ['$beaconStartTime', null] }, { $ne: ['$beaconEndTime', null] }] },
                  { $divide: [{ $subtract: ['$beaconEndTime', '$beaconStartTime'] }, 1000] },
                  0
                ]
              }
            }
          }
        }
      ]);

      const campusLocations = await EmergencyAlert.aggregate([
        { 
          $match: { 
            userId: req.user._id,
            alertType: 'Beacon Activation'
          } 
        },
        {
          $group: {
            _id: '$location.campusLocation',
            count: { $sum: 1 }
          }
        }
      ]);

      res.json({
        summary: stats[0] || {
          totalBeacons: 0,
          activeBeacons: 0,
          totalDuration: 0
        },
        campusLocations,
        averageDuration: stats[0] ? Math.round(stats[0].totalDuration / stats[0].totalBeacons) : 0
      });
    } catch (error) {
      console.error('Beacon stats fetch error:', error);
      res.status(500).json({
        error: 'Server error fetching beacon statistics'
      });
    }
  }
);

module.exports = router;
