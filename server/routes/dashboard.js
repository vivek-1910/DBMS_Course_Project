const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    // Get slot statistics
    const [slotStats] = await db.query(`
      SELECT 
        COUNT(*) as total_slots,
        SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END) as available_slots,
        SUM(CASE WHEN status = 'occupied' THEN 1 ELSE 0 END) as occupied_slots
      FROM ParkingSlots
    `);
    
    // Get active parking count
    const [activeParking] = await db.query(`
      SELECT COUNT(*) as active_vehicles
      FROM ParkingRecords
      WHERE exit_time IS NULL
    `);
    
    // Get today's revenue
    const [todayRevenue] = await db.query(`
      SELECT COALESCE(SUM(amount), 0) as today_revenue
      FROM Payment
      WHERE DATE(timestamp) = CURDATE()
    `);
    
    // Get total vehicles
    const [vehicleCount] = await db.query(`
      SELECT COUNT(*) as total_vehicles FROM Vehicle
    `);
    
    // Get total owners
    const [ownerCount] = await db.query(`
      SELECT COUNT(*) as total_owners FROM Owner
    `);
    
    // Get recent activities
    const [recentActivities] = await db.query(`
      SELECT 
        pr.record_id,
        pr.entrytime,
        pr.exit_time,
        v.plate_number,
        v.vehicle_type,
        ps.slot_no,
        o.name as owner_name
      FROM ParkingRecords pr
      JOIN Vehicle v ON pr.vehicle_id = v.vehicle_id
      JOIN ParkingSlots ps ON pr.slot_id = ps.slot_id
      JOIN Owner o ON v.owner_id = o.owner_id
      ORDER BY pr.entrytime DESC
      LIMIT 10
    `);
    
    res.json({
      slots: slotStats[0],
      activeVehicles: activeParking[0].active_vehicles,
      todayRevenue: todayRevenue[0].today_revenue,
      totalVehicles: vehicleCount[0].total_vehicles,
      totalOwners: ownerCount[0].total_owners,
      recentActivities
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get revenue by date range
router.get('/revenue', async (req, res) => {
  const { startDate, endDate } = req.query;
  
  try {
    const [revenue] = await db.query(`
      SELECT 
        DATE(timestamp) as date,
        SUM(amount) as daily_revenue,
        COUNT(*) as transactions
      FROM Payment
      WHERE DATE(timestamp) BETWEEN ? AND ?
      GROUP BY DATE(timestamp)
      ORDER BY date
    `, [startDate || '2024-01-01', endDate || new Date().toISOString().split('T')[0]]);
    
    res.json(revenue);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
