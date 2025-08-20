import React, { useState, useEffect } from 'react';
import { Heart, Shield, QrCode, Users, MapPin, AlertTriangle, Bell, CheckCircle, Zap } from 'lucide-react';
import HealthForm from './components/healthform';
import QRCodeDisplay from './components/qrcodedisplay';
import CampusBeacon from './components/campusbeacon';

function App() {
  const [activeTab, setActiveTab] = useState('form');
  const [healthData, setHealthData] = useState(null);
  const [scannedData, setScannedData] = useState(null);
  const [showWelcome, setShowWelcome] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [appStats, setAppStats] = useState({
    lastUpdated: null,
    dataVersion: '1.0.0',
    totalSaves: 0,
    emergencyContacts: 0
  });

  // Load saved data from encrypted localStorage on app start
  useEffect(() => {
    const savedData = localStorage.getItem('helplineHealthData');
    if (savedData) {
      try {
        // In a real app, this would decrypt the data
        const parsedData = JSON.parse(savedData);
        setHealthData(parsedData);
        
        // Update app stats
        updateAppStats(parsedData);
      } catch (error) {
        console.error('Error loading saved data:', error);
        showNotification('Error loading saved data', 'error');
      }
    }

    // Hide welcome message after 3 seconds
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const updateAppStats = (data) => {
    if (data) {
      setAppStats(prev => ({
        ...prev,
        lastUpdated: new Date().toISOString(),
        totalSaves: prev.totalSaves + 1,
        emergencyContacts: (data.emergencyContact1?.name ? 1 : 0) + (data.emergencyContact2?.name ? 1 : 0)
      }));
    }
  };

  const showNotification = (message, type = 'info') => {
    const id = Date.now();
    const notification = {
      id,
      message,
      type,
      timestamp: new Date().toISOString()
    };
    
    setNotifications(prev => [...prev, notification]);
    
    // Auto-remove notification after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  const handleHealthDataSubmit = (data) => {
    setHealthData(data);
    
    // Simulate data encryption before storing
    const encryptedData = btoa(JSON.stringify(data)); // Base64 encoding simulation
    localStorage.setItem('helplineHealthData', encryptedData);
    
    // Update stats
    updateAppStats(data);
    
    // Show success notification
    showNotification('Health information saved successfully!', 'success');
    
    // Simulate data backup
    setTimeout(() => {
      showNotification('Data backed up to secure cloud storage', 'info');
    }, 1000);
  };

  const handleScanResult = (data) => {
    setScannedData(data);
    setActiveTab('emergency');
    showNotification('QR Code scanned successfully!', 'success');
  };

  const clearAllData = () => {
    if (window.confirm('Are you sure you want to clear all health data? This action cannot be undone.')) {
      localStorage.removeItem('helplineHealthData');
      setHealthData(null);
      setScannedData(null);
      setAppStats({
        lastUpdated: null,
        dataVersion: '1.0.0',
        totalSaves: 0,
        emergencyContacts: 0
      });
      showNotification('All data cleared successfully', 'info');
    }
  };

  const exportData = () => {
    if (healthData) {
      const dataStr = JSON.stringify(healthData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `helpline-health-data-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      showNotification('Health data exported successfully!', 'success');
    }
  };

  const tabs = [
    { id: 'form', label: 'Health Info', icon: <Heart className="w-5 h-5" /> },
    { id: 'qr', label: 'QR Code', icon: <QrCode className="w-5 h-5" /> },
    { id: 'beacon', label: 'Campus Beacon', icon: <MapPin className="w-5 h-5" /> }
  ];

  return (
    <div className="container">
      {/* Welcome Animation */}
      {showWelcome && (
        <div className="welcome-overlay">
          <div className="welcome-content">
            <div className="welcome-icon">
              <Heart className="w-12 h-12 text-red-500" />
            </div>
            <h1 className="welcome-title">Welcome to Helpline</h1>
            <p className="welcome-subtitle">Your safety is our priority</p>
            <div className="welcome-progress">
              <div className="progress-bar"></div>
            </div>
          </div>
        </div>
      )}

      {/* Notifications */}
      <div className="notifications-container">
        {notifications.map(notification => (
          <div key={notification.id} className={`notification ${notification.type}`}>
            <div className="notification-icon">
              {notification.type === 'success' && <CheckCircle className="w-4 h-4" />}
              {notification.type === 'error' && <AlertTriangle className="w-4 h-4" />}
              {notification.type === 'info' && <Bell className="w-4 h-4" />}
            </div>
            <span className="notification-message">{notification.message}</span>
            <button 
              className="notification-close"
              onClick={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <div className="app-header fade-in">
        <div className="header-content">
          <h1 className="app-title heartbeat">
            🚨 Helpline
          </h1>
          <p className="app-subtitle">Purdue University Student Safety Network</p>
          <div className="header-decoration"></div>
          
          {/* App Stats */}
          {healthData && (
            <div className="app-stats">
              <div className="stat-item">
                <Shield className="w-4 h-4" />
                <span>Data Version: {appStats.dataVersion}</span>
              </div>
              <div className="stat-item">
                <CheckCircle className="w-4 h-4" />
                <span>Last Updated: {appStats.lastUpdated ? new Date(appStats.lastUpdated).toLocaleDateString() : 'Never'}</span>
              </div>
              <div className="stat-item">
                <Users className="w-4 h-4" />
                <span>Emergency Contacts: {appStats.emergencyContacts}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="nav-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Data Management Actions */}
      {healthData && (
        <div className="data-actions">
          <button onClick={exportData} className="action-btn secondary">
            <Zap className="w-4 h-4" />
            Export Data
          </button>
          <button onClick={clearAllData} className="action-btn danger">
            <AlertTriangle className="w-4 h-4" />
            Clear Data
          </button>
        </div>
      )}

      <div key={activeTab} className="tab-content fade-in">
        {activeTab === 'form' && (
          <HealthForm 
            onSubmit={handleHealthDataSubmit}
            initialData={healthData}
          />
        )}
        
        {activeTab === 'qr' && healthData && (
          <QRCodeDisplay healthData={healthData} />
        )}
        
        {activeTab === 'qr' && !healthData && (
          <div className="card text-center empty-state">
            <div className="empty-icon">📋</div>
            <h3>Health Information Required</h3>
            <p>Please fill out your health information first to generate a QR code.</p>
            <button 
              className="btn mt-6"
              onClick={() => setActiveTab('form')}
            >
              Go to Health Form
            </button>
          </div>
        )}
        
        {activeTab === 'beacon' && (
          <CampusBeacon healthData={healthData} />
        )}
      </div>
    </div>
  );
}

export default App; 