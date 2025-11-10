import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DollarSign } from 'lucide-react';
import './Common.css';

// Format duration in a human-readable way
const formatDuration = (minutes) => {
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

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await axios.get('/api/payments');
      setPayments(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch payments:', error);
      setLoading(false);
    }
  };

  if (loading) return <div className="spinner"></div>;

  return (
    <div className="page fade-in">
      <div className="page-header">
        <div>
          <h1>Payments</h1>
          <p>View payment history</p>
        </div>
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Payment ID</th>
                <th>Plate Number</th>
                <th>Owner</th>
                <th>Duration</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.payment_id}>
                  <td>{payment.payment_id}</td>
                  <td><strong>{payment.plate_number}</strong></td>
                  <td>{payment.owner_name}</td>
                  <td>{formatDuration(payment.duration_minutes)}</td>
                  <td><strong>₹{payment.amount}</strong></td>
                  <td>
                    <span className="badge badge-info">
                      {payment.payment_method}
                    </span>
                  </td>
                  <td>{new Date(payment.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Payments;
