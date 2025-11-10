-- Add More Test Data with Expired RFID and Various Scenarios
USE dbmsproject;

-- Add more owners
INSERT INTO Owner (name, email) VALUES 
('Alice Johnson', 'alice@test.com'),
('Charlie Brown', 'charlie@test.com'),
('David Lee', 'david@test.com'),
('Emma Wilson', 'emma@test.com');

-- Get the new owner IDs
SET @alice_id = (SELECT owner_id FROM Owner WHERE email = 'alice@test.com');
SET @charlie_id = (SELECT owner_id FROM Owner WHERE email = 'charlie@test.com');
SET @david_id = (SELECT owner_id FROM Owner WHERE email = 'david@test.com');
SET @emma_id = (SELECT owner_id FROM Owner WHERE email = 'emma@test.com');

-- Add addresses
INSERT INTO OwnerAddress (owner_id, address_line, city, state, postal_code, country) VALUES
(@alice_id, '111 Oak Street', 'Bangalore', 'Karnataka', '560002', 'India'),
(@charlie_id, '222 Pine Avenue', 'Pune', 'Maharashtra', '411001', 'India'),
(@david_id, '333 Maple Road', 'Hyderabad', 'Telangana', '500001', 'India'),
(@emma_id, '444 Cedar Lane', 'Chennai', 'Tamil Nadu', '600002', 'India');

-- Add phones
INSERT INTO OwnerPhone (owner_id, phone) VALUES
(@alice_id, '+91-9876543216'),
(@charlie_id, '+91-9876543217'),
(@david_id, '+91-9876543218'),
(@emma_id, '+91-9876543219');

-- Add more vehicles
INSERT INTO Vehicle (plate_number, vehicle_type, color, owner_id) VALUES
('KA03XY1111', 'Motorcycle', 'Blue', @alice_id),
('DL04PQ2222', 'SUV', 'Silver', @charlie_id),
('TN05RS3333', 'Car', 'Yellow', @david_id),
('MH06TU4444', 'Sedan', 'Green', @emma_id);

-- Get vehicle IDs
SET @alice_vehicle = (SELECT vehicle_id FROM Vehicle WHERE plate_number = 'KA03XY1111');
SET @charlie_vehicle = (SELECT vehicle_id FROM Vehicle WHERE plate_number = 'DL04PQ2222');
SET @david_vehicle = (SELECT vehicle_id FROM Vehicle WHERE plate_number = 'TN05RS3333');
SET @emma_vehicle = (SELECT vehicle_id FROM Vehicle WHERE plate_number = 'MH06TU4444');

-- Add RFID tags - SOME EXPIRED, SOME VALID
-- EXPIRED RFID (expired 6 months ago)
INSERT INTO RFIDTags (uid, issue_date, expiry_date, installation_date, vehicle_id) VALUES
('RFID004', DATE_SUB(CURDATE(), INTERVAL 1 YEAR), DATE_SUB(CURDATE(), INTERVAL 6 MONTH), DATE_SUB(CURDATE(), INTERVAL 1 YEAR), @alice_vehicle);

-- EXPIRED RFID (expired yesterday)
INSERT INTO RFIDTags (uid, issue_date, expiry_date, installation_date, vehicle_id) VALUES
('RFID005', DATE_SUB(CURDATE(), INTERVAL 1 YEAR), DATE_SUB(CURDATE(), INTERVAL 1 DAY), DATE_SUB(CURDATE(), INTERVAL 1 YEAR), @charlie_vehicle);

-- VALID RFID (expires in 6 months)
INSERT INTO RFIDTags (uid, issue_date, expiry_date, installation_date, vehicle_id) VALUES
('RFID006', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 6 MONTH), CURDATE(), @david_vehicle);

-- VALID RFID (expires in 1 year)
INSERT INTO RFIDTags (uid, issue_date, expiry_date, installation_date, vehicle_id) VALUES
('RFID007', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 1 YEAR), CURDATE(), @emma_vehicle);

-- Add more parking slots
INSERT INTO ParkingSlots (slot_no, slot_type, rate, status) VALUES
('A-106', 'Regular', 50.00, 'available'),
('A-107', 'Regular', 50.00, 'available'),
('B-104', 'Premium', 75.00, 'available'),
('B-105', 'Premium', 75.00, 'available'),
('C-101', 'Regular', 50.00, 'available'),
('C-102', 'Regular', 50.00, 'available'),
('M-103', 'Motorcycle', 30.00, 'available'),
('M-104', 'Motorcycle', 30.00, 'available'),
('M-105', 'Motorcycle', 30.00, 'available'),
('EV-101', 'EV Charging', 100.00, 'available'),
('EV-102', 'EV Charging', 100.00, 'available');

-- Show summary
SELECT '=== NEW TEST DATA ADDED ===' as Status;

SELECT 'All RFID Tags (with expiry status):' as Info;
SELECT 
    r.uid as RFID_UID,
    v.plate_number as Vehicle,
    v.vehicle_type as Type,
    o.name as Owner,
    r.expiry_date as Expires,
    CASE 
        WHEN r.expiry_date < CURDATE() THEN '❌ EXPIRED'
        WHEN r.expiry_date < DATE_ADD(CURDATE(), INTERVAL 1 MONTH) THEN '⚠️ EXPIRING SOON'
        ELSE '✅ VALID'
    END as Status
FROM RFIDTags r
JOIN Vehicle v ON r.vehicle_id = v.vehicle_id
JOIN Owner o ON v.owner_id = o.owner_id
ORDER BY r.expiry_date;

SELECT 'Available Parking Slots:' as Info;
SELECT COUNT(*) as Total_Available FROM ParkingSlots WHERE status = 'available';

SELECT '=== TEST SCENARIOS ===' as Info;
SELECT 
    'RFID001, RFID002, RFID003' as Valid_RFIDs,
    'RFID004, RFID005' as Expired_RFIDs,
    'RFID006, RFID007' as Valid_New_RFIDs;
