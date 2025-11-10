import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Car, 
  ParkingCircle, 
  DollarSign, 
  Users, 
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
    const interval = setInterval(fetchDashboardStats, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await axios.get('/api/dashboard/stats');
      setStats(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="spinner"></div>;
  }

  // compute numeric occupancy rate (keep as number, format when displaying)
  const occupancyRate = stats?.slots?.total_slots > 0
    ? ((stats.slots.occupied_slots / stats.slots.total_slots) * 100)
    : 0;

  // Safe currency formatter: coercse to number, return fixed 2-decimal string or fallback
  const formatCurrency = (value) => {
    // handle null/undefined/objects/strings
    const n = Number(value);
    return Number.isFinite(n) ? n.toFixed(2) : '0.00';
  };

  return (
    <div className="dashboard-page fade-in">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Real-time parking management overview</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <ParkingCircle size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Total Slots</p>
            <h2 className="stat-value">{stats?.slots?.total_slots || 0}</h2>
            <p className="stat-detail">
              <span className="text-success">{stats?.slots?.available_slots || 0} Available</span>
              {' • '}
              <span className="text-danger">{stats?.slots?.occupied_slots || 0} Occupied</span>
            </p>
          </div>
        </div>

        <div className="stat-card card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' }}>
            <Car size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Active Vehicles</p>
            <h2 className="stat-value">{stats?.activeVehicles || 0}</h2>
            <p className="stat-detail">Currently parked</p>
          </div>
        </div>

        <div className="stat-card card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
            <DollarSign size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Today's Revenue</p>
            <h2 className="stat-value">₹{formatCurrency(stats?.todayRevenue)}</h2>
            <p className="stat-detail">From parking fees</p>
          </div>
        </div>

        <div className="stat-card card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }}>
            <Users size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Total Owners</p>
            <h2 className="stat-value">{stats?.totalOwners || 0}</h2>
            <p className="stat-detail">{stats?.totalVehicles || 0} Vehicles registered</p>
          </div>
        </div>
      </div>

      {/* Occupancy Chart */}
      <div className="card occupancy-card">
        <h2>Parking Occupancy</h2>
        <div className="occupancy-visual">
          <div className="occupancy-circle">
            <svg viewBox="0 0 200 200">
              <circle
                cx="100"
                cy="100"
                r="80"
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="20"
              />
              <circle
                cx="100"
                cy="100"
                r="80"
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="20"
                strokeDasharray={`${(occupancyRate / 100) * 502.65} 502.65`}
                strokeLinecap="round"
                transform="rotate(-90 100 100)"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#667eea" />
                  <stop offset="100%" stopColor="#764ba2" />
                </linearGradient>
              </defs>
            </svg>
            <div className="occupancy-text">
              <h3>{occupancyRate.toFixed(1)}%</h3>
              <p>Occupied</p>
            </div>
          </div>
          <div className="occupancy-details">
            <div className="occupancy-item">
              <CheckCircle size={20} color="#38a169" />
              <div>
                <p className="occupancy-label">Available</p>
                <p className="occupancy-value">{stats?.slots?.available_slots || 0} slots</p>
              </div>
            </div>
            <div className="occupancy-item">
              <XCircle size={20} color="#e53e3e" />
              <div>
                <p className="occupancy-label">Occupied</p>
                <p className="occupancy-value">{stats?.slots?.occupied_slots || 0} slots</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="card activities-card">
        <h2>Recent Activities</h2>
        <div className="activities-list">
          {stats?.recentActivities && stats.recentActivities.length > 0 ? (
            stats.recentActivities.map((activity) => (
              <div key={activity.record_id} className="activity-item">
                <div className="activity-icon">
                  <Car size={20} />
                </div>
                <div className="activity-content">
                  <p className="activity-title">
                    <strong>{activity.plate_number}</strong> - {activity.vehicle_type}
                  </p>
                  <p className="activity-detail">
                    Owner: {activity.owner_name} | Slot: {activity.slot_no}
                  </p>
                </div>
                <div className="activity-time">
                  <Clock size={16} />
                  <span>{new Date(activity.entrytime).toLocaleString()}</span>
                </div>
                <div className="activity-status">
                  {activity.exit_time ? (
                    <span className="badge badge-success">Exited</span>
                  ) : (
                    <span className="badge badge-warning">Parked</span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="no-data">No recent activities</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
