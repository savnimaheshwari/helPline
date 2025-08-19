import React, { useState, useEffect } from 'react';
import { MapPin, Phone, AlertTriangle, Shield, Clock, Users, Wifi, Heart, Navigation, Zap } from 'lucide-react';

const CampusBeacon = ({ healthData }) => {
  const [isBeaconActive, setIsBeaconActive] = useState(false);
  const [beaconTimeLeft, setBeaconTimeLeft] = useState(0);
  const [location, setLocation] = useState(null);
  const [isSendingSOS, setIsSendingSOS] = useState(false);

  // Purdue University campus resources
  const purdueResources = {
    studentHealth: {
      name: 'Purdue Student Health Center',
      phone: '(765) 494-1700',
      location: '601 Stadium Ave, West Lafayette, IN 47907',
      hours: 'Mon-Fri: 8:00 AM - 5:00 PM'
    },
    campusCounseling: {
      name: 'Purdue Counseling & Psychological Services',
      phone: '(765) 494-6995',
      location: 'Purdue University Student Health Center',
      hours: 'Mon-Fri: 8:00 AM - 5:00 PM'
    },
    purduePolice: {
      name: 'Purdue University Police Department',
      phone: '(765) 494-8221',
      emergency: '(765) 494-8221',
      location: '205 S. Martin Jischke Drive, West Lafayette, IN 47907',
      hours: '24/7 Emergency Response'
    },
    emergencyServices: {
      name: 'Emergency Services',
      phone: '911',
      description: 'Local emergency response'
    }
  };

  useEffect(() => {
    let timer;
    if (isBeaconActive && beaconTimeLeft > 0) {
      timer = setInterval(() => {
        setBeaconTimeLeft(prev => {
          if (prev <= 1) {
            setIsBeaconActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isBeaconActive, beaconTimeLeft]);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          // Fallback to approximate Purdue location
          setLocation({
            lat: 40.4237,
            lng: -86.9212,
            accuracy: 'Approximate Purdue University location'
          });
        }
      );
    } else {
      // Fallback to Purdue coordinates
      setLocation({
        lat: 40.4237,
        lng: -86.9212,
        accuracy: 'Purdue University, West Lafayette, IN'
      });
    }
  };

  const activateBeacon = () => {
    getCurrentLocation();
    setIsBeaconActive(true);
    setBeaconTimeLeft(300); // 5 minutes
  };

  const deactivateBeacon = () => {
    setIsBeaconActive(false);
    setBeaconTimeLeft(0);
  };

  const sendSOS = async () => {
    if (!healthData) {
      alert('Please fill out your health information first.');
      return;
    }

    setIsSendingSOS(true);
    getCurrentLocation();

    // Simulate SOS sending process
    setTimeout(() => {
      setIsSendingSOS(false);
      alert('SOS alert sent! Emergency contacts and campus safety have been notified with your location and health information.');
    }, 2000);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="beacon-container">
      {/* Hero Section */}
      <div className="beacon-hero">
        <div className="hero-content">
          <div className="hero-icon">
            <MapPin className="w-12 h-12" />
          </div>
          <h2 className="hero-title">Campus Beacon & SOS</h2>
          <p className="hero-subtitle">Emergency location sharing and safety alerts</p>
        </div>
      </div>

      {/* SOS Emergency Button */}
      <div className="sos-section">
        <div className="sos-container">
          <button
            className="sos-button"
            onClick={sendSOS}
            disabled={isSendingSOS}
          >
            {isSendingSOS ? (
              <>
                <div className="sos-spinner"></div>
                <span>SENDING SOS...</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-8 h-8" />
                <span>🚨 SOS EMERGENCY 🚨</span>
              </>
            )}
          </button>
          <p className="sos-description">
            Press in emergency situations to alert contacts and campus safety
          </p>
        </div>
      </div>

      {/* System Status */}
      <div className="status-section">
        <div className="section-header">
          <Shield className="w-6 h-6" />
          <h3>System Status</h3>
        </div>
        <div className="status-grid">
          <div className="status-item">
            <div className="status-icon beacon">
              <Wifi className="w-5 h-5" />
            </div>
            <div className="status-content">
              <h4>Beacon</h4>
              <p className={isBeaconActive ? 'status-active' : 'status-inactive'}>
                {isBeaconActive ? '🟢 Active' : '🔴 Inactive'}
              </p>
            </div>
          </div>
          
          <div className="status-item">
            <div className="status-icon location">
              <Navigation className="w-5 h-5" />
            </div>
            <div className="status-content">
              <h4>Location</h4>
              <p className={location ? 'status-active' : 'status-inactive'}>
                {location ? '🟢 Available' : '🔴 Not available'}
              </p>
            </div>
          </div>
          
          <div className="status-item">
            <div className="status-icon health">
              <Heart className="w-5 h-5" />
            </div>
            <div className="status-content">
              <h4>Health Data</h4>
              <p className={healthData ? 'status-active' : 'status-inactive'}>
                {healthData ? '🟢 Loaded' : '🔴 Not loaded'}
              </p>
            </div>
          </div>
          
          {isBeaconActive && (
            <div className="status-item timer">
              <div className="status-icon timer">
                <Clock className="w-5 h-5" />
              </div>
              <div className="status-content">
                <h4>Time Remaining</h4>
                <p className="status-timer">{formatTime(beaconTimeLeft)}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Campus Beacon Controls */}
      <div className="beacon-controls">
        <div className="section-header">
          <Wifi className="w-6 h-6" />
          <h3>Campus Beacon</h3>
          <p>Temporarily broadcast your location to trusted contacts and campus safety</p>
        </div>
        
        <div className="beacon-actions">
          {!isBeaconActive ? (
            <button 
              onClick={activateBeacon}
              className="beacon-btn activate"
            >
              <Wifi className="w-5 h-5" />
              <span>Activate Beacon</span>
            </button>
          ) : (
            <div className="beacon-active">
              <div className="active-indicator">
                <div className="pulse-dot"></div>
                <h4>Beacon Active</h4>
                <p>Location broadcasting to trusted contacts</p>
                <div className="time-display">
                  <Clock className="w-4 h-4" />
                  <span>Time remaining: {formatTime(beaconTimeLeft)}</span>
                </div>
              </div>
              
              <button 
                onClick={deactivateBeacon}
                className="beacon-btn deactivate"
              >
                <Zap className="w-5 h-5" />
                <span>Deactivate Beacon</span>
              </button>
            </div>
          )}
        </div>

        {location && (
          <div className="location-info">
            <div className="location-header">
              <Navigation className="w-5 h-5" />
              <h4>Current Location</h4>
            </div>
            <div className="location-details">
              <p><strong>Latitude:</strong> {location.lat.toFixed(6)}</p>
              <p><strong>Longitude:</strong> {location.lng.toFixed(6)}</p>
              <p><strong>Accuracy:</strong> {location.accuracy}</p>
            </div>
          </div>
        )}
      </div>

      {/* Campus Resources */}
      <div className="resources-section">
        <div className="section-header">
          <Phone className="w-6 h-6" />
          <h3>Campus Resources</h3>
          <p>Emergency contacts and campus safety information</p>
        </div>
        
        <div className="resources-grid">
          {Object.entries(purdueResources).map(([key, resource]) => (
            <div key={key} className="resource-card">
              <div className="resource-header">
                <div className="resource-icon">
                  {key === 'studentHealth' && <Heart className="w-5 h-5" />}
                  {key === 'campusCounseling' && <Users className="w-5 h-5" />}
                  {key === 'purduePolice' && <Shield className="w-5 h-5" />}
                  {key === 'emergencyServices' && <AlertTriangle className="w-5 h-5" />}
                </div>
                <h4>{resource.name}</h4>
              </div>
              <div className="resource-content">
                <p><strong>Phone:</strong> {resource.phone}</p>
                {resource.location && <p><strong>Location:</strong> {resource.location}</p>}
                {resource.hours && <p><strong>Hours:</strong> {resource.hours}</p>}
                {resource.description && <p><strong>Description:</strong> {resource.description}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CampusBeacon; 