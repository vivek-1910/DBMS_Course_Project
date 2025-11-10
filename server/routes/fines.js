const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get all fines
router.get('/', async (req, res) => {
  try {
    const [fines] = await db.query(`
      SELECT f.*, v.plate_number, o.name as owner_name
      FROM Fines f
      JOIN ParkingRecords pr ON f.record_id = pr.record_id
      JOIN Vehicle v ON pr.vehicle_id = v.vehicle_id
      JOIN Owner o ON v.owner_id = o.owner_id
      ORDER BY f.violation_date DESC
    `);
    
    // Get reasons for each fine
    for (let fine of fines) {
      const [reasons] = await db.query(
        'SELECT reason FROM FineReason WHERE fine_id = ?',
        [fine.fine_id]
      );
      fine.reasons = reasons.map(r => r.reason);
    }
    
    res.json(fines);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new fine
router.post('/', async (req, res) => {
  const { record_id, fine_amount, violation_date, reasons } = req.body;
  
  try {
    // Insert fine
    const [result] = await db.query(
      'INSERT INTO Fines (record_id, fine_amount, violation_date) VALUES (?, ?, ?)',
      [record_id, fine_amount, violation_date]
    );
    
    const fine_id = result.insertId;
    
    // Insert reasons
    if (reasons && reasons.length > 0) {
      for (const reason of reasons) {
        await db.query(
          'INSERT INTO FineReason (fine_id, reason) VALUES (?, ?)',
          [fine_id, reason]
        );
      }
    }
    
    res.status(201).json({ 
      fine_id,
      message: 'Fine created successfully' 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get fine statistics
router.get('/stats', async (req, res) => {
  try {
    const [stats] = await db.query(`
      SELECT 
        COUNT(*) as total_fines,
        SUM(fine_amount) as total_fine_amount,
        AVG(fine_amount) as average_fine
      FROM Fines
    `);
    res.json(stats[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
