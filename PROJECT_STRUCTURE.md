# 📁 Project Structure

```
DBMS_PROJECT_TEMP/
│
├── 📄 package.json                 # Backend dependencies
├── 📄 .env                         # Environment variables (MySQL config)
├── 📄 .env.example                 # Example environment file
├── 📄 .gitignore                   # Git ignore rules
├── 📄 README.md                    # Main documentation
├── 📄 QUICKSTART.md                # Quick start guide
├── 📄 PROJECT_STRUCTURE.md         # This file
├── 📄 database_schema.md           # Complete database documentation
├── 📄 sample_data.sql              # Sample data for testing
│
├── 📁 server/                      # Backend (Node.js + Express)
│   ├── 📄 index.js                 # Main server file
│   │
│   ├── 📁 config/
│   │   └── 📄 database.js          # MySQL connection pool
│   │
│   └── 📁 routes/                  # API route handlers
│       ├── 📄 owners.js            # Owner management APIs
│       ├── 📄 vehicles.js          # Vehicle management APIs
│       ├── 📄 parking.js           # Parking entry/exit APIs
│       ├── 📄 slots.js             # Parking slot APIs
│       ├── 📄 payments.js          # Payment APIs
│       ├── 📄 fines.js             # Fine management APIs
│       └── 📄 dashboard.js         # Dashboard statistics APIs
│
└── 📁 client/                      # Frontend (React)
    ├── 📄 package.json             # Frontend dependencies
    │
    ├── 📁 public/
    │   └── 📄 index.html           # HTML template
    │
    └── 📁 src/
        ├── 📄 index.js             # React entry point
        ├── 📄 index.css            # Global styles
        ├── 📄 App.js               # Main app component with routing
        │
        ├── 📁 components/          # Reusable components
        │   ├── 📄 Layout.js        # Main layout with sidebar
        │   └── 📄 Layout.css       # Layout styles
        │
        └── 📁 pages/               # Page components
            ├── 📄 Dashboard.js     # Dashboard with statistics
            ├── 📄 Dashboard.css    # Dashboard styles
            ├── 📄 QRScanner.js     # QR code scanner (main feature)
            ├── 📄 QRScanner.css    # Scanner styles
            ├── 📄 Vehicles.js      # Vehicle management
            ├── 📄 ParkingRecords.js# Parking history
            ├── 📄 Owners.js        # Owner management
            ├── 📄 Slots.js         # Slot management
            ├── 📄 Payments.js      # Payment history
            ├── 📄 Fines.js         # Fine management
            └── 📄 Common.css       # Shared page styles
```

## 🗂️ File Descriptions

### Root Level

- **package.json** - Backend Node.js dependencies (Express, MySQL2, etc.)
- **.env** - Database credentials and server configuration
- **README.md** - Complete project documentation
- **QUICKSTART.md** - Step-by-step setup guide
- **database_schema.md** - Full database schema with relationships
- **sample_data.sql** - SQL script to populate test data

### Backend (`/server`)

#### Main Files
- **index.js** - Express server setup, middleware, route registration

#### Config
- **database.js** - MySQL connection pool configuration

#### Routes (API Endpoints)
- **owners.js** - CRUD operations for vehicle owners
- **vehicles.js** - Vehicle management + QR code generation
- **parking.js** - Entry/exit logic, parking validation
- **slots.js** - Parking slot availability management
- **payments.js** - Payment records and statistics
- **fines.js** - Fine creation and retrieval
- **dashboard.js** - Aggregated statistics for dashboard

### Frontend (`/client`)

#### Public
- **index.html** - Single page application template

#### Source (`/src`)

**Core Files:**
- **index.js** - React DOM rendering
- **index.css** - Global styles, animations, utility classes
- **App.js** - React Router setup with all routes

**Components:**
- **Layout.js** - Sidebar navigation and page wrapper
- **Layout.css** - Sidebar and layout styling

**Pages:**
- **Dashboard.js** - Real-time stats, occupancy chart, recent activities
- **QRScanner.js** - Webcam QR scanner, manual entry, entry/exit logic
- **Vehicles.js** - Vehicle list, QR code generation/download
- **ParkingRecords.js** - Parking history with filters
- **Owners.js** - Owner list and details
- **Slots.js** - Parking slot status grid
- **Payments.js** - Payment transaction history
- **Fines.js** - Fine records with reasons

## 🔄 Data Flow

### Vehicle Entry Flow
```
QRScanner.js → POST /api/parking/entry → parking.js
    ↓
Check vehicle in database
    ↓
Validate RFID expiry (trigger)
    ↓
Find available slot
    ↓
Create parking record
    ↓
Update slot status to 'occupied'
    ↓
Return success with slot info
```

### Vehicle Exit Flow
```
QRScanner.js → POST /api/parking/exit → parking.js
    ↓
Find active parking record
    ↓
Update exit_time
    ↓
Call calc_payment() procedure
    ↓
Update slot status to 'available'
    ↓
Return payment details
```

## 🎨 Styling Architecture

- **Global Styles** (`index.css`) - Base styles, animations, utilities
- **Component Styles** - Scoped CSS files for each component
- **Design System:**
  - Gradient backgrounds
  - Card-based layouts
  - Consistent color palette
  - Smooth animations
  - Responsive design

## 🔌 API Architecture

### RESTful Endpoints

**Owners:**
- `GET /api/owners` - List all
- `GET /api/owners/:id` - Get details
- `POST /api/owners` - Create
- `PUT /api/owners/:id` - Update
- `DELETE /api/owners/:id` - Delete

**Vehicles:**
- `GET /api/vehicles` - List all
- `GET /api/vehicles/:id` - Get by ID
- `GET /api/vehicles/plate/:plateNumber` - Get by plate
- `GET /api/vehicles/:id/qrcode` - Generate QR code
- `POST /api/vehicles` - Create
- `PUT /api/vehicles/:id` - Update
- `DELETE /api/vehicles/:id` - Delete

**Parking:**
- `GET /api/parking` - All records
- `GET /api/parking/active` - Active only
- `GET /api/parking/check/:plateNumber` - Check status
- `POST /api/parking/entry` - Park vehicle
- `POST /api/parking/exit` - Exit vehicle
- `GET /api/parking/history/:plateNumber` - Vehicle history

**Slots:**
- `GET /api/slots` - All slots
- `GET /api/slots/available` - Available only
- `GET /api/slots/stats` - Statistics
- `POST /api/slots` - Create
- `PUT /api/slots/:id` - Update
- `DELETE /api/slots/:id` - Delete

**Payments:**
- `GET /api/payments` - All payments
- `GET /api/payments/record/:recordId` - By record
- `GET /api/payments/stats` - Statistics

**Fines:**
- `GET /api/fines` - All fines
- `POST /api/fines` - Create fine
- `GET /api/fines/stats` - Statistics

**Dashboard:**
- `GET /api/dashboard/stats` - All statistics
- `GET /api/dashboard/revenue` - Revenue by date range

## 🗄️ Database Integration

### Connection
- **Pool-based** connection for efficiency
- **Promise-based** queries using mysql2/promise
- **Error handling** with try-catch blocks

### Key Database Features Used
- **Triggers** - RFID validation on parking entry
- **Stored Procedures** - Automated payment calculation
- **Functions** - Duration calculation
- **Foreign Keys** - Referential integrity
- **Generated Columns** - Auto-calculated duration

## 🚀 Deployment Structure

### Development
```bash
npm run dev  # Runs both servers concurrently
```

### Production
```bash
npm run build  # Build React app
# Serve build folder with Express
```

## 📦 Dependencies

### Backend
- express - Web framework
- mysql2 - MySQL client
- cors - Cross-origin requests
- dotenv - Environment variables
- body-parser - Request parsing
- qrcode - QR code generation

### Frontend
- react - UI library
- react-router-dom - Routing
- axios - HTTP client
- lucide-react - Icons
- qrcode.react - QR code display
- html5-qrcode - QR scanning

## 🔐 Security Considerations

- Environment variables for sensitive data
- CORS configuration
- Input validation needed (add in production)
- SQL injection prevention via parameterized queries
- HTTPS recommended for production

---

This structure provides a clean separation of concerns with a RESTful API backend and a modern React frontend!
