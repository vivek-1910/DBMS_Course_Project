import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import QRScanner from './pages/QRScanner';
import Vehicles from './pages/Vehicles';
import ParkingRecords from './pages/ParkingRecords';
import Owners from './pages/Owners';
import Slots from './pages/Slots';
import Payments from './pages/Payments';
import Fines from './pages/Fines';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/scanner" element={<QRScanner />} />
          <Route path="/vehicles" element={<Vehicles />} />
          <Route path="/parking" element={<ParkingRecords />} />
          <Route path="/owners" element={<Owners />} />
          <Route path="/slots" element={<Slots />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/fines" element={<Fines />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
