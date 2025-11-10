-- Fix Payment Table - Add duration_minutes column
USE dbmsproject;

-- Add duration_minutes column to Payment table
ALTER TABLE Payment 
ADD COLUMN duration_minutes INT NULL AFTER amount;

-- Show updated structure
DESCRIBE Payment;

SELECT '✅ Payment table fixed! duration_minutes column added.' as Status;
