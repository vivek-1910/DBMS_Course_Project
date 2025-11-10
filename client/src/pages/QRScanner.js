import React, { useState, useRef, useEffect } from 'react';
import { Camera, CheckCircle, XCircle, Car, Clock, AlertCircle } from 'lucide-react';
import axios from 'axios';
import jsQR from 'jsqr';
import './QRScanner.css';

const QRScanner = () => {
  const [scanning, setScanning] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const [vehicleInfo, setVehicleInfo] = useState(null);
  const [parkingStatus, setParkingStatus] = useState(null);
  const [message, setMessage] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [manualRFID, setManualRFID] = useState('');
  const [cameraLoading, setCameraLoading] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const scanIntervalRef = useRef(null);
  const metadataTimeoutRef = useRef(null);

  // Start camera
  const startCamera = async () => {
    try {
      console.log('=== START CAMERA CALLED ===');
      setCameraError(null);
      setCameraLoading(true);
      
      console.log('Requesting getUserMedia...');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment', width: 640, height: 480 } 
      });
      
      console.log('Stream obtained:', stream);
      console.log('Stream active:', stream.active);
      console.log('Stream tracks:', stream.getTracks());
      console.log('Video track settings:', stream.getVideoTracks()[0]?.getSettings());
      
      if (videoRef.current) {
        console.log('Video element exists:', videoRef.current);
        console.log('Video element readyState BEFORE srcObject:', videoRef.current.readyState);
        
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        
        console.log('srcObject assigned to video element');
        console.log('Video element readyState AFTER srcObject:', videoRef.current.readyState);
        
        // ensure autoplay works across browsers: mute and call play()
        videoRef.current.muted = true;
        videoRef.current.playsInline = true;
        
        console.log('Video element muted and playsInline set');
        
        // Timeout fallback if metadata doesn't load in 5 seconds
        metadataTimeoutRef.current = setTimeout(() => {
          console.warn('⚠️ Video metadata timeout - forcing scanning mode');
          if (videoRef.current && videoRef.current.readyState >= 2) {
            console.log('✅ Video has some data, proceeding:', {
              videoWidth: videoRef.current.videoWidth,
              videoHeight: videoRef.current.videoHeight,
              readyState: videoRef.current.readyState,
              paused: videoRef.current.paused,
              currentTime: videoRef.current.currentTime
            });
            setCameraLoading(false);
            setScanning(true);
            setMessage({ type: 'info', text: 'Camera active. Show QR code to scan...' });
            scanIntervalRef.current = setInterval(scanQRCode, 100); // was 300, now 100ms
            console.log('🔄 Scanning interval started via timeout (every 100ms)');
          } else {
            console.error('❌ Video still not ready after timeout:', {
              readyState: videoRef.current?.readyState,
              videoWidth: videoRef.current?.videoWidth,
              videoHeight: videoRef.current?.videoHeight,
              paused: videoRef.current?.paused
            });
            setCameraLoading(false);
            setMessage({ type: 'error', text: 'Camera timeout. Please try again or use manual entry.' });
          }
        }, 5000);
        
        // Wait for video metadata to load before marking as scanning
        videoRef.current.onloadedmetadata = () => {
          console.log('✅ Video metadata loaded event fired:', {
            videoWidth: videoRef.current.videoWidth,
            videoHeight: videoRef.current.videoHeight,
            readyState: videoRef.current.readyState,
            paused: videoRef.current.paused,
            duration: videoRef.current.duration
          });
          
          // Clear timeout since metadata loaded successfully
          if (metadataTimeoutRef.current) {
            clearTimeout(metadataTimeoutRef.current);
            metadataTimeoutRef.current = null;
          }
          
          setCameraLoading(false);
          setScanning(true);
          setMessage({ type: 'info', text: 'Camera active. Show QR code to scan...' });
          
          // Start scanning loop - increased frequency for better detection
          scanIntervalRef.current = setInterval(scanQRCode, 100); // was 300, now 100ms
          console.log('🔄 Scanning interval started (every 100ms)');
        };
        
        // Add more event listeners for debugging
        videoRef.current.onloadeddata = () => {
          console.log('📹 onloadeddata event fired - first frame loaded');
        };
        
        videoRef.current.oncanplay = () => {
          console.log('📹 oncanplay event fired - can start playing');
        };
        
        videoRef.current.oncanplaythrough = () => {
          console.log('📹 oncanplaythrough event fired - can play without buffering');
        };
        
        videoRef.current.onplay = () => {
          console.log('📹 onplay event fired - playback started');
        };
        
        videoRef.current.onerror = (e) => {
          console.error('❌ Video element error:', e);
          console.error('Video error details:', videoRef.current.error);
        };
        
        // some browsers need explicit play() after setting srcObject
        try {
          console.log('Calling video.play()...');
          const playPromise = videoRef.current.play();
          if (playPromise && playPromise.then) {
            playPromise.then(() => {
              console.log('✅ Video playback started successfully via promise');
            }).catch((err) => {
              console.error('❌ Video play() promise rejected:', err);
              console.error('Error name:', err.name);
              console.error('Error message:', err.message);
              setCameraLoading(false);
              if (metadataTimeoutRef.current) {
                clearTimeout(metadataTimeoutRef.current);
                metadataTimeoutRef.current = null;
              }
              setMessage({ type: 'error', text: 'Failed to start video playback. Try clicking the video area.' });
            });
          } else {
            console.log('✅ Video play() called (no promise returned)');
          }
        } catch (err) {
          console.error('❌ Error while trying to play video element:', err);
          setCameraLoading(false);
          if (metadataTimeoutRef.current) {
            clearTimeout(metadataTimeoutRef.current);
            metadataTimeoutRef.current = null;
          }
        }
      } else {
        console.error('❌ Video ref is null!');
      }
    } catch (error) {
      // store error for detailed UI and troubleshooting
      console.error('startCamera error', error);
      setCameraError(error);
      setCameraLoading(false);
      // Provide actionable messages depending on error type
      const name = error.name || '';
      let text = 'Failed to access camera. Please check permissions and that your device has a camera.';
      if (name === 'NotAllowedError' || name === 'SecurityError' || name === 'PermissionDeniedError') {
        text = 'Camera access was denied. Please allow camera permission in your browser settings and retry.';
      } else if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
        text = 'No camera device found. Ensure a camera is connected.';
      } else if (name === 'NotReadableError' || name === 'TrackStartError') {
        text = 'Unable to start camera. Another application may be using it.';
      } else if ((error.message || '').toLowerCase().includes('secure context')) {
        text = 'getUserMedia requires a secure context (HTTPS). Run the app over HTTPS or use localhost.';
      }

      setMessage({ type: 'error', text });
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (metadataTimeoutRef.current) {
      clearTimeout(metadataTimeoutRef.current);
      metadataTimeoutRef.current = null;
    }
    setScanning(false);
    setCameraLoading(false);
    setMessage(null);
    setCameraError(null);
  };

  // Attempt to re-request permission or advise user based on Permissions API
  const retryRequestPermission = async () => {
    // Try to query permission status when available
    try {
      if (navigator.permissions && navigator.permissions.query) {
        // some browsers support 'camera' name, but fallback to 'microphone' isn't ideal
        const p = await navigator.permissions.query({ name: 'camera' }).catch(() => null);
        if (p && p.state === 'denied') {
          setMessage({ type: 'error', text: 'Camera permission is denied. Please enable it from your browser settings then retry.' });
          return;
        }
      }
    } catch (err) {
      // ignore permission query errors
    }

    // Try starting camera again which will trigger browser permission prompt if applicable
    startCamera();
  };

  // Handle file upload fallback to scan QR from an image
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current || document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        try {
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code) {
            const rfidUid = code.data;
            setMessage({ type: 'success', text: `QR code detected from image: ${rfidUid}` });
            checkVehicleByRFID(rfidUid);
          } else {
            setMessage({ type: 'error', text: 'No QR code detected in the selected image.' });
          }
        } catch (err) {
          setMessage({ type: 'error', text: 'Failed to process the selected image.' });
        }
      };
      img.onerror = () => setMessage({ type: 'error', text: 'Unable to load the selected image.' });
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
    // clear input value to allow re-uploading same file if needed
    e.target.value = '';
  };

  // Scan QR code from video
  const scanQRCode = () => {
    if (!videoRef.current || !canvasRef.current || !scanning) {
      console.log('❌ Scan skipped - refs or scanning state missing:', {
        videoRef: !!videoRef.current,
        canvasRef: !!canvasRef.current,
        scanning
      });
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      // Force canvas to match video dimensions each time
      const width = video.videoWidth;
      const height = video.videoHeight;
      
      if (width === 0 || height === 0) {
        console.warn('⚠️ Video has zero dimensions:', width, 'x', height);
        return;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Clear canvas and draw current video frame
      context.clearRect(0, 0, width, height);
      context.drawImage(video, 0, 0, width, height);

      const imageData = context.getImageData(0, 0, width, height);
      
      // Log first scan attempt details
      if (Math.random() < 0.02) {
        console.log('🎥 Video frame captured:', {
          width,
          height,
          videoTime: video.currentTime,
          imageDataLength: imageData.data.length
        });
      }
      
      // Try scanning with inversionAttempts to handle different lighting
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "attemptBoth", // Try both normal and inverted
      });

      if (code) {
        // QR code detected!
        const rfidUid = code.data;
        console.log('✅ QR Code detected:', rfidUid);
        stopCamera();
        checkVehicleByRFID(rfidUid);
        return;
      }
      
      // Try scanning the horizontally flipped version for mirrored cameras
      context.clearRect(0, 0, width, height);
      context.save();
      context.scale(-1, 1);
      context.drawImage(video, -width, 0, width, height);
      context.restore();
      
      const flippedImageData = context.getImageData(0, 0, width, height);
      const flippedCode = jsQR(flippedImageData.data, flippedImageData.width, flippedImageData.height, {
        inversionAttempts: "attemptBoth",
      });
      
      if (flippedCode) {
        const rfidUid = flippedCode.data;
        console.log('✅ QR Code detected (from mirrored image):', rfidUid);
        stopCamera();
        checkVehicleByRFID(rfidUid);
        return;
      }
      
      // Log scanning status periodically
      if (Math.random() < 0.01) { // ~1% of the time
        console.log('🔍 Scanning... video:', width, 'x', height, 'readyState:', video.readyState, 'time:', video.currentTime.toFixed(2));
      }
    } else {
      // Log only once every 30 scans to avoid spam
      if (Math.random() < 0.03) {
        console.log('⏳ Waiting for video data... readyState:', video.readyState, 'expected:', video.HAVE_ENOUGH_DATA);
      }
    }
  };

  // Check vehicle by RFID UID
  const checkVehicleByRFID = async (rfidUid) => {
    setLoading(true);
    setMessage(null);
    
    try {
      // Get vehicle info by RFID UID
      const vehicleRes = await axios.get(`/api/vehicles/rfid/${rfidUid}`);
      setVehicleInfo(vehicleRes.data);

      // Check if vehicle is currently parked
      const statusRes = await axios.get(`/api/parking/check/${vehicleRes.data.plate_number}`);
      setParkingStatus(statusRes.data);

      setScannedData(rfidUid);
      setMessage({ type: 'success', text: `Vehicle found: ${vehicleRes.data.plate_number}` });
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'RFID tag not found in database' 
      });
      setVehicleInfo(null);
      setParkingStatus(null);
    } finally {
      setLoading(false);
    }
  };

  // Handle vehicle entry
  const handleEntry = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const response = await axios.post('/api/parking/entry', {
        plate_number: vehicleInfo.plate_number
      });

      setMessage({ 
        type: 'success', 
        text: `Vehicle parked successfully in slot ${response.data.record.slot_no}` 
      });

      // Refresh status
      await checkVehicleByRFID(scannedData);
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Failed to park vehicle' 
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle vehicle exit
  const handleExit = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const response = await axios.post('/api/parking/exit', {
        plate_number: vehicleInfo.plate_number
      });

      const payment = response.data.payment;

      // Safe formatter for payment amount (DB/driver may return string)
      const formatCurrency = (v) => {
        const n = Number(v);
        return Number.isFinite(n) ? n.toFixed(2) : '0.00';
      };

      if (payment && (payment.amount !== undefined && payment.amount !== null)) {
        const amountStr = formatCurrency(payment.amount);
        const duration = payment.duration_minutes ?? 'N/A';
        setMessage({
          type: 'success',
          text: `Vehicle exited. Payment: ₹${amountStr} (${duration} minutes)`
        });
      } else {
        // Payment not returned, but exit likely succeeded
        setMessage({ type: 'success', text: 'Vehicle exited successfully.' });
      }

      // Refresh status
      await checkVehicleByRFID(scannedData);
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Failed to exit vehicle' 
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle manual RFID entry
  const handleManualScan = (e) => {
    e.preventDefault();
    if (manualRFID.trim()) {
      checkVehicleByRFID(manualRFID.trim());
    }
  };

  // Reset scanner
  const resetScanner = () => {
    setScannedData(null);
    setVehicleInfo(null);
    setParkingStatus(null);
    setMessage(null);
    setManualRFID('');
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="qr-scanner-page fade-in">
      <div className="page-header">
        <h1>QR Code Scanner</h1>
        <p>Scan vehicle QR code for entry/exit</p>
      </div>

      <div className="scanner-container">
        {/* Camera Section */}
        <div className="card scanner-card">
          <h2>Camera Scanner</h2>
          
          <div className="camera-container">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline
              muted
              className="camera-video"
              style={{ display: scanning ? 'block' : 'none' }}
            />
            <canvas ref={canvasRef} style={{ display: debugMode ? 'block' : 'none', position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: '2px solid red', zIndex: 10 }} />
            
            {cameraLoading ? (
              <div className="camera-placeholder">
                <div className="spinner"></div>
                <p>Starting camera...</p>
              </div>
            ) : scanning ? (
              <div className="scan-overlay">
                <div className="scan-frame"></div>
                <div style={{
                  position: 'absolute',
                  bottom: '20px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'rgba(0,0,0,0.7)',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}>
                  🔍 Scanning for QR codes...
                </div>
                <button 
                  onClick={() => setDebugMode(!debugMode)}
                  style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: 'rgba(0,0,0,0.7)',
                    color: 'white',
                    border: 'none',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  {debugMode ? 'Hide' : 'Show'} Debug
                </button>
              </div>
            ) : (
              <div className="camera-placeholder">
                <Camera size={64} />
                <p>Camera not active</p>
              </div>
            )}
          </div>

          <div className="camera-controls">
            {!scanning && !cameraLoading ? (
              <button className="btn btn-primary" onClick={startCamera}>
                <Camera size={20} />
                Start Camera
              </button>
            ) : cameraLoading ? (
              <button className="btn btn-secondary" disabled>
                <Camera size={20} />
                Starting...
              </button>
            ) : (
              <button className="btn btn-danger" onClick={stopCamera}>
                <XCircle size={20} />
                Stop Camera
              </button>
            )}
          </div>

          {/* Camera error actions & file upload fallback */}
          {cameraError && (
            <div className="camera-error-actions">
              <p className="help-text">{cameraError.message || 'Camera error occurred.'}</p>
              <button className="btn btn-primary" onClick={retryRequestPermission}>
                Retry / Request Permission
              </button>
            </div>
          )}

          <div className="file-fallback">
            <p className="muted">Can't use camera? Upload an image of the QR code.</p>
            <input type="file" accept="image/*" onChange={handleFileUpload} />
          </div>

          {/* Manual Entry */}
          <div className="manual-entry">
            <h3>Or Enter RFID Manually</h3>
            <form onSubmit={handleManualScan}>
              <input
                type="text"
                className="input"
                placeholder="Enter RFID UID (e.g., RFID001)"
                value={manualRFID}
                onChange={(e) => setManualRFID(e.target.value)}
              />
              <button type="submit" className="btn btn-primary">
                Check Vehicle
              </button>
            </form>
          </div>
        </div>

        {/* Results Section */}
        {message && (
          <div className={`alert alert-${message.type}`}>
            {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            {message.text}
          </div>
        )}

        {loading && (
          <div className="spinner"></div>
        )}

        {vehicleInfo && (
          <div className="card vehicle-info-card fade-in">
            <h2>Vehicle Information</h2>
            
            <div className="info-grid">
              <div className="info-item">
                <Car size={20} />
                <div>
                  <label>Plate Number</label>
                  <p>{vehicleInfo.plate_number}</p>
                </div>
              </div>

              <div className="info-item">
                <Car size={20} />
                <div>
                  <label>Vehicle Type</label>
                  <p>{vehicleInfo.vehicle_type || 'N/A'}</p>
                </div>
              </div>

              <div className="info-item">
                <Car size={20} />
                <div>
                  <label>Color</label>
                  <p>{vehicleInfo.color || 'N/A'}</p>
                </div>
              </div>

              <div className="info-item">
                <Car size={20} />
                <div>
                  <label>Owner</label>
                  <p>{vehicleInfo.owner_name}</p>
                </div>
              </div>

              <div className="info-item">
                <Car size={20} />
                <div>
                  <label>RFID UID</label>
                  <p>{vehicleInfo.rfid_uid}</p>
                </div>
              </div>

              <div className="info-item">
                <Clock size={20} />
                <div>
                  <label>RFID Expiry</label>
                  <p className={new Date(vehicleInfo.expiry_date) < new Date() ? 'text-danger' : 'text-success'}>
                    {new Date(vehicleInfo.expiry_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Parking Status */}
            <div className="parking-status">
              <h3>Parking Status</h3>
              {parkingStatus?.isParked ? (
                <div className="status-parked">
                  <CheckCircle size={24} />
                  <div>
                    <p className="status-text">Currently Parked</p>
                    <p className="status-detail">
                      Slot: {parkingStatus.record.slot_no} | 
                      Entry: {new Date(parkingStatus.record.entrytime).toLocaleString()}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="status-available">
                  <XCircle size={24} />
                  <p className="status-text">Not Currently Parked</p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="action-buttons">
              {parkingStatus?.isParked ? (
                <button 
                  className="btn btn-danger" 
                  onClick={handleExit}
                  disabled={loading}
                >
                  <XCircle size={20} />
                  Exit Vehicle
                </button>
              ) : (
                <button 
                  className="btn btn-success" 
                  onClick={handleEntry}
                  disabled={loading}
                >
                  <CheckCircle size={20} />
                  Park Vehicle
                </button>
              )}
              
              <button 
                className="btn btn-secondary" 
                onClick={resetScanner}
              >
                Scan Another
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRScanner;
