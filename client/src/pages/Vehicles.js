import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Car, Plus, Download, QrCode } from 'lucide-react';
import QRCode from 'qrcode.react';
import './Common.css';

const Vehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState(null);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const response = await axios.get('/api/vehicles');
      setVehicles(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch vehicles:', error);
      setLoading(false);
    }
  };

  const downloadQR = (rfidUid, plateNumber) => {
    const canvas = document.getElementById(`qr-${rfidUid}`);
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = url;
    link.download = `QR_${plateNumber}_${rfidUid}.png`;
    link.click();
  };

  if (loading) return <div className="spinner"></div>;

  return (
    <div className="page fade-in">
      <div className="page-header">
        <div>
          <h1>Vehicles</h1>
          <p>Manage registered vehicles</p>
        </div>
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Plate Number</th>
                <th>Type</th>
                <th>Color</th>
                <th>Owner</th>
                <th>RFID Expiry</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((vehicle) => (
                <tr key={vehicle.vehicle_id}>
                  <td><strong>{vehicle.plate_number}</strong></td>
                  <td>{vehicle.vehicle_type || 'N/A'}</td>
                  <td>{vehicle.color || 'N/A'}</td>
                  <td>{vehicle.owner_name}</td>
                  <td>
                    <span className={`badge ${new Date(vehicle.expiry_date) < new Date() ? 'badge-danger' : 'badge-success'}`}>
                      {new Date(vehicle.expiry_date).toLocaleDateString()}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={() => setShowQR(vehicle)}
                      disabled={!vehicle.rfid_uid}
                    >
                      <QrCode size={16} />
                      {vehicle.rfid_uid ? 'QR Code' : 'No RFID'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQR && (
        <div className="modal-overlay" onClick={() => setShowQR(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">QR Code - {showQR.plate_number}</h2>
              <button className="close-btn" onClick={() => setShowQR(null)}>×</button>
            </div>
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <QRCode 
                id={`qr-${showQR.rfid_uid}`}
                value={showQR.rfid_uid} 
                size={256}
                level="H"
                includeMargin={true}
              />
              <p style={{ marginTop: '20px', color: '#718096', fontSize: '14px' }}>
                <strong>RFID UID:</strong> {showQR.rfid_uid}
              </p>
              <p style={{ marginTop: '8px', color: '#718096', fontSize: '12px' }}>
                Scan this QR code at entry/exit gates
              </p>
              <button 
                className="btn btn-primary"
                onClick={() => downloadQR(showQR.rfid_uid, showQR.plate_number)}
                style={{ marginTop: '20px' }}
              >
                <Download size={16} />
                Download QR Code
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Vehicles;
