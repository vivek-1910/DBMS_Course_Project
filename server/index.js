const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Import routes
const ownerRoutes = require('./routes/owners');
const vehicleRoutes = require('./routes/vehicles');
const parkingRoutes = require('./routes/parking');
const slotRoutes = require('./routes/slots');
const paymentRoutes = require('./routes/payments');
const fineRoutes = require('./routes/fines');
const dashboardRoutes = require('./routes/dashboard');

// Use routes
app.use('/api/owners', ownerRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/parking', parkingRoutes);
app.use('/api/slots', slotRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/fines', fineRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
