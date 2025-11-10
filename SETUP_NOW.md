# 🚨 QUICK FIX - Do This Now!

## Problem
- Port 5000 is used by Apple AirPlay
- Database password is missing in .env

## Solution

### Step 1: Update .env file

Open `.env` file and change it to:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=YOUR_MYSQL_PASSWORD_HERE
DB_NAME=dbmsproject
DB_PORT=3306

# Server Configuration
PORT=5001
```

**Replace `YOUR_MYSQL_PASSWORD_HERE` with your actual MySQL password!**

### Step 2: Restart Backend

```bash
# Kill any running servers
lsof -ti:5001 | xargs kill -9

# Start backend on port 5001
PORT=5001 node server/index.js &

# Test it works
curl http://localhost:5001/api/vehicles/rfid/RFID001
```

You should see vehicle data, not an error!

### Step 3: Restart Frontend (if needed)

```bash
cd client
npm start
```

### Step 4: Test QR Scanner

1. Go to: http://localhost:3000/scanner
2. Enter: `RFID001`
3. Click "Check Vehicle"
4. Should show: **KA01AB1234 - John Doe**

---

## Quick Command (all in one)

```bash
# Edit .env first, then run:
lsof -ti:5001 | xargs kill -9 2>/dev/null
PORT=5001 node server/index.js &
sleep 2
curl http://localhost:5001/api/vehicles/rfid/RFID001
```

If you see vehicle JSON data → SUCCESS! ✅
If you see "Access denied" → Fix DB_PASSWORD in .env ❌
