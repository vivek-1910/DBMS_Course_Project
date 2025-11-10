# 🧪 QR Scanner Testing Guide

## Step 1: Load Test Data

Run this command (you'll be prompted for MySQL password):
```bash
mysql -u root -p dbmsproject < quick_test_data.sql
```

## Step 2: Test RFID UIDs

Use these RFID UIDs to test the scanner:

| RFID UID | Plate Number | Owner | Vehicle Type |
|----------|--------------|-------|--------------|
| **RFID001** | KA01AB1234 | John Doe | Car (Red) |
| **RFID002** | KA02CD5678 | Jane Smith | SUV (Black) |
| **RFID003** | MH01EF9012 | Bob Wilson | Sedan (White) |

## Step 3: Test Manual Entry

1. Go to: http://localhost:3000/scanner
2. In the "Or Enter RFID Manually" section
3. Type: `RFID001`
4. Click "Check Vehicle"
5. You should see vehicle details appear

## Step 4: Test Entry/Exit

### Test Vehicle Entry:
1. Enter RFID: `RFID001`
2. Click "Check Vehicle"
3. Click "Park Vehicle" button
4. You should see: "Vehicle parked successfully in slot A-101"

### Test Vehicle Exit:
1. Enter same RFID: `RFID001`
2. Click "Check Vehicle"
3. Click "Exit Vehicle" button
4. You should see payment amount calculated

## Step 5: Generate QR Codes

1. Go to: http://localhost:3000/vehicles
2. Click "QR Code" button for any vehicle
3. You'll see a QR code with the RFID UID
4. Download it
5. Display on phone/print it
6. Use webcam to scan it

## Step 6: Test Webcam Scanner

1. Go to: http://localhost:3000/scanner
2. Click "Start Camera" button
3. Allow camera permissions
4. Show the downloaded QR code to camera
5. It should auto-detect and show vehicle info

## Troubleshooting

### "RFID tag not found"
- Make sure you ran `quick_test_data.sql`
- Check database: `SELECT * FROM RFIDTags;`

### "Failed to access camera"
- Allow camera permissions in browser
- Use Chrome or Edge (best support)
- Make sure you're on localhost (not http://127.0.0.1)

### "Cannot connect to database"
- Check MySQL is running: `mysql.server status`
- Check backend is running: `lsof -ti:5000`
- Check .env file has correct password

### Manual entry not working
- Open browser console (F12)
- Check for errors
- Make sure backend is running on port 5000

## Expected Flow

```
1. User shows QR code (contains RFID UID)
   ↓
2. Scanner reads: "RFID001"
   ↓
3. API call: GET /api/vehicles/rfid/RFID001
   ↓
4. Database lookup in RFIDTags table
   ↓
5. Returns vehicle with plate KA01AB1234
   ↓
6. Shows vehicle details on screen
   ↓
7. User clicks "Park Vehicle" or "Exit Vehicle"
```

## Quick Commands

```bash
# Check if servers are running
lsof -ti:5000  # Backend
lsof -ti:3000  # Frontend

# Restart backend
cd /Users/vivekgowdas/Desktop/DBMS_PROJECT_TEMP
npm run server

# Restart frontend
cd /Users/vivekgowdas/Desktop/DBMS_PROJECT_TEMP/client
npm start

# Check database
mysql -u root -p
USE dbmsproject;
SELECT * FROM RFIDTags;
SELECT * FROM Vehicle;
SELECT * FROM ParkingSlots WHERE status='available';
```

## Test Checklist

- [ ] Test data loaded successfully
- [ ] Manual RFID entry works (RFID001)
- [ ] Vehicle details display correctly
- [ ] Park Vehicle button works
- [ ] Slot gets assigned
- [ ] Exit Vehicle button works
- [ ] Payment calculates correctly
- [ ] QR code generates from Vehicles page
- [ ] Webcam scanner activates
- [ ] QR code scanning works (if you have QR code)

---

**Start with manual entry first!** Type `RFID001` in the manual entry field to test the system.
