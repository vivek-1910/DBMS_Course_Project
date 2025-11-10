-- Quick Test Data for QR Scanner Testing
USE dbmsproject;

-- Clear existing test data (optional)
DELETE FROM Payment WHERE payment_id > 0;
DELETE FROM FineReason WHERE fine_id > 0;
DELETE FROM Fines WHERE fine_id > 0;
DELETE FROM ParkingRecords WHERE record_id > 0;
DELETE FROM RFIDTags WHERE tag_id > 0;
DELETE FROM Vehicle WHERE vehicle_id > 0;
DELETE FROM OwnerPhone WHERE owner_id > 0;
DELETE FROM OwnerAddress WHERE address_id > 0;
DELETE FROM Owner WHERE owner_id > 0;

-- Reset auto increment
ALTER TABLE Owner AUTO_INCREMENT = 1;
ALTER TABLE Vehicle AUTO_INCREMENT = 1;
ALTER TABLE RFIDTags AUTO_INCREMENT = 1;
ALTER TABLE ParkingRecords AUTO_INCREMENT = 1;

-- Add test owners
INSERT INTO Owner (name, email) VALUES 
('John Doe', 'john@test.com'),
('Jane Smith', 'jane@test.com'),
('Bob Wilson', 'bob@test.com');

-- Add owner addresses
INSERT INTO OwnerAddress (owner_id, address_line, city, state, postal_code, country) VALUES
(1, '123 Main St', 'Bangalore', 'Karnataka', '560001', 'India'),
(2, '456 Park Ave', 'Mumbai', 'Maharashtra', '400001', 'India'),
(3, '789 Lake Rd', 'Delhi', 'Delhi', '110001', 'India');

-- Add owner phones
INSERT INTO OwnerPhone (owner_id, phone) VALUES
(1, '+91-9876543210'),
(2, '+91-9876543211'),
(3, '+91-9876543212');

-- Add test vehicles
INSERT INTO Vehicle (plate_number, vehicle_type, color, owner_id) VALUES
('KA01AB1234', 'Car', 'Red', 1),
('KA02CD5678', 'SUV', 'Black', 2),
('MH01EF9012', 'Sedan', 'White', 3);

-- Add RFID tags (VALID - not expired)
INSERT INTO RFIDTags (uid, issue_date, expiry_date, installation_date, vehicle_id) VALUES
('RFID001', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 1 YEAR), CURDATE(), 1),
('RFID002', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 1 YEAR), CURDATE(), 2),
('RFID003', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 1 YEAR), CURDATE(), 3);

-- Add parking slots (make sure some are available)
INSERT INTO ParkingSlots (slot_no, slot_type, rate, status) VALUES
('A-101', 'Regular', 50.00, 'available'),
('A-102', 'Regular', 50.00, 'available'),
('A-103', 'Regular', 50.00, 'available'),
('A-104', 'Regular', 50.00, 'available'),
('A-105', 'Regular', 50.00, 'available'),
('B-101', 'Premium', 75.00, 'available'),
('B-102', 'Premium', 75.00, 'available'),
('B-103', 'Premium', 75.00, 'available'),
('M-101', 'Motorcycle', 30.00, 'available'),
('M-102', 'Motorcycle', 30.00, 'available');

-- Show what was created
SELECT '=== TEST DATA INSERTED ===' as Status;

SELECT 'Owners:' as Info;
SELECT owner_id, name, email FROM Owner;

SELECT 'Vehicles with RFID:' as Info;
SELECT 
    v.vehicle_id,
    v.plate_number,
    v.vehicle_type,
    v.color,
    r.uid as RFID_UID,
    r.expiry_date,
    o.name as Owner
FROM Vehicle v
JOIN RFIDTags r ON v.vehicle_id = r.vehicle_id
JOIN Owner o ON v.owner_id = o.owner_id;

SELECT 'Available Parking Slots:' as Info;
SELECT slot_id, slot_no, slot_type, rate, status 
FROM ParkingSlots 
WHERE status = 'available';

SELECT '=== READY TO TEST ===' as Status;
SELECT 'Use these RFID UIDs for testing:' as Instructions;
SELECT 
    r.uid as 'Enter_This_RFID',
    v.plate_number as 'Vehicle',
    o.name as 'Owner'
FROM RFIDTags r
JOIN Vehicle v ON r.vehicle_id = v.vehicle_id
JOIN Owner o ON v.owner_id = o.owner_id;
