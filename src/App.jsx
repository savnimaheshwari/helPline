import React, { useState, useEffect } from 'react';
import { Heart, Shield, QrCode, Users, MapPin, AlertTriangle } from 'lucide-react';
import HealthForm from './components/healthform';
import QRCodeDisplay from './components/qrcodedisplay';
import CampusBeacon from './components/campusbeacon';

function App() {
  const [activeTab, setActiveTab] = useState('form');
  const [healthData, setHealthData] = useState(null);
  const [scannedData, setScannedData] = useState(null);

  // Load saved data from encrypted localStorage on app start
  useEffect(() => {
    const savedData = localStorage.getItem('helplineHealthData');
    if (savedData) {
      try {
        // In a real app, this would decrypt the data
        setHealthData(JSON.parse(savedData));
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    }
  }, []);

  const handleHealthDataSubmit = (data) => {
    setHealthData(data);
    // In a real app, this would encrypt the data before storing
    localStorage.setItem('helplineHealthData', JSON.stringify(data));
  };

  const handleScanResult = (data) => {
    setScannedData(data);
    setActiveTab('emergency');
  };

  const tabs = [
    { id: 'form', label: 'Health Info', icon: <Heart className="w-5 h-5" /> },
    { id: 'qr', label: 'QR Code', icon: <QrCode className="w-5 h-5" /> },
    { id: 'beacon', label: 'Campus Beacon', icon: <MapPin className="w-5 h-5" /> }
  ];

  return (
    <div className="container">
      <div className="app-header fade-in">
        <div className="header-content">
          <h1 className="app-title heartbeat">
            🚨 Helpline
          </h1>
          <p className="app-subtitle">Purdue University Student Safety Network</p>
          <div className="header-decoration"></div>
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