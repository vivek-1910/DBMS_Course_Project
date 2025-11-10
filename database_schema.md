# DBMS Project Database Schema

## Database: `dbmsproject`

---

## Tables (10)

### 1. **Owner**
Primary table for vehicle owners.
```
owner_id    INT (PK, AUTO_INCREMENT)
name        VARCHAR(150) NOT NULL
email       VARCHAR(150) UNIQUE
```

### 2. **OwnerAddress**
Multi-valued attribute for owner addresses.
```
address_id   INT (PK, AUTO_INCREMENT)
owner_id     INT (FK -> Owner.owner_id)
address_line TEXT NOT NULL
city         VARCHAR(100)
state        VARCHAR(100)
postal_code  VARCHAR(20)
country      VARCHAR(100)
```

### 3. **OwnerPhone**
Multi-valued attribute for owner phone numbers.
```
owner_id    INT (PK, FK -> Owner.owner_id)
phone       VARCHAR(30) (PK)
```

### 4. **Vehicle**
Vehicle information linked to owners.
```
vehicle_id   INT (PK, AUTO_INCREMENT)
plate_number VARCHAR(30) UNIQUE NOT NULL
vehicle_type VARCHAR(50)
color        VARCHAR(50)
owner_id     INT (FK -> Owner.owner_id) NOT NULL
```

### 5. **RFIDTags**
RFID tags associated with vehicles.
```
tag_id            INT (PK, AUTO_INCREMENT)
uid               VARCHAR(100) UNIQUE NOT NULL
issue_date        DATE
expiry_date       DATE
installation_date DATE
vehicle_id        INT (FK -> Vehicle.vehicle_id, UNIQUE) NOT NULL
```

### 6. **ParkingSlots**
Available parking slots with rates.
```
slot_id   INT (PK, AUTO_INCREMENT)
slot_no   VARCHAR(50) UNIQUE NOT NULL
slot_type VARCHAR(50)
status    ENUM('available','occupied','out_of_service') DEFAULT 'available'
rate      DECIMAL(10,2) NOT NULL
```

### 7. **ParkingRecords**
Records of parking sessions.
```
record_id        INT (PK, AUTO_INCREMENT)
slot_id          INT (FK -> ParkingSlots.slot_id) NOT NULL
vehicle_id       INT (FK -> Vehicle.vehicle_id) NOT NULL
entrytime        DATETIME NOT NULL
exit_time        DATETIME
duration_minutes INT (VIRTUAL GENERATED)
```

### 8. **Fines**
Fine records for violations.
```
fine_id        INT (PK, AUTO_INCREMENT)
record_id      INT (FK -> ParkingRecords.record_id) NOT NULL
fine_amount    DECIMAL(10,2) NOT NULL
violation_date DATE
```

### 9. **FineReason**
Reasons for fines (multi-valued attribute).
```
fine_id INT (PK, FK -> Fines.fine_id)
reason  VARCHAR(255) (PK) NOT NULL
```

### 10. **Payment**
Payment records for parking sessions.
```
payment_id     INT (PK, AUTO_INCREMENT)
record_id      INT (FK -> ParkingRecords.record_id, UNIQUE) NOT NULL
timestamp      DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL
payment_method ENUM('cash','card','upi','online') NOT NULL
amount         DECIMAL(12,2) DEFAULT 0.00 NOT NULL
```

---

## Functions (1)

### **calc_duration**
Calculates parking duration in minutes.
```sql
CREATE FUNCTION calc_duration(entry_time DATETIME, exit_time DATETIME) 
RETURNS INT
DETERMINISTIC
BEGIN
  RETURN TIMESTAMPDIFF(MINUTE, entry_time, exit_time);
END
```

---

## Stored Procedures (1)

### **calc_payment**
Calculates and inserts payment for a parking record.
```sql
CREATE PROCEDURE calc_payment(IN p_record_id INT)
BEGIN
  DECLARE v_duration INT;
  DECLARE v_rate DECIMAL(10,2);
  DECLARE v_amount DECIMAL(10,2);
  DECLARE v_slot_id INT;

  SELECT duration_minutes, slot_id INTO v_duration, v_slot_id
  FROM parkingrecords
  WHERE record_id = p_record_id;

  SELECT rate INTO v_rate
  FROM parkingslots
  WHERE slot_id = v_slot_id;

  SET v_amount = (v_duration / 60) * v_rate;

  INSERT INTO payment (record_id, timestamp, payment_method, amount)
  VALUES (p_record_id, NOW(), 'cash', v_amount);
END
```

---

## Triggers (1)

### **check_rfid_expiry_before_parking**
Validates RFID tag before allowing parking.
```sql
CREATE TRIGGER check_rfid_expiry_before_parking 
BEFORE INSERT ON parkingrecords 
FOR EACH ROW
BEGIN
  DECLARE v_expiry DATE;

  SELECT expiry_date INTO v_expiry
  FROM rfidtags
  WHERE vehicle_id = NEW.vehicle_id;

  IF v_expiry IS NULL THEN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'RFID tag not found for this vehicle';
  ELSEIF v_expiry < CURDATE() THEN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'RFID tag has expired — cannot allow parking';
  END IF;
END
```

---

## Complete Attribute Details

### **Owner Table**
| Attribute | Data Type | Constraints | Description |
|-----------|-----------|-------------|-------------|
| owner_id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier for each owner |
| name | VARCHAR(150) | NOT NULL | Full name of the vehicle owner |
| email | VARCHAR(150) | UNIQUE, NULL allowed | Email address (optional but unique if provided) |

**Key Constraints:**
- Primary Key: `owner_id`
- Unique Key: `email`

---

### **OwnerAddress Table** (Multi-valued Attribute)
| Attribute | Data Type | Constraints | Description |
|-----------|-----------|-------------|-------------|
| address_id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier for each address |
| owner_id | INT | FOREIGN KEY → Owner(owner_id), NOT NULL | Links to owner |
| address_line | TEXT | NOT NULL | Street address or building details |
| city | VARCHAR(100) | NULL allowed | City name |
| state | VARCHAR(100) | NULL allowed | State/Province |
| postal_code | VARCHAR(20) | NULL allowed | ZIP/Postal code |
| country | VARCHAR(100) | NULL allowed | Country name |

**Key Constraints:**
- Primary Key: `address_id`
- Foreign Key: `owner_id` REFERENCES `Owner(owner_id)`
- **Relationship**: One owner can have multiple addresses (1:N)

---

### **OwnerPhone Table** (Multi-valued Attribute)
| Attribute | Data Type | Constraints | Description |
|-----------|-----------|-------------|-------------|
| owner_id | INT | PRIMARY KEY, FOREIGN KEY → Owner(owner_id) | Links to owner |
| phone | VARCHAR(30) | PRIMARY KEY, NOT NULL | Phone number |

**Key Constraints:**
- Composite Primary Key: `(owner_id, phone)`
- Foreign Key: `owner_id` REFERENCES `Owner(owner_id)`
- **Relationship**: One owner can have multiple phone numbers (1:N)

---

### **Vehicle Table**
| Attribute | Data Type | Constraints | Description |
|-----------|-----------|-------------|-------------|
| vehicle_id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier for each vehicle |
| plate_number | VARCHAR(30) | UNIQUE, NOT NULL | Vehicle registration/license plate |
| vehicle_type | VARCHAR(50) | NULL allowed | Type (e.g., car, motorcycle, truck) |
| color | VARCHAR(50) | NULL allowed | Vehicle color |
| owner_id | INT | FOREIGN KEY → Owner(owner_id), NOT NULL | Links to vehicle owner |

**Key Constraints:**
- Primary Key: `vehicle_id`
- Unique Key: `plate_number`
- Foreign Key: `owner_id` REFERENCES `Owner(owner_id)`
- **Relationship**: One owner can have multiple vehicles (1:N)

---

### **RFIDTags Table**
| Attribute | Data Type | Constraints | Description |
|-----------|-----------|-------------|-------------|
| tag_id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier for each RFID tag |
| uid | VARCHAR(100) | UNIQUE, NOT NULL | RFID tag unique identifier |
| issue_date | DATE | NULL allowed | Date when tag was issued |
| expiry_date | DATE | NULL allowed | Tag expiration date |
| installation_date | DATE | NULL allowed | Date when tag was installed on vehicle |
| vehicle_id | INT | FOREIGN KEY → Vehicle(vehicle_id), UNIQUE, NOT NULL | Links to vehicle (one-to-one) |

**Key Constraints:**
- Primary Key: `tag_id`
- Unique Keys: `uid`, `vehicle_id`
- Foreign Key: `vehicle_id` REFERENCES `Vehicle(vehicle_id)`
- **Relationship**: One vehicle has exactly one RFID tag (1:1)

---

### **ParkingSlots Table**
| Attribute | Data Type | Constraints | Description |
|-----------|-----------|-------------|-------------|
| slot_id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier for each parking slot |
| slot_no | VARCHAR(50) | UNIQUE, NOT NULL | Slot number/identifier (e.g., "A-101") |
| slot_type | VARCHAR(50) | NULL allowed | Type of slot (e.g., regular, handicapped, EV) |
| status | ENUM | 'available', 'occupied', 'out_of_service', DEFAULT 'available' | Current slot status |
| rate | DECIMAL(10,2) | NOT NULL | Hourly parking rate in currency |

**Key Constraints:**
- Primary Key: `slot_id`
- Unique Key: `slot_no`
- **Relationship**: One slot can have multiple parking records over time (1:N)

---

### **ParkingRecords Table** (Central Transaction Table)
| Attribute | Data Type | Constraints | Description |
|-----------|-----------|-------------|-------------|
| record_id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier for each parking session |
| slot_id | INT | FOREIGN KEY → ParkingSlots(slot_id), NOT NULL | Links to parking slot |
| vehicle_id | INT | FOREIGN KEY → Vehicle(vehicle_id), NOT NULL | Links to vehicle |
| entrytime | DATETIME | NOT NULL | When vehicle entered the parking |
| exit_time | DATETIME | NULL allowed | When vehicle exited (NULL if still parked) |
| duration_minutes | INT | VIRTUAL GENERATED COLUMN | Auto-calculated parking duration |

**Key Constraints:**
- Primary Key: `record_id`
- Foreign Keys: 
  - `slot_id` REFERENCES `ParkingSlots(slot_id)`
  - `vehicle_id` REFERENCES `Vehicle(vehicle_id)`
- **Relationships**: 
  - One slot can have multiple parking records (1:N)
  - One vehicle can have multiple parking records (1:N)
  - One parking record has exactly one payment (1:1)
  - One parking record can have multiple fines (1:N)

---

### **Payment Table**
| Attribute | Data Type | Constraints | Description |
|-----------|-----------|-------------|-------------|
| payment_id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier for each payment |
| record_id | INT | FOREIGN KEY → ParkingRecords(record_id), UNIQUE, NOT NULL | Links to parking record (one-to-one) |
| amount | DECIMAL(12,2) | DEFAULT 0.00, NOT NULL | Payment amount |
| duration_minutes | INT | NULL allowed | Duration of parking in minutes |
| payment_method | ENUM | 'cash', 'card', 'upi', 'online', NOT NULL | Payment method used |
| timestamp | DATETIME | DEFAULT CURRENT_TIMESTAMP, NOT NULL | When payment was made |

**Key Constraints:**
- Primary Key: `payment_id`
- Unique Key: `record_id` (ensures one payment per parking session)
- Foreign Key: `record_id` REFERENCES `ParkingRecords(record_id)`
- **Relationship**: One parking record has exactly one payment (1:1)

---

### **Fines Table**
| Attribute | Data Type | Constraints | Description |
|-----------|-----------|-------------|-------------|
| fine_id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier for each fine |
| record_id | INT | FOREIGN KEY → ParkingRecords(record_id), NOT NULL | Links to parking record |
| fine_amount | DECIMAL(10,2) | NOT NULL | Fine amount |
| violation_date | DATE | NULL allowed | Date of violation |

**Key Constraints:**
- Primary Key: `fine_id`
- Foreign Key: `record_id` REFERENCES `ParkingRecords(record_id)`
- **Relationships**: 
  - One parking record can have multiple fines (1:N)
  - One fine can have multiple reasons (1:N)

---

### **FineReason Table** (Multi-valued Attribute)
| Attribute | Data Type | Constraints | Description |
|-----------|-----------|-------------|-------------|
| fine_id | INT | PRIMARY KEY, FOREIGN KEY → Fines(fine_id) | Links to fine |
| reason | VARCHAR(255) | PRIMARY KEY, NOT NULL | Reason for fine |

**Key Constraints:**
- Composite Primary Key: `(fine_id, reason)`
- Foreign Key: `fine_id` REFERENCES `Fines(fine_id)`
- **Relationship**: One fine can have multiple reasons (1:N)

---

## Entity-Relationship Diagram

```
┌─────────────┐
│   Owner     │ (Strong Entity)
│─────────────│
│ PK owner_id │
│    name     │
│    email    │
└──────┬──────┘
       │
       │ 1:N (owns)
       ├──────────────────────────────────┐
       │                                  │
       │                                  │
┌──────▼──────────┐              ┌───────▼────────┐
│  OwnerAddress   │              │  OwnerPhone    │
│─────────────────│              │────────────────│
│ PK address_id   │              │ PK owner_id    │
│ FK owner_id     │              │ PK phone       │
│    address_line │              └────────────────┘
│    city         │              (Multi-valued)
│    state        │
│    postal_code  │
│    country      │
└─────────────────┘
(Multi-valued)

       │
       │ 1:N (owns)
       │
┌──────▼──────────┐
│    Vehicle      │ (Strong Entity)
│─────────────────│
│ PK vehicle_id   │
│    plate_number │
│    vehicle_type │
│    color        │
│ FK owner_id     │
└──────┬──────────┘
       │
       │ 1:1 (has)
       │
┌──────▼──────────────┐
│     RFIDTags        │ (Weak Entity - depends on Vehicle)
│─────────────────────│
│ PK tag_id           │
│    uid              │
│    issue_date       │
│    expiry_date      │
│    installation_date│
│ FK vehicle_id (UNI) │
└─────────────────────┘

       │
       │ 1:N (parks in)
       │
┌──────▼──────────────┐         ┌─────────────────┐
│  ParkingRecords     │◄────────│  ParkingSlots   │ (Strong Entity)
│─────────────────────│  N:1    │─────────────────│
│ PK record_id        │ (uses)  │ PK slot_id      │
│ FK slot_id          │         │    slot_no      │
│ FK vehicle_id       │         │    slot_type    │
│    entrytime        │         │    status       │
│    exit_time        │         │    rate         │
│    duration_minutes │         └─────────────────┘
└──────┬──────────────┘
       │
       │ 1:1 (generates)
       │
┌──────▼──────────┐
│    Payment      │
│─────────────────│
│ PK payment_id   │
│ FK record_id(UN)│
│    timestamp    │
│    payment_meth │
│    amount       │
└─────────────────┘

       │
       │ 1:N (may have)
       │
┌──────▼──────────┐
│     Fines       │
│─────────────────│
│ PK fine_id      │
│ FK record_id    │
│    fine_amount  │
│    violation_dt │
└──────┬──────────┘
       │
       │ 1:N (has reasons)
       │
┌──────▼──────────┐
│   FineReason    │
│─────────────────│
│ PK fine_id      │
│ PK reason       │
└─────────────────┘
(Multi-valued)
```

---

## Detailed Relationship Mapping

### **1. Owner → OwnerAddress** (1:N)
- **Type**: One-to-Many
- **Foreign Key**: `OwnerAddress.owner_id` → `Owner.owner_id`
- **Constraint**: `owneraddress_ibfk_1`
- **Cardinality**: One owner can have multiple addresses
- **Purpose**: Handles multi-valued address attribute

### **2. Owner → OwnerPhone** (1:N)
- **Type**: One-to-Many
- **Foreign Key**: `OwnerPhone.owner_id` → `Owner.owner_id`
- **Constraint**: `ownerphone_ibfk_1`
- **Cardinality**: One owner can have multiple phone numbers
- **Purpose**: Handles multi-valued phone attribute

### **3. Owner → Vehicle** (1:N)
- **Type**: One-to-Many
- **Foreign Key**: `Vehicle.owner_id` → `Owner.owner_id`
- **Constraint**: `vehicle_ibfk_1`
- **Cardinality**: One owner can own multiple vehicles
- **Business Rule**: Each vehicle must have exactly one owner

### **4. Vehicle → RFIDTags** (1:1)
- **Type**: One-to-One
- **Foreign Key**: `RFIDTags.vehicle_id` → `Vehicle.vehicle_id` (UNIQUE)
- **Constraint**: `rfidtags_ibfk_1`
- **Cardinality**: One vehicle has exactly one RFID tag
- **Business Rule**: RFID tag must be valid and not expired for parking (enforced by trigger)

### **5. Vehicle → ParkingRecords** (1:N)
- **Type**: One-to-Many
- **Foreign Key**: `ParkingRecords.vehicle_id` → `Vehicle.vehicle_id`
- **Constraint**: `parkingrecords_ibfk_2`
- **Cardinality**: One vehicle can have multiple parking sessions
- **Business Rule**: Vehicle must have valid RFID to create parking record

### **6. ParkingSlots → ParkingRecords** (1:N)
- **Type**: One-to-Many
- **Foreign Key**: `ParkingRecords.slot_id` → `ParkingSlots.slot_id`
- **Constraint**: `parkingrecords_ibfk_1`
- **Cardinality**: One slot can be used in multiple parking sessions (over time)
- **Business Rule**: Slot status should be updated when occupied/available

### **7. ParkingRecords → Payment** (1:1)
- **Type**: One-to-One
- **Foreign Key**: `Payment.record_id` → `ParkingRecords.record_id` (UNIQUE)
- **Constraint**: `payment_ibfk_1`
- **Cardinality**: One parking session has exactly one payment
- **Business Rule**: Payment calculated using `calc_payment` procedure

### **8. ParkingRecords → Fines** (1:N)
- **Type**: One-to-Many
- **Foreign Key**: `Fines.record_id` → `ParkingRecords.record_id`
- **Constraint**: `fines_ibfk_1`
- **Cardinality**: One parking session can have multiple fines
- **Business Rule**: Fines are optional (only for violations)

### **9. Fines → FineReason** (1:N)
- **Type**: One-to-Many
- **Foreign Key**: `FineReason.fine_id` → `Fines.fine_id`
- **Constraint**: `finereason_ibfk_1`
- **Cardinality**: One fine can have multiple reasons
- **Purpose**: Handles multi-valued reason attribute

---

## Database Design Notes

1. **Multi-valued Attributes**: `OwnerAddress`, `OwnerPhone`, and `FineReason` are separate tables to handle multi-valued attributes.
2. **Generated Column**: `duration_minutes` in `ParkingRecords` is a virtual generated column calculated from entry and exit times.
3. **RFID Validation**: The trigger `check_rfid_expiry_before_parking` ensures only vehicles with valid, non-expired RFID tags can park.
4. **Payment Calculation**: Automated through the `calc_payment` procedure using hourly rates from `ParkingSlots.rate`.
5. **Slot Status**: Managed through ENUM to track availability ('available', 'occupied', 'out_of_service').
6. **One-to-One Relationships**: 
   - Vehicle ↔ RFIDTags (enforced by UNIQUE constraint)
   - ParkingRecords ↔ Payment (enforced by UNIQUE constraint)
7. **Cascade Behavior**: Not explicitly defined, but foreign keys maintain referential integrity.
