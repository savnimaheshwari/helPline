import React, { useEffect, useState } from 'react';
import { QrCode, Download, Share2, Home, Plus, Smartphone, Shield } from 'lucide-react';
import QRCode from 'qrcode';

const QRCodeDisplay = ({ healthData }) => {
  const [qrDataUrl, setQrDataUrl] = useState('');

  useEffect(() => {
    generateQRCode();
  }, [healthData]);

  const generateQRCode = async () => {
    try {
      // Create a comprehensive emergency data object that can be scanned directly
      const emergencyData = {
        type: 'helpline_emergency',
        version: '1.0',
        timestamp: new Date().toISOString(),
        personal: {
          name: healthData.name,
          age: healthData.age,
          bloodType: healthData.bloodType,
          allergies: healthData.allergies || 'None specified',
          medications: healthData.medications || 'None specified',
          campusLocation: healthData.campusLocation,
          residence: healthData.residence
        },
        emergencyContacts: {
          primary: healthData.emergencyContact1,
          secondary: healthData.emergencyContact2
        },
        purdueResources: {
          studentHealth: '(765) 494-1700',
          campusCounseling: '(765) 494-6995',
          purduePolice: '(765) 494-8221',
          emergency: '911',
          healthCenterAddress: '601 Stadium Ave, West Lafayette, IN 47907',
          policeAddress: '205 S. Martin Jischke Drive, West Lafayette, IN 47907'
        },
        instructions: 'In emergency: Call 911 first, then contact emergency contacts above. Use Purdue resources for non-emergency situations.'
      };

      // Generate QR code with the emergency data
      const dataUrl = await QRCode.toDataURL(JSON.stringify(emergencyData), {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        },
        errorCorrectionLevel: 'H' // High error correction for better scanning
      });
      
      setQrDataUrl(dataUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  const downloadQRCode = () => {
    if (qrDataUrl) {
      const link = document.createElement('a');
      link.download = `helpline-qr-${healthData.name.replace(/\s+/g, '-')}.png`;
      link.href = qrDataUrl;
      link.click();
    }
  };

  const shareQRCode = async () => {
    if (navigator.share && qrDataUrl) {
      try {
        // Convert data URL to blob for sharing
        const response = await fetch(qrDataUrl);
        const blob = await response.blob();
        const file = new File([blob], 'helpline-qr.png', { type: 'image/png' });
        
        await navigator.share({
          title: 'Helpline Emergency QR Code',
          text: `Emergency health information for ${healthData.name}`,
          files: [file]
        });
      } catch (error) {
        console.error('Error sharing:', error);
        // Fallback to download
        downloadQRCode();
      }
    } else {
      // Fallback for browsers that don't support sharing
      downloadQRCode();
    }
  };

  return (
    <div className="qr-display-container">
      {/* Hero Section */}
      <div className="qr-hero">
        <div className="hero-content">
          <div className="hero-icon">
            <Shield className="w-12 h-12" />
          </div>
          <h2 className="hero-title">Emergency QR Code</h2>
          <p className="hero-subtitle">Instant access to your critical health information</p>
        </div>
      </div>

      {/* QR Code Section */}
      <div className="qr-main-section">
        <div className="qr-code-container">
          {qrDataUrl ? (
            <div className="qr-code-display">
              <div className="qr-code-wrapper">
                <img 
                  src={qrDataUrl} 
                  alt="Emergency Health QR Code"
                  className="qr-code-image"
                />
                <div className="qr-code-overlay">
                  <div className="overlay-content">
                    <QrCode className="w-8 h-8" />
                    <span>Ready to Scan</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="qr-code-loading">
              <div className="loading-spinner"></div>
              <p>Generating QR Code...</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="qr-actions">
          <button onClick={downloadQRCode} className="action-btn primary">
            <Download className="w-5 h-5" />
            <span>Download</span>
          </button>
          
          <button onClick={shareQRCode} className="action-btn secondary">
            <Share2 className="w-5 h-5" />
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* Widget Setup Section */}
      <div className="widget-setup-section">
        <div className="section-header">
          <Home className="w-6 h-6" />
          <h3>Home Screen Widget</h3>
          <p>Quick access to your emergency QR code</p>
        </div>

        <div className="setup-cards">
          <div className="setup-card ios">
            <div className="card-header">
              <div className="platform-icon">🍎</div>
              <h4>iOS Widget</h4>
            </div>
            <div className="setup-steps">
              <div className="step">
                <div className="step-number">1</div>
                <span>Long press on home screen</span>
              </div>
              <div className="step">
                <div className="step-number">2</div>
                <span>Tap <Plus className="w-4 h-4 inline" /> button</span>
              </div>
              <div className="step">
                <div className="step-number">3</div>
                <span>Search "Helpline" and add widget</span>
              </div>
              <div className="step">
                <div className="step-number">4</div>
                <span>Widget displays QR code instantly</span>
              </div>
            </div>
          </div>

          <div className="setup-card android">
            <div className="card-header">
              <div className="platform-icon">🤖</div>
              <h4>Android Shortcut</h4>
            </div>
            <div className="setup-steps">
              <div className="step">
                <div className="step-number">1</div>
                <span>Long press on home screen</span>
              </div>
              <div className="step">
                <div className="step-number">2</div>
                <span>Select "Widgets"</span>
              </div>
              <div className="step">
                <div className="step-number">3</div>
                <span>Find "Helpline" and add to home</span>
              </div>
              <div className="step">
                <div className="step-number">4</div>
                <span>Tap shortcut to show QR code</span>
              </div>
            </div>
          </div>
        </div>

        <div className="benefit-highlight">
          <div className="benefit-icon">⚡</div>
          <div className="benefit-content">
            <h4>One-Tap Access</h4>
            <p>Your emergency QR code is just one tap away from your home screen</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCodeDisplay; 