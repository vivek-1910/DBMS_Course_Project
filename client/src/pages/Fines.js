import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AlertCircle } from 'lucide-react';
import './Common.css';

const Fines = () => {
  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ plate_number: '', fine_amount: '', violation_date: '', reasons: '' });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    fetchFines();
  }, []);

  const fetchFines = async () => {
    try {
      const response = await axios.get('/api/fines');
      setFines(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch fines:', error);
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    setForm({ plate_number: '', fine_amount: '', violation_date: '', reasons: '' });
    setFormError(null);
    setShowAdd(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // Submit manual fine: resolve record_id by plate (active parked or latest history)
  const submitFine = async (e) => {
    e.preventDefault();
    setFormError(null);
    const { plate_number, fine_amount, violation_date, reasons } = form;

    if (!plate_number || !fine_amount) {
      setFormError('Plate number and fine amount are required');
      return;
    }

    setSubmitting(true);
    try {
      // First check if vehicle is currently parked to get active record
      const checkRes = await axios.get(`/api/parking/check/${encodeURIComponent(plate_number)}`);
      let recordId = null;
      if (checkRes.data?.isParked) {
        recordId = checkRes.data.record.record_id;
      } else {
        // If not parked, fallback to latest parking history
        const histRes = await axios.get(`/api/parking/history/${encodeURIComponent(plate_number)}`);
        if (Array.isArray(histRes.data) && histRes.data.length > 0) {
          recordId = histRes.data[0].record_id;
        }
      }

      if (!recordId) {
        setFormError('No parking record found for this plate. Please ensure the vehicle has at least one parking record before adding a fine.');
        setSubmitting(false);
        return;
      }

      const payload = {
        record_id: recordId,
        fine_amount: Number(fine_amount),
        violation_date: violation_date || new Date().toISOString().split('T')[0],
        reasons: reasons ? reasons.split(',').map(r => r.trim()).filter(Boolean) : []
      };

      await axios.post('/api/fines', payload);
      setShowAdd(false);
      fetchFines();
    } catch (err) {
      console.error('Failed to submit fine:', err);
      setFormError(err.response?.data?.error || 'Failed to submit fine');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="spinner"></div>;

  return (
    <div className="page fade-in">
      <div className="page-header">
        <div>
          <h1>Fines</h1>
          <p>View parking violations and fines</p>
        </div>
        <div>
          <button className="btn btn-primary" onClick={handleAddClick}>Add Fine</button>
        </div>
      </div>

      <div className="card">
        {showAdd && (
          <div className="card" style={{ padding: 16, marginBottom: 16 }}>
            <h3>Add Fine (Manual)</h3>
            {formError && <div className="alert alert-danger">{formError}</div>}
            <form onSubmit={submitFine} style={{ display: 'grid', gap: 8 }}>
              <label>
                Plate Number
                <input name="plate_number" value={form.plate_number} onChange={handleFormChange} className="input" />
              </label>
              <label>
                Fine Amount (₹)
                <input name="fine_amount" value={form.fine_amount} onChange={handleFormChange} className="input" type="number" step="0.01" />
              </label>
              <label>
                Violation Date
                <input name="violation_date" value={form.violation_date} onChange={handleFormChange} className="input" type="date" />
              </label>
              <label>
                Reasons (comma separated)
                <input name="reasons" value={form.reasons} onChange={handleFormChange} className="input" placeholder="e.g., No parking permit, Overstaying" />
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="submit" className="btn btn-success" disabled={submitting}>{submitting ? 'Adding...' : 'Add Fine'}</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAdd(false)} disabled={submitting}>Cancel</button>
              </div>
            </form>
          </div>
        )}
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Fine ID</th>
                <th>Plate Number</th>
                <th>Owner</th>
                <th>Amount</th>
                <th>Violation Date</th>
                <th>Reasons</th>
              </tr>
            </thead>
            <tbody>
              {fines.map((fine) => (
                <tr key={fine.fine_id}>
                  <td>{fine.fine_id}</td>
                  <td><strong>{fine.plate_number}</strong></td>
                  <td>{fine.owner_name}</td>
                  <td><strong className="text-danger">₹{fine.fine_amount}</strong></td>
                  <td>{new Date(fine.violation_date).toLocaleDateString()}</td>
                  <td>
                    {fine.reasons && fine.reasons.length > 0 ? (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {fine.reasons.map((reason, idx) => (
                          <span key={idx} className="badge badge-warning">
                            {reason}
                          </span>
                        ))}
                      </div>
                    ) : 'N/A'}
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

export default Fines;
