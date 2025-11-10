import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Clock } from 'lucide-react';
import './Common.css';

// Format duration in a human-readable way
const formatDuration = (minutes) => {
  if (!minutes) return '-';
  if (minutes < 1) {
    const seconds = Math.round(minutes * 60);
    return `${seconds} sec`;
  } else if (minutes < 60) {
    const mins = Math.floor(minutes);
    const secs = Math.round((minutes - mins) * 60);
    if (secs > 0) {
      return `${mins}m ${secs}s`;
    }
    return `${mins} min`;
  } else {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    if (mins > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${hours} hr`;
  }
};

const ParkingRecords = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchRecords();
  }, [filter]);

  const fetchRecords = async () => {
    try {
      const endpoint = filter === 'active' ? '/api/parking/active' : '/api/parking';
      const response = await axios.get(endpoint);
      setRecords(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch records:', error);
      setLoading(false);
    }
  };

  if (loading) return <div className="spinner"></div>;

  return (
    <div className="page fade-in">
      <div className="page-header">
        <div>
          <h1>Parking Records</h1>
          <p>View all parking sessions</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter('all')}
          >
            All Records
          </button>
          <button 
            className={`btn ${filter === 'active' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter('active')}
          >
            Active Only
          </button>
        </div>
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Plate Number</th>
                <th>Owner</th>
                <th>Slot</th>
                <th>Entry Time</th>
                <th>Exit Time</th>
                <th>Duration</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record.record_id}>
                  <td><strong>{record.plate_number}</strong></td>
                  <td>{record.owner_name}</td>
                  <td>{record.slot_no}</td>
                  <td>{new Date(record.entrytime).toLocaleString()}</td>
                  <td>{record.exit_time ? new Date(record.exit_time).toLocaleString() : '-'}</td>
                  <td>{formatDuration(record.duration_minutes || record.current_duration)}</td>
                  <td>
                    {record.exit_time ? (
                      <span className="badge badge-success">Completed</span>
                    ) : (
                      <span className="badge badge-warning">Active</span>
                    )}
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

export default ParkingRecords;
