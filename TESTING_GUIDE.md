# 🧪 Complete Testing Guide

## Setup Commands

### 1. Add Test Data & Update Payment Logic
```bash
./COMPLETE_SETUP.sh
```
(Enter your MySQL password when prompted)

### 2. Update .env File
Make sure your `.env` has:
```env
DB_PASSWORD=your_mysql_password
PORT=5001
```

### 3. Start Backend
```bash
lsof -ti:5001 | xargs kill -9 2>/dev/null
PORT=5001 node server/index.js &
```

### 4. Verify Backend Works
```bash
curl http://localhost:5001/api/vehicles/rfid/RFID001
```
Should return vehicle JSON data.

---

## Test Scenarios

### ✅ Scenario 1: Valid RFID - Successful Entry/Exit

**RFID to use:** `RFID001`

1. Go to: http://localhost:3000/scanner
2. Enter: `RFID001`
3. Click "Check Vehicle"
4. **Expected:** Shows KA01AB1234 - John Doe - Red Car
5. Click "Park Vehicle"
6. **Expected:** "Vehicle parked successfully in slot A-XXX"
7. Enter `RFID001` again
8. Click "Check Vehicle"
9. **Expected:** Shows "Currently Parked" status
10. Click "Exit Vehicle"
11. **Expected:** Shows payment amount (minimum ₹50 for 1 hour)

---

### ❌ Scenario 2: Expired RFID - Entry Rejected

**RFID to use:** `RFID004` (expired 6 months ago)

1. Go to: http://localhost:3000/scanner
2. Enter: `RFID004`
3. Click "Check Vehicle"
4. **Expected:** Shows vehicle KA03XY1111 - Alice Johnson - Blue Motorcycle
5. **Expected:** RFID Expiry shows in RED (expired)
6. Click "Park Vehicle"
7. **Expected:** Error: "RFID tag has expired" (blocked by database trigger)

---

### ❌ Scenario 3: Recently Expired RFID

**RFID to use:** `RFID005` (expired yesterday)

1. Enter: `RFID005`
2. Click "Check Vehicle"
3. **Expected:** Shows DL04PQ2222 - Charlie Brown - Silver SUV
4. **Expected:** RFID shows expired
5. Try to park
6. **Expected:** Rejected by trigger

---

### 💰 Scenario 4: Payment Calculation - Short Duration

**Test ceiling/round-up logic**

1. Enter `RFID002` and park vehicle
2. **Immediately** exit (within 1 minute)
3. **Expected Payment:**
   - Duration: ~1 minute
   - Hours charged: 1 hour (rounded up)
   - Amount: ₹50 (if regular slot)

---

### 💰 Scenario 5: Payment Calculation - Just Over 1 Hour

1. Enter `RFID003` and park vehicle
2. Wait 61 minutes (or manually update database)
3. Exit vehicle
4. **Expected Payment:**
   - Duration: 61 minutes
   - Hours charged: 2 hours (rounded up from 1.02)
   - Amount: ₹100 (if regular slot)

---

### 🅿️ Scenario 6: Different Slot Types

**Regular Slot (₹50/hour):**
- 30 min → ₹50
- 61 min → ₹100

**Premium Slot (₹75/hour):**
- 30 min → ₹75
- 61 min → ₹150

**Motorcycle Slot (₹30/hour):**
- 30 min → ₹30
- 61 min → ₹60

**EV Charging (₹100/hour):**
- 30 min → ₹100
- 61 min → ₹200

---

## All Test RFIDs

| RFID UID | Plate Number | Owner | Vehicle Type | Status | Test Purpose |
|----------|--------------|-------|--------------|--------|--------------|
| RFID001 | KA01AB1234 | John Doe | Car (Red) | ✅ Valid | Normal flow |
| RFID002 | KA02CD5678 | Jane Smith | SUV (Black) | ✅ Valid | Normal flow |
| RFID003 | MH01EF9012 | Bob Wilson | Sedan (White) | ✅ Valid | Normal flow |
| RFID004 | KA03XY1111 | Alice Johnson | Motorcycle (Blue) | ❌ Expired (6mo ago) | Test expiry rejection |
| RFID005 | DL04PQ2222 | Charlie Brown | SUV (Silver) | ❌ Expired (yesterday) | Test expiry rejection |
| RFID006 | TN05RS3333 | David Lee | Car (Yellow) | ✅ Valid | Normal flow |
| RFID007 | MH06TU4444 | Emma Wilson | Sedan (Green) | ✅ Valid | Normal flow |

---

## Payment Calculation Examples

### Formula
```
Hours to Charge = CEILING(Duration in Minutes / 60)
Payment Amount = Hours to Charge × Hourly Rate
```

### Examples (Regular Slot @ ₹50/hour)

| Duration | Minutes | Calculation | Hours Charged | Amount |
|----------|---------|-------------|---------------|--------|
| 1 min | 1 | CEILING(1/60) = 1 | 1 hour | ₹50 |
| 10 min | 10 | CEILING(10/60) = 1 | 1 hour | ₹50 |
| 30 min | 30 | CEILING(30/60) = 1 | 1 hour | ₹50 |
| 59 min | 59 | CEILING(59/60) = 1 | 1 hour | ₹50 |
| 60 min | 60 | CEILING(60/60) = 1 | 1 hour | ₹50 |
| 61 min | 61 | CEILING(61/60) = 2 | 2 hours | ₹100 |
| 90 min | 90 | CEILING(90/60) = 2 | 2 hours | ₹100 |
| 120 min | 120 | CEILING(120/60) = 2 | 2 hours | ₹100 |
| 121 min | 121 | CEILING(121/60) = 3 | 3 hours | ₹150 |
| 150 min | 150 | CEILING(150/60) = 3 | 3 hours | ₹150 |
| 181 min | 181 | CEILING(181/60) = 4 | 4 hours | ₹200 |

---

## Database Verification Commands

### Check RFID Expiry Status
```sql
SELECT 
    r.uid,
    v.plate_number,
    r.expiry_date,
    CASE 
        WHEN r.expiry_date < CURDATE() THEN 'EXPIRED'
        ELSE 'VALID'
    END as status
FROM RFIDTags r
JOIN Vehicle v ON r.vehicle_id = v.vehicle_id;
```

### Check Active Parking
```sql
SELECT 
    pr.record_id,
    v.plate_number,
    ps.slot_no,
    pr.entrytime,
    TIMESTAMPDIFF(MINUTE, pr.entrytime, NOW()) as minutes_parked
FROM ParkingRecords pr
JOIN Vehicle v ON pr.vehicle_id = v.vehicle_id
JOIN ParkingSlots ps ON pr.slot_id = ps.slot_id
WHERE pr.exit_time IS NULL;
```

### Check Payment Records
```sql
SELECT 
    p.payment_id,
    v.plate_number,
    p.duration_minutes,
    CEILING(p.duration_minutes / 60.0) as hours_charged,
    p.amount,
    p.timestamp
FROM Payment p
JOIN ParkingRecords pr ON p.record_id = pr.record_id
JOIN Vehicle v ON pr.vehicle_id = v.vehicle_id
ORDER BY p.timestamp DESC;
```

---

## Troubleshooting

### "RFID tag not found"
- Run: `./COMPLETE_SETUP.sh` to add test data
- Verify: `mysql -u root -p -e "SELECT uid FROM dbmsproject.RFIDTags;"`

### "RFID tag has expired"
- This is CORRECT behavior for RFID004 and RFID005
- Use RFID001, RFID002, RFID003, RFID006, or RFID007 instead

### Backend not responding
```bash
# Check if running
lsof -ti:5001

# Restart
lsof -ti:5001 | xargs kill -9
PORT=5001 node server/index.js &

# Test
curl http://localhost:5001/api/health
```

### Payment calculation wrong
- Make sure you ran: `update_payment_calculation.sql`
- Check procedure: `SHOW CREATE PROCEDURE dbmsproject.calc_payment;`

---

## Success Checklist

- [ ] Test data loaded (7 RFIDs total)
- [ ] Payment procedure updated (ceiling logic)
- [ ] Backend running on port 5001
- [ ] Frontend running on port 3000
- [ ] Valid RFID (RFID001) works
- [ ] Expired RFID (RFID004) rejected
- [ ] Payment rounds up correctly
- [ ] Can park and exit vehicle
- [ ] Dashboard shows statistics

---

**Ready to test!** Start with RFID001 for a successful flow, then try RFID004 to see expiry rejection! 🚗✨
