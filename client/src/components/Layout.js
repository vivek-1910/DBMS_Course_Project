import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  QrCode, 
  Car, 
  ParkingCircle, 
  Users, 
  CreditCard, 
  AlertCircle,
  Menu,
  X
} from 'lucide-react';
import './Layout.css';

const Layout = ({ children }) => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/scanner', icon: QrCode, label: 'QR Scanner' },
    { path: '/vehicles', icon: Car, label: 'Vehicles' },
    { path: '/parking', icon: ParkingCircle, label: 'Parking Records' },
    { path: '/owners', icon: Users, label: 'Owners' },
    { path: '/slots', icon: ParkingCircle, label: 'Parking Slots' },
    { path: '/payments', icon: CreditCard, label: 'Payments' },
    { path: '/fines', icon: AlertCircle, label: 'Fines' },
  ];

  return (
    <div className="layout">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <div className="logo">
            <ParkingCircle size={32} />
            {sidebarOpen && <span>ParkSmart</span>}
          </div>
          <button 
            className="toggle-btn" 
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon size={20} />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className={`main-content ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <div className="content-wrapper">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
