const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get all payments
router.get('/', async (req, res) => {
  try {
    const [payments] = await db.query(`
      SELECT p.*, pr.entrytime, pr.exit_time, pr.duration_minutes,
             v.plate_number, o.name as owner_name
      FROM Payment p
      JOIN ParkingRecords pr ON p.record_id = pr.record_id
      JOIN Vehicle v ON pr.vehicle_id = v.vehicle_id
      JOIN Owner o ON v.owner_id = o.owner_id
      ORDER BY p.timestamp DESC
      LIMIT 100
    `);
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get payment by record ID
router.get('/record/:recordId', async (req, res) => {
  try {
    const [payments] = await db.query(`
      SELECT p.*, pr.entrytime, pr.exit_time, pr.duration_minutes,
             v.plate_number, ps.slot_no, ps.rate
      FROM Payment p
      JOIN ParkingRecords pr ON p.record_id = pr.record_id
      JOIN Vehicle v ON pr.vehicle_id = v.vehicle_id
      JOIN ParkingSlots ps ON pr.slot_id = ps.slot_id
      WHERE p.record_id = ?
    `, [req.params.recordId]);
    
    if (payments.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    
    res.json(payments[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get payment statistics
router.get('/stats', async (req, res) => {
  try {
    const [stats] = await db.query(`
      SELECT 
        COUNT(*) as total_payments,
        SUM(amount) as total_revenue,
        AVG(amount) as average_payment,
        SUM(CASE WHEN payment_method = 'cash' THEN 1 ELSE 0 END) as cash_payments,
        SUM(CASE WHEN payment_method = 'card' THEN 1 ELSE 0 END) as card_payments,
        SUM(CASE WHEN payment_method = 'upi' THEN 1 ELSE 0 END) as upi_payments,
        SUM(CASE WHEN payment_method = 'online' THEN 1 ELSE 0 END) as online_payments
      FROM Payment
    `);
    res.json(stats[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
