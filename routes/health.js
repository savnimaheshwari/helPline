const express = require('express');
const HealthProfile = require('../models/HealthProfile');
const { protect, requireVerification, requireHealthProfile, logUserAction } = require('../middleware/auth');

const router = express.Router();

// @desc    Create health profile
// @route   POST /api/health
// @access  Private
router.post('/', 
  protect, 
  requireVerification,
  logUserAction('health_profile_create'),
  async (req, res) => {
    try {
      // Check if profile already exists
      const existingProfile = await HealthProfile.findOne({ userId: req.user._id });
      
      if (existingProfile) {
        return res.status(400).json({
          error: 'Health profile already exists. Use PUT to update.'
        });
      }

      // Create new health profile
      const healthProfile = await HealthProfile.create({
        userId: req.user._id,
        ...req.body
      });

      res.status(201).json({
        message: 'Health profile created successfully',
        healthProfile
      });
    } catch (error) {
      console.error('Health profile creation error:', error);
      
      if (error.name === 'ValidationError') {
        const validationErrors = Object.values(error.errors).map(err => err.message);
        return res.status(400).json({
          error: 'Validation error',
          details: validationErrors
        });
      }
      
      res.status(500).json({
        error: 'Server error creating health profile'
      });
    }
  }
);

// @desc    Get user's health profile
// @route   GET /api/health
// @access  Private
router.get('/', 
  protect, 
  requireVerification,
  async (req, res) => {
    try {
      const healthProfile = await HealthProfile.findOne({ userId: req.user._id });
      
      if (!healthProfile) {
        return res.status(404).json({
          error: 'Health profile not found. Please create your health profile first.'
        });
      }

      res.json(healthProfile);
    } catch (error) {
      console.error('Health profile fetch error:', error);
      res.status(500).json({
        error: 'Server error fetching health profile'
      });
    }
  }
);

// @desc    Update health profile
// @route   PUT /api/health
// @access  Private
router.put('/', 
  protect, 
  requireVerification,
  requireHealthProfile,
  logUserAction('health_profile_update'),
  async (req, res) => {
    try {
      const updatedProfile = await HealthProfile.findOneAndUpdate(
        { userId: req.user._id },
        { 
          ...req.body,
          lastUpdated: Date.now()
        },
        { 
          new: true, 
          runValidators: true 
        }
      );

      res.json({
        message: 'Health profile updated successfully',
        healthProfile: updatedProfile
      });
    } catch (error) {
      console.error('Health profile update error:', error);
      
      if (error.name === 'ValidationError') {
        const validationErrors = Object.values(error.errors).map(err => err.message);
        return res.status(400).json({
          error: 'Validation error',
          details: validationErrors
        });
      }
      
      res.status(500).json({
        error: 'Server error updating health profile'
      });
    }
  }
);

// @desc    Delete health profile
// @route   DELETE /api/health
// @access  Private
router.delete('/', 
  protect, 
  requireVerification,
  requireHealthProfile,
  logUserAction('health_profile_delete'),
  async (req, res) => {
    try {
      await HealthProfile.findOneAndDelete({ userId: req.user._id });
      
      res.json({
        message: 'Health profile deleted successfully'
      });
    } catch (error) {
      console.error('Health profile deletion error:', error);
      res.status(500).json({
        error: 'Server error deleting health profile'
      });
    }
  }
);

// @desc    Get emergency QR code data
// @route   GET /api/health/qr-data
// @access  Private
router.get('/qr-data', 
  protect, 
  requireVerification,
  requireHealthProfile,
  async (req, res) => {
    try {
      const healthProfile = req.healthProfile;
      
      // Create emergency data object for QR code
      const emergencyData = {
        type: 'helpline_emergency',
        version: healthProfile.dataVersion || '1.0',
        timestamp: new Date().toISOString(),
        personal: {
          name: `${req.user.firstName} ${req.user.lastName}`,
          age: healthProfile.age,
          bloodType: healthProfile.bloodType,
          allergies: healthProfile.allergies || [],
          medications: healthProfile.medications || [],
          campusLocation: healthProfile.campusLocation,
          residence: healthProfile.residence
        },
        emergencyContacts: {
          primary: healthProfile.emergencyContacts.primary,
          secondary: healthProfile.emergencyContacts.secondary
        },
        purdueResources: {
          studentHealth: process.env.STUDENT_HEALTH_NUMBER || '(765) 494-1700',
          campusCounseling: '(765) 494-6995',
          purduePolice: process.env.PURDUE_POLICE_NUMBER || '(765) 494-8221',
          emergency: process.env.CAMPUS_EMERGENCY_NUMBER || '911',
          healthCenterAddress: '601 Stadium Ave, West Lafayette, IN 47907',
          policeAddress: '205 S. Martin Jischke Drive, West Lafayette, IN 47907'
        },
        instructions: 'In emergency: Call 911 first, then contact emergency contacts above. Use Purdue resources for non-emergency situations.'
      };

      res.json(emergencyData);
    } catch (error) {
      console.error('QR data fetch error:', error);
      res.status(500).json({
        error: 'Server error fetching QR data'
      });
    }
  }
);

// @desc    Export health data
// @route   GET /api/health/export
// @access  Private
router.get('/export', 
  protect, 
  requireVerification,
  requireHealthProfile,
  logUserAction('health_data_export'),
  async (req, res) => {
    try {
      const healthProfile = req.healthProfile;
      
      // Create export data
      const exportData = {
        exportDate: new Date().toISOString(),
        user: {
          firstName: req.user.firstName,
          lastName: req.user.lastName,
          email: req.user.email,
          purdueId: req.user.purdueId
        },
        healthProfile: healthProfile.toObject(),
        metadata: {
          exportedBy: 'helpline-api',
          version: '1.0.0'
        }
      };

      // Set headers for file download
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="helpline-health-data-${req.user.purdueId}-${new Date().toISOString().split('T')[0]}.json"`);
      
      res.json(exportData);
    } catch (error) {
      console.error('Health data export error:', error);
      res.status(500).json({
        error: 'Server error exporting health data'
      });
    }
  }
);

// @desc    Get health profile summary
// @route   GET /api/health/summary
// @access  Private
router.get('/summary', 
  protect, 
  requireVerification,
  requireHealthProfile,
  async (req, res) => {
    try {
      const healthProfile = req.healthProfile;
      
      const summary = {
        personalInfo: {
          name: `${req.user.firstName} ${req.user.lastName}`,
          age: healthProfile.age,
          bloodType: healthProfile.bloodType,
          campusLocation: healthProfile.campusLocation,
          residence: healthProfile.residence
        },
        medicalSummary: {
          allergiesCount: healthProfile.allergies?.length || 0,
          medicationsCount: healthProfile.medications?.length || 0,
          conditionsCount: healthProfile.medicalConditions?.length || 0
        },
        emergencyContacts: {
          primary: healthProfile.emergencyContacts.primary,
          secondary: healthProfile.emergencyContacts.secondary
        },
        lastUpdated: healthProfile.lastUpdated,
        dataVersion: healthProfile.dataVersion
      };

      res.json(summary);
    } catch (error) {
      console.error('Health summary fetch error:', error);
      res.status(500).json({
        error: 'Server error fetching health summary'
      });
    }
  }
);

// @desc    Update emergency contacts
// @route   PUT /api/health/emergency-contacts
// @access  Private
router.put('/emergency-contacts', 
  protect, 
  requireVerification,
  requireHealthProfile,
  logUserAction('emergency_contacts_update'),
  async (req, res) => {
    try {
      const { primary, secondary } = req.body;
      
      if (!primary || !primary.name || !primary.phone) {
        return res.status(400).json({
          error: 'Primary emergency contact information is required'
        });
      }

      const updatedProfile = await HealthProfile.findOneAndUpdate(
        { userId: req.user._id },
        { 
          'emergencyContacts.primary': primary,
          'emergencyContacts.secondary': secondary,
          lastUpdated: Date.now()
        },
        { new: true, runValidators: true }
      );

      res.json({
        message: 'Emergency contacts updated successfully',
        emergencyContacts: updatedProfile.emergencyContacts
      });
    } catch (error) {
      console.error('Emergency contacts update error:', error);
      
      if (error.name === 'ValidationError') {
        const validationErrors = Object.values(error.errors).map(err => err.message);
        return res.status(400).json({
          error: 'Validation error',
          details: validationErrors
        });
      }
      
      res.status(500).json({
        error: 'Server error updating emergency contacts'
      });
    }
  }
);

// @desc    Add medical condition
// @route   POST /api/health/medical-conditions
// @access  Private
router.post('/medical-conditions', 
  protect, 
  requireVerification,
  requireHealthProfile,
  logUserAction('medical_condition_add'),
  async (req, res) => {
    try {
      const { name, diagnosisDate, symptoms, treatments } = req.body;
      
      if (!name) {
        return res.status(400).json({
          error: 'Medical condition name is required'
        });
      }

      const updatedProfile = await HealthProfile.findOneAndUpdate(
        { userId: req.user._id },
        { 
          $push: { 
            medicalConditions: {
              name,
              diagnosisDate,
              symptoms,
              treatments
            }
          },
          lastUpdated: Date.now()
        },
        { new: true, runValidators: true }
      );

      const newCondition = updatedProfile.medicalConditions[updatedProfile.medicalConditions.length - 1];

      res.status(201).json({
        message: 'Medical condition added successfully',
        medicalCondition: newCondition
      });
    } catch (error) {
      console.error('Medical condition addition error:', error);
      res.status(500).json({
        error: 'Server error adding medical condition'
      });
    }
  }
);

// @desc    Update medical condition
// @route   PUT /api/health/medical-conditions/:conditionId
// @access  Private
router.put('/medical-conditions/:conditionId', 
  protect, 
  requireVerification,
  requireHealthProfile,
  logUserAction('medical_condition_update'),
  async (req, res) => {
    try {
      const { conditionId } = req.params;
      const updates = req.body;

      const updatedProfile = await HealthProfile.findOneAndUpdate(
        { 
          userId: req.user._id,
          'medicalConditions._id': conditionId
        },
        { 
          $set: {
            'medicalConditions.$': { ...updates, _id: conditionId },
            lastUpdated: Date.now()
          }
        },
        { new: true, runValidators: true }
      );

      if (!updatedProfile) {
        return res.status(404).json({
          error: 'Medical condition not found'
        });
      }

      const updatedCondition = updatedProfile.medicalConditions.find(
        condition => condition._id.toString() === conditionId
      );

      res.json({
        message: 'Medical condition updated successfully',
        medicalCondition: updatedCondition
      });
    } catch (error) {
      console.error('Medical condition update error:', error);
      res.status(500).json({
        error: 'Server error updating medical condition'
      });
    }
  }
);

module.exports = router;
