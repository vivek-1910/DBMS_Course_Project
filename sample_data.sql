-- Sample Data for Parking Management System
-- Run this to populate the database with test data

USE dbmsproject;

-- Clear existing data (optional - be careful!)
-- DELETE FROM Payment;
-- DELETE FROM FineReason;
-- DELETE FROM Fines;
-- DELETE FROM ParkingRecords;
-- DELETE FROM RFIDTags;
-- DELETE FROM Vehicle;
-- DELETE FROM OwnerPhone;
-- DELETE FROM OwnerAddress;
-- DELETE FROM ParkingSlots;
-- DELETE FROM Owner;

-- Insert Owners
INSERT INTO Owner (name, email) VALUES 
('John Doe', 'john.doe@email.com'),
('Jane Smith', 'jane.smith@email.com'),
('Robert Johnson', 'robert.j@email.com'),
('Emily Davis', 'emily.davis@email.com'),
('Michael Brown', 'michael.b@email.com');

-- Insert Owner Addresses
INSERT INTO OwnerAddress (owner_id, address_line, city, state, postal_code, country) VALUES
(1, '123 Main Street, Apt 4B', 'Bangalore', 'Karnataka', '560001', 'India'),
(2, '456 Park Avenue', 'Mumbai', 'Maharashtra', '400001', 'India'),
(3, '789 Lake View Road', 'Delhi', 'Delhi', '110001', 'India'),
(4, '321 Garden Street', 'Chennai', 'Tamil Nadu', '600001', 'India'),
(5, '654 Beach Road', 'Goa', 'Goa', '403001', 'India');

-- Insert Owner Phones
INSERT INTO OwnerPhone (owner_id, phone) VALUES
(1, '+91-9876543210'),
(1, '+91-9876543211'),
(2, '+91-9876543212'),
(3, '+91-9876543213'),
(4, '+91-9876543214'),
(5, '+91-9876543215');

-- Insert Vehicles
INSERT INTO Vehicle (plate_number, vehicle_type, color, owner_id) VALUES
('KA01AB1234', 'Car', 'Red', 1),
('KA02CD5678', 'SUV', 'Black', 1),
('MH01EF9012', 'Sedan', 'White', 2),
('DL03GH3456', 'Hatchback', 'Blue', 3),
('TN04IJ7890', 'Car', 'Silver', 4),
('GA05KL1234', 'SUV', 'Grey', 5),
('KA06MN5678', 'Motorcycle', 'Red', 2),
('MH07OP9012', 'Car', 'Green', 3);

-- Insert RFID Tags
INSERT INTO RFIDTags (uid, issue_date, expiry_date, installation_date, vehicle_id) VALUES
('RFID001', '2024-01-01', '2025-12-31', '2024-01-01', 1),
('RFID002', '2024-01-15', '2025-12-31', '2024-01-15', 2),
('RFID003', '2024-02-01', '2025-12-31', '2024-02-01', 3),
('RFID004', '2024-02-15', '2025-12-31', '2024-02-15', 4),
('RFID005', '2024-03-01', '2025-12-31', '2024-03-01', 5),
('RFID006', '2024-03-15', '2025-12-31', '2024-03-15', 6),
('RFID007', '2024-04-01', '2025-12-31', '2024-04-01', 7),
('RFID008', '2024-04-15', '2025-12-31', '2024-04-15', 8);

-- Insert Parking Slots
INSERT INTO ParkingSlots (slot_no, slot_type, rate, status) VALUES
-- Ground Floor - Regular
('A-101', 'Regular', 50.00, 'available'),
('A-102', 'Regular', 50.00, 'available'),
('A-103', 'Regular', 50.00, 'available'),
('A-104', 'Regular', 50.00, 'available'),
('A-105', 'Regular', 50.00, 'available'),
-- Ground Floor - Handicapped
('A-201', 'Handicapped', 40.00, 'available'),
('A-202', 'Handicapped', 40.00, 'available'),
-- First Floor - Premium
('B-101', 'Premium', 75.00, 'available'),
('B-102', 'Premium', 75.00, 'available'),
('B-103', 'Premium', 75.00, 'available'),
-- First Floor - EV Charging
('B-201', 'EV Charging', 100.00, 'available'),
('B-202', 'EV Charging', 100.00, 'available'),
-- Second Floor - Regular
('C-101', 'Regular', 50.00, 'available'),
('C-102', 'Regular', 50.00, 'available'),
('C-103', 'Regular', 50.00, 'available'),
-- Motorcycle Parking
('M-101', 'Motorcycle', 30.00, 'available'),
('M-102', 'Motorcycle', 30.00, 'available'),
('M-103', 'Motorcycle', 30.00, 'available'),
('M-104', 'Motorcycle', 30.00, 'available'),
('M-105', 'Motorcycle', 30.00, 'available');

-- Insert some completed parking records (for history)
INSERT INTO ParkingRecords (slot_id, vehicle_id, entrytime, exit_time) VALUES
(1, 1, '2024-10-01 08:00:00', '2024-10-01 12:30:00'),
(2, 2, '2024-10-01 09:15:00', '2024-10-01 14:45:00'),
(3, 3, '2024-10-02 10:00:00', '2024-10-02 15:00:00'),
(4, 4, '2024-10-02 11:30:00', '2024-10-02 16:00:00'),
(5, 5, '2024-10-03 08:45:00', '2024-10-03 13:15:00');

-- Calculate and insert payments for completed records
CALL calc_payment(1);
CALL calc_payment(2);
CALL calc_payment(3);
CALL calc_payment(4);
CALL calc_payment(5);

-- Insert some active parking records (currently parked)
INSERT INTO ParkingRecords (slot_id, vehicle_id, entrytime) VALUES
(6, 6, NOW() - INTERVAL 2 HOUR),
(7, 7, NOW() - INTERVAL 1 HOUR);

-- Update slot status for active parking
UPDATE ParkingSlots SET status = 'occupied' WHERE slot_id IN (6, 7);

-- Insert some fines
INSERT INTO Fines (record_id, fine_amount, violation_date) VALUES
(2, 500.00, '2024-10-01'),
(4, 300.00, '2024-10-02');

-- Insert fine reasons
INSERT INTO FineReason (fine_id, reason) VALUES
(1, 'Overstay beyond 24 hours'),
(1, 'Parking in no-parking zone'),
(2, 'Improper parking');

-- Display summary
SELECT 'Data insertion completed!' as Status;

SELECT 
    (SELECT COUNT(*) FROM Owner) as Total_Owners,
    (SELECT COUNT(*) FROM Vehicle) as Total_Vehicles,
    (SELECT COUNT(*) FROM ParkingSlots) as Total_Slots,
    (SELECT COUNT(*) FROM ParkingSlots WHERE status = 'available') as Available_Slots,
    (SELECT COUNT(*) FROM ParkingRecords WHERE exit_time IS NULL) as Active_Parking,
    (SELECT COUNT(*) FROM Payment) as Total_Payments,
    (SELECT COALESCE(SUM(amount), 0) FROM Payment) as Total_Revenue;

-- Show RFID UIDs for QR code generation
SELECT '=== RFID UIDs for QR Code Generation ===' as Info;
SELECT 
    v.plate_number,
    r.uid as RFID_UID,
    o.name as Owner,
    'Generate QR code with this UID' as Instructions
FROM RFIDTags r
JOIN Vehicle v ON r.vehicle_id = v.vehicle_id
JOIN Owner o ON v.owner_id = o.owner_id
ORDER BY v.plate_number;
