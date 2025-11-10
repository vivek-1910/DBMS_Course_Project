# 🚀 Quick Start Guide

## Prerequisites Check
```bash
# Check Node.js version (should be v16+)
node --version

# Check MySQL status
mysql.server status

# If MySQL is not running, start it
mysql.server start
```

## Step 1: Install Dependencies

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

## Step 2: Configure Environment

Edit the `.env` file with your MySQL password:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=YOUR_MYSQL_PASSWORD_HERE
DB_NAME=dbmsproject
DB_PORT=3306
PORT=5000
```

## Step 3: Verify Database

```bash
mysql -u root -p
```

Then in MySQL:
```sql
USE dbmsproject;
SHOW TABLES;
-- Should show 10 tables
```

## Step 4: Add Sample Data (Optional)

```sql
-- Add a test owner
INSERT INTO Owner (name, email) VALUES ('Test User', 'test@example.com');

-- Add a test vehicle
INSERT INTO Vehicle (plate_number, vehicle_type, color, owner_id) 
VALUES ('KA01AB1234', 'Car', 'Red', 1);

-- Add RFID tag (valid for 1 year)
INSERT INTO RFIDTags (uid, issue_date, expiry_date, installation_date, vehicle_id)
VALUES ('RFID001', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 1 YEAR), CURDATE(), 1);

-- Add parking slots
INSERT INTO ParkingSlots (slot_no, slot_type, rate, status) VALUES 
('A-101', 'Regular', 50.00, 'available'),
('A-102', 'Regular', 50.00, 'available'),
('A-103', 'Regular', 50.00, 'available'),
('B-201', 'Premium', 75.00, 'available'),
('B-202', 'Premium', 75.00, 'available');
```

## Step 5: Start the Application

**Option A: Run both servers together**
```bash
npm run dev
```

**Option B: Run separately (2 terminals)**

Terminal 1 - Backend:
```bash
npm run server
```

Terminal 2 - Frontend:
```bash
cd client
npm start
```

## Step 6: Access the Application

Open your browser and go to:
```
http://localhost:3000
```

Backend API is running at:
```
http://localhost:5000
```

## 🎯 Testing the QR Scanner

### Method 1: Manual Entry (Easiest)
1. Go to "QR Scanner" page
2. Enter plate number: `KA01AB1234`
3. Click "Check Vehicle"
4. Click "Park Vehicle" to simulate entry
5. Click "Exit Vehicle" to simulate exit and see payment

### Method 2: Generate QR Code
1. Go to "Vehicles" page
2. Click "QR Code" button for KA01AB1234
3. Download the QR code
4. Display it on another device/print it
5. Use "Start Camera" on QR Scanner page
6. Point camera at the QR code

## 📱 Navigation

- **Dashboard** - Overview and statistics
- **QR Scanner** - Main entry/exit interface
- **Vehicles** - View all vehicles and generate QR codes
- **Parking Records** - View parking history
- **Owners** - Manage vehicle owners
- **Parking Slots** - View slot availability
- **Payments** - View payment history
- **Fines** - Manage violations

## 🐛 Troubleshooting

### "Cannot connect to database"
```bash
# Check if MySQL is running
mysql.server status

# Start MySQL if needed
mysql.server start

# Verify credentials in .env file
```

### "Port 5000 already in use"
```bash
# Find and kill the process
lsof -ti:5000 | xargs kill

# Or change PORT in .env file
```

### "Camera not working"
- Allow camera permissions in browser
- Use Chrome or Edge (best support)
- Make sure you're on localhost or HTTPS

### "Module not found" errors
```bash
# Reinstall dependencies
rm -rf node_modules client/node_modules
npm install
cd client && npm install
```

## 📊 Sample Workflow

1. **Register Vehicle** (already done with sample data)
2. **Generate QR Code** from Vehicles page
3. **Scan QR** at entry gate → Vehicle parks in available slot
4. **Check Dashboard** → See active vehicles increase
5. **Scan QR** at exit gate → Payment calculated automatically
6. **View Payments** → See transaction record

## 🎨 Features to Try

- ✅ Park multiple vehicles
- ✅ View real-time slot occupancy
- ✅ Check parking history
- ✅ Generate and download QR codes
- ✅ Monitor revenue statistics
- ✅ Filter active vs completed parking sessions

## 📝 Notes

- Payment is calculated as: `(Duration in minutes / 60) × Hourly Rate`
- RFID expiry is checked automatically via database trigger
- Slot status updates automatically on entry/exit
- All timestamps are in local timezone

## 🆘 Need Help?

Check the main README.md for:
- Detailed API documentation
- Database schema details
- Architecture overview
- Advanced configuration

---

**Ready to go!** 🚀 Start with the Dashboard to see the overview, then try the QR Scanner!
