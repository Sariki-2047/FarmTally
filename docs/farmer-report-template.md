# Farmer Settlement Report Template

## Report Structure



### Report Header
```
Farmer Settlement Report
```

### Farmer Information Section
```
Name: [Farmer Full Name]
Number: [Farmer ID/Number]
Phone No.: [Phone Number]
Aadhar: [****-****-XXXX] (show last 4 digits)
Bank Account: [****XXXX] (show last 4 digits)
```

### Advance & Interest Information Section
```
[Advance Status Message]
- "No advance data available" (if no advance given)
- "Advance: ₹[Amount] INR" (if advance was provided)
```

---

### Financial Summary Section

| Field | Value | Format |
|-------|-------|--------|
| Price Per Kg: | [Rate] | Decimal (e.g., 21.5) |
| Bags Entered: | [Count] | Integer (e.g., 55) |
| Total Weight: | [Weight] | Decimal (e.g., 3441.0) |
| Weight Adjustment: | [Deduction] | Integer (e.g., 110) |
| Adjusted Total Weight: | [Net Weight] | Decimal (e.g., 3331.0) |
| Total Value: | [Amount] | Decimal (e.g., 71616.5) |
| Total Interest: | [Interest] | Decimal with INR (e.g., 0.0 INR) |
| Total Advance: | [Advance] | Decimal with INR (e.g., 0.0 INR) |
| Final amount: | [Final Amount] | Decimal with INR (e.g., 71616.5 INR) |

---

### Individual Bag Weights Section
```
Weights Entered:
[All individual bag weights listed in sequence]
```

**Example Format:**
```
64.0, 59.0, 64.0, 65.0, 59.0, 63.0, 61.0, 59.0,
62.0, 60.0, 62.0, 59.0, 60.0, 63.0, 63.0,
64.0, 62.0, 67.0, 66.0, 64.0, 62.0, 62.0, 61.0,
62.0, 65.0, 62.0, 60.0, 60.0, 65.0, 59.0,
65.0, 59.0, 62.0, 62.0, 66.0, 64.0, 63.0, 56.0,
53.0, 62.0, 60.0, 64.0, 61.0, 62.0, 65.0,
66.0, 62.0, 64.0, 66.0, 70.0, 65.0, 62.0, 65.0,
59.0, 64.0
```

## Report Generation Specifications

### Data Sources
1. **Farmer Information**: From farmer database
2. **Bag Weights**: From lorry data entry (individual bag weights array)
3. **Financial Calculations**: From lorry submission data
4. **Pricing**: From Farm Admin pricing settings
5. **Advances**: From advance payment records

### Calculation Logic

#### Weight Calculations
```
Gross Weight = Sum of all individual bag weights
standard deduction = Number of Bags × 2KG
Quality Deduction = Additional deductions by Farm Admin
Net Weight = Gross Weight - (standard deduction + Quality Deduction)
```

#### Financial Calculations
```
Total Value = Net Weight × Price Per KG
Total Interest = Interest charges (if applicable added by )
Total Advance = Sum of all advance payments
Final Amount = Total Value - (Total Interest + Total Advance)
```

### Report Format Options

#### PDF Report Layout
```
┌─────────────────────────────────────────┐
│           FARMER SETTLEMENT REPORT      │
├─────────────────────────────────────────┤
│ Name: [Farmer Name]                     │
│ Number: [Farmer ID]                     │
│                                         │
│ [Advance Status]                        │
├─────────────────────────────────────────┤
│ Price Per Kg:           [Rate]          │
│ Bags Entered:           [Count]         │
│ Total Weight:           [Weight]        │
│ standard deduction:     [Deduction]     │
│ Net Weight:             [Net Weight]    │
│ Total Value:            [Amount]        │
│ Total Interest:         [Interest] INR  │
│ Total Advance:          [Advance] INR   │
│ Final amount:           [Final] INR     │
├─────────────────────────────────────────┤
│ Weights Entered:                        │
│ [All bag weights in comma-separated     │
│  format, wrapped to multiple lines]     │
└─────────────────────────────────────────┘
```

#### Excel Report Structure
- **Sheet 1: Summary** - Financial summary and farmer info
- **Sheet 2: Bag Weights** - Individual bag weights in columns
- **Sheet 3: Calculations** - Detailed calculation breakdown

### Report Generation Triggers

#### When Reports Can Be Generated
1. **After Lorry Submission**: When Field Manager submits lorry data
2. **After Farm Admin Processing**: When pricing and deductions are applied
3. **On-Demand**: Farm Admin or Field Manager can generate anytime
4. **Scheduled**: Automatic generation for completed transactions

#### Report Access Permissions
- **Farm Admin**: Can generate reports for any farmer
- **Field Manager**: Can generate reports for farmers in their lorries
- **Farmer**: Can view/download their own reports only

### Report Customization Options

#### Header Customization
- Business logo and name
- Report generation date and time
- Lorry information (Lorry ID, Date of operation)
- Field Manager name

#### Additional Information (Optional)
- Moisture content percentage
- Quality grade/rating
- Payment method details
- Transaction reference number
- Digital signature/stamp

### Technical Implementation

#### Report Generation Process
1. **Data Retrieval**: Fetch farmer, lorry, and transaction data
2. **Calculation Verification**: Recalculate all amounts for accuracy
3. **Template Population**: Fill report template with data
4. **Format Generation**: Create PDF/Excel/CSV as requested
5. **Storage**: Save report for future reference
6. **Delivery**: Email/download/print as needed

#### Data Validation
- Verify all bag weights are present
- Ensure calculations match stored values
- Validate farmer information completeness
- Check for any missing transaction data

### Sample Report Data Structure (JSON)
```json
{
  "reportId": "RPT001",
  "generatedDate": "2024-01-15T10:30:00Z",
  "farmer": {
    "id": "F036",
    "name": "Bobbadi arun kumar",
    "number": "36"
  },
  "transaction": {
    "lorryId": "L001",
    "date": "2024-01-15",
    "fieldManager": "Manager Name"
  },
  "weights": {
    "individual": [64.0, 59.0, 64.0, 65.0, 59.0, 63.0, ...],
    "totalWeight": 3441.0,
    "bagsCount": 55,
    "weightAdjustment": 110,
    "qualityDeduction": 0,
    "adjustedWeight": 3331.0
  },
  "financial": {
    "pricePerKg": 21.5,
    "totalValue": 71616.5,
    "totalInterest": 0.0,
    "totalAdvance": 0.0,
    "finalAmount": 71616.5
  },
  "advance": {
    "status": "No advance data available",
    "amount": 0.0,
    "history": [],
    "interestCharges": 0.0
  },
  "farmerDetails": {
    "phone": "+91-9876543210",
    "aadhar": "****-****-1234",
    "bankAccount": "****5678"
  }
}
```

### Report Distribution

#### Delivery Methods
- **Digital Download**: PDF/Excel download from dashboard
- **Email**: Automatic email to farmer (if email available)
- **SMS**: Summary via SMS with download link
- **Print**: Physical printout for farmer signature
- **WhatsApp**: Share via WhatsApp (if integrated)

#### Report Storage
- **Database**: Store report metadata and generation history
- **File System**: Store generated PDF/Excel files
- **Cloud Storage**: Backup reports to cloud storage
- **Retention Policy**: Keep reports for 7 years for audit purposes