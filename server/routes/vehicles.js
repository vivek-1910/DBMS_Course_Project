const express = require('express');
const router = express.Router();
const db = require('../config/database');
const QRCode = require('qrcode');

// Get all vehicles
router.get('/', async (req, res) => {
  try {
    const [vehicles] = await db.query(`
      SELECT v.*, o.name as owner_name, o.email as owner_email,
             r.uid as rfid_uid, r.expiry_date
      FROM Vehicle v
      LEFT JOIN Owner o ON v.owner_id = o.owner_id
      LEFT JOIN RFIDTags r ON v.vehicle_id = r.vehicle_id
      ORDER BY v.vehicle_id DESC
    `);
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get vehicle by ID
router.get('/:id', async (req, res) => {
  try {
    const [vehicles] = await db.query(`
      SELECT v.*, o.name as owner_name, o.email as owner_email,
             r.uid as rfid_uid, r.expiry_date, r.issue_date
      FROM Vehicle v
      LEFT JOIN Owner o ON v.owner_id = o.owner_id
      LEFT JOIN RFIDTags r ON v.vehicle_id = r.vehicle_id
      WHERE v.vehicle_id = ?
    `, [req.params.id]);
    
    if (vehicles.length === 0) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    
    res.json(vehicles[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get vehicle by plate number (for QR scan)
router.get('/plate/:plateNumber', async (req, res) => {
  try {
    const [vehicles] = await db.query(`
      SELECT v.*, o.name as owner_name, o.email as owner_email,
             r.uid as rfid_uid, r.expiry_date, r.issue_date, r.tag_id
      FROM Vehicle v
      LEFT JOIN Owner o ON v.owner_id = o.owner_id
      LEFT JOIN RFIDTags r ON v.vehicle_id = r.vehicle_id
      WHERE v.plate_number = ?
    `, [req.params.plateNumber]);
    
    if (vehicles.length === 0) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    
    res.json(vehicles[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get vehicle by RFID UID (for QR code scanning)
router.get('/rfid/:uid', async (req, res) => {
  try {
    const [vehicles] = await db.query(`
      SELECT v.*, o.name as owner_name, o.email as owner_email,
             r.uid as rfid_uid, r.expiry_date, r.issue_date, r.tag_id
      FROM RFIDTags r
      JOIN Vehicle v ON r.vehicle_id = v.vehicle_id
      JOIN Owner o ON v.owner_id = o.owner_id
      WHERE r.uid = ?
    `, [req.params.uid]);
    
    if (vehicles.length === 0) {
      return res.status(404).json({ error: 'RFID tag not found' });
    }
    
    res.json(vehicles[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new vehicle
router.post('/', async (req, res) => {
  const { plate_number, vehicle_type, color, owner_id } = req.body;
  
  try {
    const [result] = await db.query(
      'INSERT INTO Vehicle (plate_number, vehicle_type, color, owner_id) VALUES (?, ?, ?, ?)',
      [plate_number, vehicle_type, color, owner_id]
    );
    
    res.status(201).json({ 
      vehicle_id: result.insertId,
      message: 'Vehicle created successfully' 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate QR code for vehicle
router.get('/:id/qrcode', async (req, res) => {
  try {
    const [vehicles] = await db.query(
      'SELECT plate_number FROM Vehicle WHERE vehicle_id = ?',
      [req.params.id]
    );
    
    if (vehicles.length === 0) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    
    // Generate QR code with plate number
    const qrCode = await QRCode.toDataURL(vehicles[0].plate_number);
    res.json({ qrCode, plate_number: vehicles[0].plate_number });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update vehicle
router.put('/:id', async (req, res) => {
  const { plate_number, vehicle_type, color } = req.body;
  
  try {
    await db.query(
      'UPDATE Vehicle SET plate_number = ?, vehicle_type = ?, color = ? WHERE vehicle_id = ?',
      [plate_number, vehicle_type, color, req.params.id]
    );
    
    res.json({ message: 'Vehicle updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete vehicle
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM Vehicle WHERE vehicle_id = ?', [req.params.id]);
    res.json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
