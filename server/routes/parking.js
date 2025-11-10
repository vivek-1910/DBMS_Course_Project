const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get all parking records
router.get('/', async (req, res) => {
  try {
    const [records] = await db.query(`
      SELECT pr.*, v.plate_number, v.vehicle_type, v.color,
             ps.slot_no, ps.slot_type, ps.rate,
             o.name as owner_name,
             TIMESTAMPDIFF(MINUTE, pr.entrytime, COALESCE(pr.exit_time, NOW())) as current_duration
      FROM ParkingRecords pr
      JOIN Vehicle v ON pr.vehicle_id = v.vehicle_id
      JOIN ParkingSlots ps ON pr.slot_id = ps.slot_id
      JOIN Owner o ON v.owner_id = o.owner_id
      ORDER BY pr.entrytime DESC
      LIMIT 100
    `);
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get active parking records (not exited yet)
router.get('/active', async (req, res) => {
  try {
    const [records] = await db.query(`
      SELECT pr.*, v.plate_number, v.vehicle_type, v.color,
             ps.slot_no, ps.slot_type, ps.rate,
             o.name as owner_name,
             TIMESTAMPDIFF(MINUTE, pr.entrytime, NOW()) as current_duration
      FROM ParkingRecords pr
      JOIN Vehicle v ON pr.vehicle_id = v.vehicle_id
      JOIN ParkingSlots ps ON pr.slot_id = ps.slot_id
      JOIN Owner o ON v.owner_id = o.owner_id
      WHERE pr.exit_time IS NULL
      ORDER BY pr.entrytime DESC
    `);
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Check if vehicle is currently parked
router.get('/check/:plateNumber', async (req, res) => {
  try {
    const [records] = await db.query(`
      SELECT pr.*, ps.slot_no, ps.slot_type
      FROM ParkingRecords pr
      JOIN Vehicle v ON pr.vehicle_id = v.vehicle_id
      JOIN ParkingSlots ps ON pr.slot_id = ps.slot_id
      WHERE v.plate_number = ? AND pr.exit_time IS NULL
    `, [req.params.plateNumber]);
    
    res.json({ 
      isParked: records.length > 0,
      record: records.length > 0 ? records[0] : null
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Vehicle entry (park)
router.post('/entry', async (req, res) => {
  const { plate_number } = req.body;
  
  try {
    // Get vehicle info and check RFID expiry
    const [vehicles] = await db.query(`
      SELECT v.vehicle_id, r.expiry_date
      FROM Vehicle v
      LEFT JOIN RFIDTags r ON v.vehicle_id = r.vehicle_id
      WHERE v.plate_number = ?
    `, [plate_number]);
    
    if (vehicles.length === 0) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    
    const vehicle = vehicles[0];
    
    // Check if RFID exists and is not expired
    if (!vehicle.expiry_date) {
      return res.status(400).json({ error: 'No RFID tag found for this vehicle' });
    }
    
    if (new Date(vehicle.expiry_date) < new Date()) {
      return res.status(400).json({ error: 'RFID tag has expired — cannot allow parking' });
    }
    
    // Check if vehicle is already parked
    const [existing] = await db.query(`
      SELECT record_id FROM ParkingRecords 
      WHERE vehicle_id = ? AND exit_time IS NULL
    `, [vehicle.vehicle_id]);
    
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Vehicle is already parked' });
    }
    
    // Find available slot
    const [slots] = await db.query(`
      SELECT slot_id FROM ParkingSlots 
      WHERE status = 'available' 
      LIMIT 1
    `);
    
    if (slots.length === 0) {
      return res.status(400).json({ error: 'No available parking slots' });
    }
    
    const slot_id = slots[0].slot_id;
    
    // Create parking record
    const [result] = await db.query(
      'INSERT INTO ParkingRecords (slot_id, vehicle_id, entrytime) VALUES (?, ?, NOW())',
      [slot_id, vehicle.vehicle_id]
    );
    
    // Update slot status
    await db.query(
      'UPDATE ParkingSlots SET status = "occupied" WHERE slot_id = ?',
      [slot_id]
    );
    
    // Get full record details
    const [record] = await db.query(`
      SELECT pr.*, ps.slot_no, ps.slot_type, v.plate_number
      FROM ParkingRecords pr
      JOIN ParkingSlots ps ON pr.slot_id = ps.slot_id
      JOIN Vehicle v ON pr.vehicle_id = v.vehicle_id
      WHERE pr.record_id = ?
    `, [result.insertId]);
    
    res.status(201).json({ 
      message: 'Vehicle parked successfully',
      record: record[0]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Vehicle exit
router.post('/exit', async (req, res) => {
  const { plate_number } = req.body;
  
  try {
    // Find active parking record
    const [records] = await db.query(`
      SELECT pr.record_id, pr.slot_id, pr.vehicle_id
      FROM ParkingRecords pr
      JOIN Vehicle v ON pr.vehicle_id = v.vehicle_id
      WHERE v.plate_number = ? AND pr.exit_time IS NULL
    `, [plate_number]);
    
    if (records.length === 0) {
      return res.status(404).json({ error: 'No active parking record found' });
    }
    
    const record = records[0];
    
    // Update exit time
    await db.query(
      'UPDATE ParkingRecords SET exit_time = NOW() WHERE record_id = ?',
      [record.record_id]
    );
    
    // Update slot status
    await db.query(
      'UPDATE ParkingSlots SET status = "available" WHERE slot_id = ?',
      [record.slot_id]
    );
    
    // Calculate payment using stored procedure
    await db.query('CALL calc_payment(?)', [record.record_id]);
    
    // Get payment details
    const [payment] = await db.query(`
      SELECT p.*, pr.duration_minutes, ps.rate
      FROM Payment p
      JOIN ParkingRecords pr ON p.record_id = pr.record_id
      JOIN ParkingSlots ps ON pr.slot_id = ps.slot_id
      WHERE p.record_id = ?
    `, [record.record_id]);
    
    res.json({ 
      message: 'Vehicle exited successfully',
      payment: payment[0]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get parking history for a vehicle
router.get('/history/:plateNumber', async (req, res) => {
  try {
    const [records] = await db.query(`
      SELECT pr.*, ps.slot_no, ps.rate,
             p.amount as payment_amount, p.payment_method
      FROM ParkingRecords pr
      JOIN Vehicle v ON pr.vehicle_id = v.vehicle_id
      JOIN ParkingSlots ps ON pr.slot_id = ps.slot_id
      LEFT JOIN Payment p ON pr.record_id = p.record_id
      WHERE v.plate_number = ?
      ORDER BY pr.entrytime DESC
    `, [req.params.plateNumber]);
    
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
