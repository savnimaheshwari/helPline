const mongoose = require('mongoose');

const emergencyAlertSchema = new mongoose.Schema({
  // Reference to User and Health Profile
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  healthProfileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HealthProfile',
    required: true
  },
  
  // Alert Information
  alertType: {
    type: String,
    required: true,
    enum: ['SOS', 'Medical Emergency', 'Safety Concern', 'Location Share', 'Beacon Activation'],
    default: 'SOS'
  },
  
  severity: {
    type: String,
    required: true,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'High'
  },
  
  status: {
    type: String,
    required: true,
    enum: ['Active', 'Acknowledged', 'Resolved', 'Cancelled'],
    default: 'Active'
  },
  
  // Location Information
  location: {
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
      index: '2dsphere'
    },
    address: {
      type: String,
      trim: true
    },
    campusLocation: {
      type: String,
      enum: [
        'Academic Campus',
        'Discovery Park',
        'Purdue Airport',
        'Purdue Research Park',
        'West Lafayette Campus'
      ]
    },
    building: {
      type: String,
      trim: true
    },
    room: {
      type: String,
      trim: true
    },
    accuracy: {
      type: Number // in meters
    }
  },
  
  // Emergency Details
  description: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  
  symptoms: [{
    type: String,
    trim: true
  }],
  
  // Response Information
  respondedBy: {
    type: String,
    enum: ['Emergency Services', 'Campus Police', 'Student Health', 'Emergency Contact', 'Other'],
    default: 'Emergency Services'
  },
  
  responseTime: {
    type: Date
  },
  
  resolutionTime: {
    type: Date
  },
  
  resolutionNotes: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  
  // Notification Tracking
  notificationsSent: {
    emergencyServices: {
      type: Boolean,
      default: false
    },
    campusPolice: {
      type: Boolean,
      default: false
    },
    primaryContact: {
      type: Boolean,
      default: false
    },
    secondaryContact: {
      type: Boolean,
      default: false
    }
  },
  
  notificationAttempts: {
    emergencyServices: {
      type: Number,
      default: 0
    },
    campusPolice: {
      type: Number,
      default: 0
    },
    primaryContact: {
      type: Number,
      default: 0
    },
    secondaryContact: {
      type: Number,
      default: 0
    }
  },
  
  // Beacon Information (if applicable)
  beaconActive: {
    type: Boolean,
    default: false
  },
  
  beaconStartTime: {
    type: Date
  },
  
  beaconEndTime: {
    type: Date
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  },
  
  // Metadata
  deviceInfo: {
    userAgent: String,
    platform: String,
    appVersion: String
  },
  
  // Privacy and Compliance
  isAnonymous: {
    type: Boolean,
    default: false
  },
  
  shareWithCampus: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Virtual for response time calculation
emergencyAlertSchema.virtual('responseTimeMinutes').get(function() {
  if (this.responseTime && this.createdAt) {
    return Math.round((this.responseTime - this.createdAt) / (1000 * 60));
  }
  return null;
});

// Virtual for resolution time calculation
emergencyAlertSchema.virtual('resolutionTimeMinutes').get(function() {
  if (this.resolutionTime && this.createdAt) {
    return Math.round((this.resolutionTime - this.createdAt) / (1000 * 60));
  }
  return null;
});

// Virtual for isActive
emergencyAlertSchema.virtual('isActive').get(function() {
  return this.status === 'Active';
});

// Pre-save middleware to update timestamp
emergencyAlertSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Static method to find active alerts
emergencyAlertSchema.statics.findActive = function() {
  return this.find({ status: 'Active' });
};

// Static method to find alerts by user
emergencyAlertSchema.statics.findByUser = function(userId) {
  return this.find({ userId }).sort({ createdAt: -1 });
};

// Static method to find alerts by location (within radius)
emergencyAlertSchema.statics.findNearby = function(coordinates, maxDistance = 1000) {
  return this.find({
    'location.coordinates': {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: coordinates
        },
        $maxDistance: maxDistance
      }
    },
    status: 'Active'
  });
};

// Static method to find critical alerts
emergencyAlertSchema.statics.findCritical = function() {
  return this.find({
    severity: 'Critical',
    status: 'Active'
  });
};

  // Indexes for performance and geospatial queries (removed duplicates)
  emergencyAlertSchema.index({ status: 1, severity: 1 });
  emergencyAlertSchema.index({ alertType: 1, createdAt: -1 });
  emergencyAlertSchema.index({ beaconActive: 1, status: 1 });

module.exports = mongoose.model('EmergencyAlert', emergencyAlertSchema);
