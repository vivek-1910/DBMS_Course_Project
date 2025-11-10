const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get all owners
router.get('/', async (req, res) => {
  try {
    const [owners] = await db.query('SELECT * FROM Owner ORDER BY owner_id DESC');
    res.json(owners);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get owner by ID with all details
router.get('/:id', async (req, res) => {
  try {
    const [owners] = await db.query('SELECT * FROM Owner WHERE owner_id = ?', [req.params.id]);
    
    if (owners.length === 0) {
      return res.status(404).json({ error: 'Owner not found' });
    }
    
    // Get addresses
    const [addresses] = await db.query('SELECT * FROM OwnerAddress WHERE owner_id = ?', [req.params.id]);
    
    // Get phones
    const [phones] = await db.query('SELECT phone FROM OwnerPhone WHERE owner_id = ?', [req.params.id]);
    
    // Get vehicles
    const [vehicles] = await db.query('SELECT * FROM Vehicle WHERE owner_id = ?', [req.params.id]);
    
    res.json({
      ...owners[0],
      addresses,
      phones: phones.map(p => p.phone),
      vehicles
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new owner
router.post('/', async (req, res) => {
  const { name, email, addresses, phones } = req.body;
  
  try {
    // Insert owner
    const [result] = await db.query(
      'INSERT INTO Owner (name, email) VALUES (?, ?)',
      [name, email]
    );
    
    const owner_id = result.insertId;
    
    // Insert addresses if provided
    if (addresses && addresses.length > 0) {
      for (const addr of addresses) {
        await db.query(
          'INSERT INTO OwnerAddress (owner_id, address_line, city, state, postal_code, country) VALUES (?, ?, ?, ?, ?, ?)',
          [owner_id, addr.address_line, addr.city, addr.state, addr.postal_code, addr.country]
        );
      }
    }
    
    // Insert phones if provided
    if (phones && phones.length > 0) {
      for (const phone of phones) {
        await db.query(
          'INSERT INTO OwnerPhone (owner_id, phone) VALUES (?, ?)',
          [owner_id, phone]
        );
      }
    }
    
    res.status(201).json({ 
      owner_id,
      message: 'Owner created successfully' 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update owner
router.put('/:id', async (req, res) => {
  const { name, email } = req.body;
  
  try {
    await db.query(
      'UPDATE Owner SET name = ?, email = ? WHERE owner_id = ?',
      [name, email, req.params.id]
    );
    
    res.json({ message: 'Owner updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete owner
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM Owner WHERE owner_id = ?', [req.params.id]);
    res.json({ message: 'Owner deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
