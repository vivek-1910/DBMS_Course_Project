-- Update Payment Calculation Logic
-- New Rule: Round UP to nearest hour (ceiling)
-- 0-60 minutes = 1 hour charge
-- 61-120 minutes = 2 hours charge
-- etc.

USE dbmsproject;

-- Drop existing procedure
DROP PROCEDURE IF EXISTS calc_payment;

-- Create new procedure with ceiling logic
DELIMITER $$

CREATE PROCEDURE calc_payment(IN p_record_id INT)
BEGIN
    DECLARE v_duration_minutes INT;
    DECLARE v_rate DECIMAL(10,2);
    DECLARE v_hours_to_charge INT;
    DECLARE v_amount DECIMAL(10,2);
    
    -- Get duration and rate
    SELECT 
        TIMESTAMPDIFF(MINUTE, pr.entrytime, pr.exit_time),
        ps.rate
    INTO v_duration_minutes, v_rate
    FROM ParkingRecords pr
    JOIN ParkingSlots ps ON pr.slot_id = ps.slot_id
    WHERE pr.record_id = p_record_id;
    
    -- Calculate hours to charge (CEILING - round up)
    -- If 0-60 minutes = 1 hour
    -- If 61-120 minutes = 2 hours
    -- If 121-180 minutes = 3 hours, etc.
    SET v_hours_to_charge = CEILING(v_duration_minutes / 60.0);
    
    -- Minimum charge is 1 hour even if parked for 1 minute
    IF v_hours_to_charge < 1 THEN
        SET v_hours_to_charge = 1;
    END IF;
    
    -- Calculate total amount
    SET v_amount = v_hours_to_charge * v_rate;
    
    -- Insert payment record
    INSERT INTO Payment (record_id, amount, duration_minutes, payment_method, timestamp)
    VALUES (p_record_id, v_amount, v_duration_minutes, 'Cash', NOW());
    
END$$

DELIMITER ;

-- Test the new calculation
SELECT '=== Payment Calculation Updated ===' as Status;
SELECT 'New Rule: Always round UP to nearest hour' as Info;
SELECT '30 minutes = 1 hour charge' as Example1;
SELECT '61 minutes = 2 hours charge' as Example2;
SELECT '90 minutes = 2 hours charge' as Example3;
SELECT '121 minutes = 3 hours charge' as Example4;

-- Show rate examples
SELECT 'Rate Examples:' as Info;
SELECT 
    slot_type as Slot_Type,
    rate as Hourly_Rate,
    CONCAT('30 min = ₹', rate) as Half_Hour_Charge,
    CONCAT('61 min = ₹', rate * 2) as Over_Hour_Charge,
    CONCAT('90 min = ₹', rate * 2) as Hour_Half_Charge
FROM ParkingSlots
WHERE status = 'available'
GROUP BY slot_type, rate
ORDER BY rate;
