import React, { useState, useEffect } from 'react';
import { Heart, Phone, MapPin, User, Pill, Droplets, AlertTriangle, Shield, Save } from 'lucide-react';

const HealthForm = ({ onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    // Personal Info
    name: '',
    age: '',
    bloodType: '',
    
    // Health Info
    allergies: '',
    medications: '',
    
    // Campus Info
    campusLocation: '',
    residence: '',
    
    // Emergency Contacts
    emergencyContact1: {
      name: '',
      relationship: '',
      phone: ''
    },
    emergencyContact2: {
      name: '',
      relationship: '',
      phone: ''
    }
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const campusLocations = [
    'Academic Campus',
    'Discovery Park',
    'Purdue Airport',
    'Purdue Research Park',
    'West Lafayette Campus'
  ];
  const residences = [
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
  ];

  return (
    <div className="health-form-container">
      {/* Hero Section */}
      <div className="form-hero">
        <div className="hero-content">
          <div className="hero-icon">
            <Heart className="w-12 h-12" />
          </div>
          <h2 className="hero-title">Health Information</h2>
          <p className="hero-subtitle">Complete your emergency health profile for quick access</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="health-form">
        {/* Personal Information */}
        <div className="form-section">
          <div className="section-header">
            <User className="w-6 h-6" />
            <h3>Personal Information</h3>
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter your full name"
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Age</label>
              <input
                type="number"
                className="form-input"
                value={formData.age}
                onChange={(e) => handleInputChange('age', e.target.value)}
                placeholder="Enter your age"
                min="16"
                max="100"
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Blood Type</label>
              <select
                className="form-input"
                value={formData.bloodType}
                onChange={(e) => handleInputChange('bloodType', e.target.value)}
                required
              >
                <option value="">Select blood type</option>
                {bloodTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Health Information */}
        <div className="form-section">
          <div className="section-header">
            <Pill className="w-6 h-6" />
            <h3>Health Information</h3>
          </div>
          <div className="form-grid">
            <div className="form-group full-width">
              <label className="form-label">Allergies</label>
              <textarea
                className="form-input form-textarea"
                value={formData.allergies}
                onChange={(e) => handleInputChange('allergies', e.target.value)}
                placeholder="List any allergies (e.g., peanuts, penicillin, latex)"
                rows="3"
              />
            </div>
            
            <div className="form-group full-width">
              <label className="form-label">Current Medications</label>
              <textarea
                className="form-input form-textarea"
                value={formData.medications}
                onChange={(e) => handleInputChange('medications', e.target.value)}
                placeholder="List current medications and dosages"
                rows="3"
              />
            </div>
          </div>
        </div>

        {/* Campus Information */}
        <div className="form-section">
          <div className="section-header">
            <MapPin className="w-6 h-6" />
            <h3>Campus Information</h3>
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Campus Location</label>
              <select
                className="form-input"
                value={formData.campusLocation}
                onChange={(e) => handleInputChange('campusLocation', e.target.value)}
                required
              >
                <option value="">Select campus location</option>
                {campusLocations.map(location => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label">Residence</label>
              <select
                className="form-input"
                value={formData.residence}
                onChange={(e) => handleInputChange('residence', e.target.value)}
                required
              >
                <option value="">Select residence</option>
                {residences.map(residence => (
                  <option key={residence} value={residence}>{residence}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Emergency Contacts */}
        <div className="form-section">
          <div className="section-header">
            <Phone className="w-6 h-6" />
            <h3>Emergency Contacts</h3>
            <p>Primary and secondary emergency contacts</p>
          </div>
          
          <div className="contacts-grid">
            <div className="contact-card primary">
              <div className="contact-header">
                <div className="contact-number">1</div>
                <h4>Primary Contact</h4>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.emergencyContact1.name}
                    onChange={(e) => handleInputChange('emergencyContact1.name', e.target.value)}
                    placeholder="Full name"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Relationship</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.emergencyContact1.relationship}
                    onChange={(e) => handleInputChange('emergencyContact1.relationship', e.target.value)}
                    placeholder="e.g., Parent, Spouse, Friend"
                    required
                  />
                </div>
                
                <div className="form-group full-width">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    className="form-input"
                    value={formData.emergencyContact1.phone}
                    onChange={(e) => handleInputChange('emergencyContact1.phone', e.target.value)}
                    placeholder="(555) 123-4567"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="contact-card secondary">
              <div className="contact-header">
                <div className="contact-number">2</div>
                <h4>Secondary Contact</h4>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.emergencyContact2.name}
                    onChange={(e) => handleInputChange('emergencyContact2.name', e.target.value)}
                    placeholder="Full name"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Relationship</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.emergencyContact2.relationship}
                    onChange={(e) => handleInputChange('emergencyContact2.relationship', e.target.value)}
                    placeholder="e.g., Parent, Spouse, Friend"
                  />
                </div>
                
                <div className="form-group full-width">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    className="form-input"
                    value={formData.emergencyContact2.phone}
                    onChange={(e) => handleInputChange('emergencyContact2.phone', e.target.value)}
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="submit-section">
          <button type="submit" className="submit-btn">
            <Save className="w-5 h-5" />
            <span>Save Health Information</span>
          </button>
          <p className="submit-note">
            <Shield className="w-4 h-4 inline" />
            Your information is stored locally and securely on your device
          </p>
        </div>
      </form>
    </div>
  );
};

export default HealthForm; 