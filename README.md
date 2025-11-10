# 🚗 Smart Parking Management System

A modern, full-stack parking management system with **QR Code scanning** for vehicle entry/exit, built with React, Node.js, Express, and MySQL.

## ✨ Features

- 📱 **QR Code Scanner** - Webcam-based QR code scanning for vehicle entry/exit
- 📊 **Real-time Dashboard** - Live statistics and parking occupancy
- 🚗 **Vehicle Management** - Register and manage vehicles with QR codes
- 🅿️ **Parking Slots** - Track slot availability and status
- 💰 **Automated Payments** - Calculate parking fees automatically
- 👥 **Owner Management** - Manage vehicle owners and their details
- 🚨 **Fine Management** - Track violations and fines
- 📈 **Analytics** - Revenue tracking and parking history

## 🛠️ Tech Stack

### Frontend
- React 18
- React Router v6
- Axios
- Lucide React (Icons)
- QRCode.react (QR Code generation)
- Modern CSS with animations

### Backend
- Node.js
- Express.js
- MySQL2
- QRCode (Server-side QR generation)
- CORS
- dotenv

### Database
- MySQL 8.0+
- Stored Procedures
- Triggers
- Foreign Key Constraints

## 📋 Prerequisites

- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- npm or yarn
- Modern web browser with webcam support

## 🚀 Installation

### 1. Clone the repository
```bash
cd /Users/vivekgowdas/Desktop/DBMS_PROJECT_TEMP
```

### 2. Install Backend Dependencies
```bash
npm install
```

### 3. Install Frontend Dependencies
```bash
cd client
npm install
cd ..
```

### 4. Configure Database

1. Make sure MySQL is running:
```bash
mysql.server start
```

2. The database `dbmsproject` should already exist with all tables, triggers, and procedures.

3. Update `.env` file with your MySQL credentials:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=dbmsproject
DB_PORT=3306
PORT=5000
```

### 5. Start the Application

**Option 1: Run both frontend and backend together**
```bash
npm run dev
```

**Option 2: Run separately**

Terminal 1 (Backend):
```bash
npm run server
```

Terminal 2 (Frontend):
```bash
npm run client
```

### 6. Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 📱 Usage

### QR Code Scanner

1. Navigate to **QR Scanner** page
2. Click "Start Camera" to activate webcam
3. **Manual Entry**: Enter plate number directly (e.g., KA01AB1234)
4. System will check:
   - Vehicle registration
   - RFID tag validity
   - Current parking status
5. Click **Park Vehicle** for entry or **Exit Vehicle** for checkout
6. Payment is automatically calculated on exit

### Generate QR Codes

1. Go to **Vehicles** page
2. Click "QR Code" button for any vehicle
3. Download the QR code image
4. Print and attach to vehicle windshield

### Dashboard

- View real-time parking occupancy
- Monitor today's revenue
- Track active vehicles
- See recent parking activities

## 🗄️ Database Schema

### Tables
- **Owner** - Vehicle owners
- **OwnerAddress** - Multi-valued addresses
- **OwnerPhone** - Multi-valued phone numbers
- **Vehicle** - Registered vehicles
- **RFIDTags** - RFID tags (QR codes in this demo)
- **ParkingSlots** - Available parking slots
- **ParkingRecords** - Parking sessions
- **Payment** - Payment records
- **Fines** - Violation fines
- **FineReason** - Fine reasons

### Key Features
- **Trigger**: `check_rfid_expiry_before_parking` - Validates RFID before parking
- **Function**: `calc_duration` - Calculates parking duration
- **Procedure**: `calc_payment` - Automated payment calculation

## 🔌 API Endpoints

### Vehicles
- `GET /api/vehicles` - Get all vehicles
- `GET /api/vehicles/:id` - Get vehicle by ID
- `GET /api/vehicles/plate/:plateNumber` - Get vehicle by plate
- `GET /api/vehicles/:id/qrcode` - Generate QR code

### Parking
- `GET /api/parking` - Get all parking records
- `GET /api/parking/active` - Get active parking sessions
- `POST /api/parking/entry` - Vehicle entry
- `POST /api/parking/exit` - Vehicle exit
- `GET /api/parking/check/:plateNumber` - Check parking status

### Slots
- `GET /api/slots` - Get all slots
- `GET /api/slots/available` - Get available slots
- `GET /api/slots/stats` - Get slot statistics

### Payments
- `GET /api/payments` - Get all payments
- `GET /api/payments/stats` - Get payment statistics

### Fines
- `GET /api/fines` - Get all fines
- `POST /api/fines` - Create new fine

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

## 🎨 Features Demonstration

### 1. Vehicle Entry Flow
```
Scan QR Code → Validate RFID → Check Availability → Assign Slot → Update Status
```

### 2. Vehicle Exit Flow
```
Scan QR Code → Find Parking Record → Calculate Duration → Generate Payment → Free Slot
```

### 3. Payment Calculation
```
Duration (minutes) / 60 × Hourly Rate = Payment Amount
```

## 🔒 Security Features

- RFID expiry validation via database trigger
- Prevents duplicate parking entries
- Validates vehicle registration before parking
- Referential integrity with foreign keys

## 📊 Sample Data

To test the system, you can add sample data:

```sql
-- Add a sample owner
INSERT INTO Owner (name, email) VALUES ('John Doe', 'john@example.com');

-- Add a vehicle
INSERT INTO Vehicle (plate_number, vehicle_type, color, owner_id) 
VALUES ('KA01AB1234', 'Car', 'Red', 1);

-- Add RFID tag
INSERT INTO RFIDTags (uid, issue_date, expiry_date, installation_date, vehicle_id)
VALUES ('RFID123456', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 1 YEAR), CURDATE(), 1);

-- Add parking slots
INSERT INTO ParkingSlots (slot_no, slot_type, rate, status)
VALUES 
  ('A-101', 'Regular', 50.00, 'available'),
  ('A-102', 'Regular', 50.00, 'available'),
  ('B-201', 'Premium', 75.00, 'available');
```

## 🐛 Troubleshooting

### Camera not working
- Check browser permissions for camera access
- Use HTTPS or localhost
- Try different browsers (Chrome recommended)

### Database connection error
- Verify MySQL is running: `mysql.server status`
- Check credentials in `.env` file
- Ensure database exists: `SHOW DATABASES;`

### Port already in use
- Change PORT in `.env` file
- Kill existing process: `lsof -ti:5000 | xargs kill`

## 📝 License

This project is for educational purposes.

## 👥 Contributors

- DBMS Project Team

## 🙏 Acknowledgments

- React community
- Express.js team
- MySQL documentation
- Lucide Icons

---

**Note**: This is a demonstration system. For production use, add:
- User authentication
- HTTPS/SSL
- Input validation
- Error logging
- Database backups
- Rate limiting
- Session management
