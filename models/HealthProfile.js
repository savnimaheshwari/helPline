const mongoose = require('mongoose');

const emergencyContactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  relationship: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true,
    match: /^[\+]?[1-9][\d]{0,15}$/ // International phone format
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  isNotified: {
    type: Boolean,
    default: false
  },
  lastNotified: {
    type: Date
  }
});

const healthProfileSchema = new mongoose.Schema({
  // Reference to User
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  // Personal Health Information
  dateOfBirth: {
    type: Date,
    required: true
  },
  
  age: {
    type: Number,
    min: 16,
    max: 100,
    required: true
  },
  
  bloodType: {
    type: String,
    required: true,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  
  height: {
    type: Number, // in centimeters
    min: 100,
    max: 250
  },
  
  weight: {
    type: Number, // in kilograms
    min: 30,
    max: 300
  },
  
  // Medical Information
  allergies: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    severity: {
      type: String,
      enum: ['Mild', 'Moderate', 'Severe', 'Life-threatening'],
      default: 'Moderate'
    },
    reaction: {
      type: String,
      trim: true
    },
    medications: [{
      type: String,
      trim: true
    }]
  }],
  
  medications: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    dosage: {
      type: String,
      trim: true
    },
    frequency: {
      type: String,
      trim: true
    },
    purpose: {
      type: String,
      trim: true
    },
    startDate: {
      type: Date
    },
    endDate: {
      type: Date
    }
  }],
  
  // Medical Conditions
  medicalConditions: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    diagnosisDate: {
      type: Date
    },
    isActive: {
      type: Boolean,
      default: true
    },
    symptoms: [{
      type: String,
      trim: true
    }],
    treatments: [{
      type: String,
      trim: true
    }]
  }],
  
  // Campus Information
  campusLocation: {
    type: String,
    required: true,
    enum: [
      'Academic Campus',
      'Discovery Park',
      'Purdue Airport',
      'Purdue Research Park',
      'West Lafayette Campus'
    ]
  },
  
  residence: {
    type: String,
    required: true,
    enum: [
      'Cary Quadrangle',
      'Earhart Hall',
      'First Street Towers',
      'Harrison Hall',
      'Hawkins Hall',
      'Hillenbrand Hall',
      'Hilltop Apartments',
      'Meredith Hall',
      'Owen Hall',
      'Purdue Village',
      'Shreve Hall',
      'Tarkington Hall',
      'Wiley Hall',
      'Windsor Hall',
      'Off-Campus Housing'
    ]
  },
  
  // Emergency Contacts
  emergencyContacts: {
    primary: {
      type: emergencyContactSchema,
      required: true
    },
    secondary: emergencyContactSchema
  },
  
  // Additional Emergency Information
  emergencyNotes: {
    type: String,
    trim: true,
    maxlength: 500
  },
  
  // Insurance Information
  insuranceProvider: {
    type: String,
    trim: true
  },
  
  insurancePolicyNumber: {
    type: String,
    trim: true
  },
  
  insuranceGroupNumber: {
    type: String,
    trim: true
  },
  
  // Privacy and Consent
  shareWithEmergencyServices: {
    type: Boolean,
    default: true
  },
  
  shareWithCampusHealth: {
    type: Boolean,
    default: true
  },
  
  // Timestamps
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  
  lastReviewed: {
    type: Date
  },
  
  // Version tracking
  dataVersion: {
    type: String,
    default: '1.0.0'
  }
}, {
  timestamps: true
});

// Virtual for age calculation
healthProfileSchema.virtual('calculatedAge').get(function() {
  if (this.dateOfBirth) {
    const today = new Date();
    const birthDate = new Date(this.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }
  return this.age;
});

// Virtual for BMI calculation
healthProfileSchema.virtual('bmi').get(function() {
  if (this.height && this.weight) {
    const heightInMeters = this.height / 100;
    return (this.weight / (heightInMeters * heightInMeters)).toFixed(1);
  }
  return null;
});

// Pre-save middleware to update age
healthProfileSchema.pre('save', function(next) {
  if (this.dateOfBirth) {
    this.age = this.calculatedAge;
  }
  this.lastUpdated = Date.now();
  next();
});

  // Indexes for performance (removed duplicates)
  healthProfileSchema.index({ campusLocation: 1 });
  healthProfileSchema.index({ residence: 1 });
  healthProfileSchema.index({ bloodType: 1 });

module.exports = mongoose.model('HealthProfile', healthProfileSchema);
