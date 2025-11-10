import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ParkingCircle, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import './Common.css';

const Slots = () => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSlots();
  }, []);

  const fetchSlots = async () => {
    try {
      const response = await axios.get('/api/slots');
      setSlots(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch slots:', error);
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'available':
        return <CheckCircle size={20} color="#38a169" />;
      case 'occupied':
        return <XCircle size={20} color="#e53e3e" />;
      case 'out_of_service':
        return <AlertCircle size={20} color="#d69e2e" />;
      default:
        return null;
    }
  };

  if (loading) return <div className="spinner"></div>;

  return (
    <div className="page fade-in">
      <div className="page-header">
        <div>
          <h1>Parking Slots</h1>
          <p>Manage parking slot availability</p>
        </div>
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Slot No</th>
                <th>Type</th>
                <th>Rate (₹/hr)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {slots.map((slot) => (
                <tr key={slot.slot_id}>
                  <td><strong>{slot.slot_no}</strong></td>
                  <td>{slot.slot_type || 'Regular'}</td>
                  <td>₹{slot.rate}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {getStatusIcon(slot.status)}
                      <span className={`badge badge-${
                        slot.status === 'available' ? 'success' : 
                        slot.status === 'occupied' ? 'danger' : 'warning'
                      }`}>
                        {slot.status}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Slots;
