USE dbmsproject;

SELECT 'Checking current data...' as Status;

SELECT COUNT(*) as Owner_Count FROM Owner;
SELECT COUNT(*) as Vehicle_Count FROM Vehicle;
SELECT COUNT(*) as RFID_Count FROM RFIDTags;
SELECT COUNT(*) as Slot_Count FROM ParkingSlots;

SELECT 'RFID Tags in database:' as Info;
SELECT * FROM RFIDTags;

SELECT 'Vehicles in database:' as Info;
SELECT * FROM Vehicle;
