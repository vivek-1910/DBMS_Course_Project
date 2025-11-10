#!/bin/bash

echo "🚗 Loading Test Data for Parking System..."
echo ""
echo "Please enter your MySQL root password when prompted:"
echo ""

mysql -u root -p <<EOF
USE dbmsproject;

-- Add test owner
INSERT INTO Owner (name, email) VALUES ('John Doe', 'john@test.com');

-- Get the owner_id
SET @owner_id = LAST_INSERT_ID();

-- Add owner address
INSERT INTO OwnerAddress (owner_id, address_line, city, state, postal_code, country) 
VALUES (@owner_id, '123 Main St', 'Bangalore', 'Karnataka', '560001', 'India');

-- Add owner phone
INSERT INTO OwnerPhone (owner_id, phone) VALUES (@owner_id, '+91-9876543210');

-- Add test vehicle
INSERT INTO Vehicle (plate_number, vehicle_type, color, owner_id) 
VALUES ('KA01AB1234', 'Car', 'Red', @owner_id);

-- Get the vehicle_id
SET @vehicle_id = LAST_INSERT_ID();

-- Add RFID tag
INSERT INTO RFIDTags (uid, issue_date, expiry_date, installation_date, vehicle_id) 
VALUES ('RFID001', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 1 YEAR), CURDATE(), @vehicle_id);

-- Add parking slots if they don't exist
INSERT IGNORE INTO ParkingSlots (slot_no, slot_type, rate, status) VALUES
('A-101', 'Regular', 50.00, 'available'),
('A-102', 'Regular', 50.00, 'available'),
('A-103', 'Regular', 50.00, 'available'),
('A-104', 'Regular', 50.00, 'available'),
('A-105', 'Regular', 50.00, 'available');

-- Show what was created
SELECT '✅ Test data inserted successfully!' as Status;
SELECT '' as '';
SELECT 'Test RFID UID: RFID001' as 'Use This';
SELECT 'Vehicle: KA01AB1234' as 'Plate Number';
SELECT 'Owner: John Doe' as 'Owner Name';
SELECT '' as '';
SELECT 'Go to QR Scanner and enter: RFID001' as 'Next Step';

EOF

echo ""
echo "✅ Done! Now go to http://localhost:3000/scanner"
echo "   and enter: RFID001"
echo ""
