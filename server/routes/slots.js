const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get all parking slots
router.get('/', async (req, res) => {
  try {
    const [slots] = await db.query('SELECT * FROM ParkingSlots ORDER BY slot_no');
    res.json(slots);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get available slots
router.get('/available', async (req, res) => {
  try {
    const [slots] = await db.query(
      'SELECT * FROM ParkingSlots WHERE status = "available" ORDER BY slot_no'
    );
    res.json(slots);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get slot statistics
router.get('/stats', async (req, res) => {
  try {
    const [stats] = await db.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END) as available,
        SUM(CASE WHEN status = 'occupied' THEN 1 ELSE 0 END) as occupied,
        SUM(CASE WHEN status = 'out_of_service' THEN 1 ELSE 0 END) as out_of_service
      FROM ParkingSlots
    `);
    res.json(stats[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new slot
router.post('/', async (req, res) => {
  const { slot_no, slot_type, rate, status } = req.body;
  
  try {
    const [result] = await db.query(
      'INSERT INTO ParkingSlots (slot_no, slot_type, rate, status) VALUES (?, ?, ?, ?)',
      [slot_no, slot_type, rate, status || 'available']
    );
    
    res.status(201).json({ 
      slot_id: result.insertId,
      message: 'Parking slot created successfully' 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update slot
router.put('/:id', async (req, res) => {
  const { slot_no, slot_type, rate, status } = req.body;
  
  try {
    await db.query(
      'UPDATE ParkingSlots SET slot_no = ?, slot_type = ?, rate = ?, status = ? WHERE slot_id = ?',
      [slot_no, slot_type, rate, status, req.params.id]
    );
    
    res.json({ message: 'Parking slot updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete slot
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM ParkingSlots WHERE slot_id = ?', [req.params.id]);
    res.json({ message: 'Parking slot deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
