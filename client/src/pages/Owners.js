import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users } from 'lucide-react';
import './Common.css';

const Owners = () => {
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOwners();
  }, []);

  const fetchOwners = async () => {
    try {
      const response = await axios.get('/api/owners');
      setOwners(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch owners:', error);
      setLoading(false);
    }
  };

  if (loading) return <div className="spinner"></div>;

  return (
    <div className="page fade-in">
      <div className="page-header">
        <div>
          <h1>Vehicle Owners</h1>
          <p>Manage registered owners</p>
        </div>
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              {owners.map((owner) => (
                <tr key={owner.owner_id}>
                  <td>{owner.owner_id}</td>
                  <td><strong>{owner.name}</strong></td>
                  <td>{owner.email || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Owners;
