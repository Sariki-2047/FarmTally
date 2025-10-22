const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 8089;

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false
});

// Middleware
app.use(cors());
app.use(express.json());

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'FarmTally Farm Admin Service',
    service: 'farm-admin-service',
    version: '1.0.0',
    status: 'running',
    port: PORT,
    endpoints: {
      health: '/health',
      pendingRequests: '/lorry-requests/pending',
      approveRequest: '/lorry-requests/:id/approve',
      rejectRequest: '/lorry-requests/:id/reject',
      lorries: '/lorries',
      pricingRules: '/pricing-rules',
      settlements: '/settlements/pending',
      dashboardStats: '/dashboard/stats'
    },
    features: [
      'lorry-approvals',
      'fleet-management',
      'pricing-rules',
      'settlements',
      'admin-reports'
    ]
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'farm-admin-service',
    timestamp: new Date().toISOString(),
    port: PORT,
    features: [
      'lorry-approvals',
      'fleet-management',
      'pricing-rules',
      'settlements',
      'admin-reports'
    ]
  });
});

// Lorry Request Approvals
app.get('/lorry-requests/pending', async (req, res) => {
  try {
    const { organizationId } = req.query;

    let query = `
      SELECT lr.*, fm.name as field_manager_name, fm.email as field_manager_email
      FROM lorry_requests lr
      LEFT JOIN users fm ON lr.field_manager_id = fm.id
      WHERE lr.status = 'PENDING'
    `;
    let params = [];

    if (organizationId) {
      query += ' AND fm.organization_id = $1';
      params.push(organizationId);
    }

    query += ' ORDER BY lr.created_at ASC';

    const result = await pool.query(query, params);

    res.json({
      success: true,
      data: {
        pendingRequests: result.rows,
        count: result.rows.length
      }
    });

  } catch (error) {
    console.error('Get pending lorry requests error:', error);
    res.status(500).json({
      error: 'Failed to fetch pending lorry requests',
      message: error.message
    });
  }
});

app.put('/lorry-requests/:requestId/approve', async (req, res) => {
  try {
    const { requestId } = req.params;
    const { lorryId, approvedBy, notes } = req.body;

    if (!lorryId || !approvedBy) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Lorry ID and approved by are required'
      });
    }

    // Update lorry request status
    const result = await pool.query(
      `UPDATE lorry_requests 
       SET status = 'APPROVED', lorry_id = $1, approved_by = $2, 
           approval_notes = $3, approved_at = NOW()
       WHERE id = $4 
       RETURNING id, status, lorry_id, approved_by, approved_at`,
      [lorryId, approvedBy, notes || '', requestId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Lorry request not found'
      });
    }

    // Update lorry status to assigned
    await pool.query(
      'UPDATE lorries SET status = $1, current_request_id = $2 WHERE id = $3',
      ['ASSIGNED', requestId, lorryId]
    );

    res.json({
      success: true,
      message: 'Lorry request approved successfully',
      data: {
        request: result.rows[0]
      }
    });

  } catch (error) {
    console.error('Approve lorry request error:', error);
    res.status(500).json({
      error: 'Failed to approve lorry request',
      message: error.message
    });
  }
});

app.put('/lorry-requests/:requestId/reject', async (req, res) => {
  try {
    const { requestId } = req.params;
    const { rejectedBy, rejectionReason } = req.body;

    if (!rejectedBy || !rejectionReason) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Rejected by and rejection reason are required'
      });
    }

    const result = await pool.query(
      `UPDATE lorry_requests 
       SET status = 'REJECTED', rejected_by = $1, rejection_reason = $2, rejected_at = NOW()
       WHERE id = $3 
       RETURNING id, status, rejected_by, rejection_reason, rejected_at`,
      [rejectedBy, rejectionReason, requestId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Lorry request not found'
      });
    }

    res.json({
      success: true,
      message: 'Lorry request rejected',
      data: {
        request: result.rows[0]
      }
    });

  } catch (error) {
    console.error('Reject lorry request error:', error);
    res.status(500).json({
      error: 'Failed to reject lorry request',
      message: error.message
    });
  }
});

// Fleet Management
app.get('/lorries', async (req, res) => {
  try {
    const { organizationId, status } = req.query;

    let query = 'SELECT * FROM lorries';
    let params = [];
    let conditions = [];

    if (organizationId) {
      conditions.push('organization_id = $' + (params.length + 1));
      params.push(organizationId);
    }

    if (status) {
      conditions.push('status = $' + (params.length + 1));
      params.push(status);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);

    res.json({
      success: true,
      data: {
        lorries: result.rows,
        count: result.rows.length
      }
    });

  } catch (error) {
    console.error('Get lorries error:', error);
    res.status(500).json({
      error: 'Failed to fetch lorries',
      message: error.message
    });
  }
});

app.post('/lorries', async (req, res) => {
  try {
    const { 
      name, 
      licensePlate, 
      capacity, 
      driverName, 
      driverPhone,
      organizationId 
    } = req.body;

    if (!name || !licensePlate || !capacity || !organizationId) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Name, license plate, capacity, and organization ID are required'
      });
    }

    const result = await pool.query(
      `INSERT INTO lorries (
        name, license_plate, capacity, driver_name, driver_phone, 
        organization_id, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7) 
      RETURNING id, name, license_plate, capacity, driver_name, status, created_at`,
      [name, licensePlate, capacity, driverName, driverPhone, organizationId, 'AVAILABLE']
    );

    res.status(201).json({
      success: true,
      message: 'Lorry created successfully',
      data: {
        lorry: result.rows[0]
      }
    });

  } catch (error) {
    console.error('Create lorry error:', error);
    res.status(500).json({
      error: 'Failed to create lorry',
      message: error.message
    });
  }
});

// Pricing Rules Management
app.get('/pricing-rules', async (req, res) => {
  try {
    const { organizationId } = req.query;

    let query = 'SELECT * FROM pricing_rules';
    let params = [];

    if (organizationId) {
      query += ' WHERE organization_id = $1';
      params.push(organizationId);
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);

    res.json({
      success: true,
      data: {
        pricingRules: result.rows,
        count: result.rows.length
      }
    });

  } catch (error) {
    console.error('Get pricing rules error:', error);
    res.status(500).json({
      error: 'Failed to fetch pricing rules',
      message: error.message
    });
  }
});

app.post('/pricing-rules', async (req, res) => {
  try {
    const { 
      organizationId,
      basePrice,
      moistureThreshold,
      moistureDeduction,
      qualityBonuses,
      effectiveDate 
    } = req.body;

    if (!organizationId || !basePrice || !moistureThreshold) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Organization ID, base price, and moisture threshold are required'
      });
    }

    const result = await pool.query(
      `INSERT INTO pricing_rules (
        organization_id, base_price, moisture_threshold, moisture_deduction,
        quality_bonuses, effective_date, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7) 
      RETURNING id, organization_id, base_price, moisture_threshold, effective_date, status, created_at`,
      [
        organizationId, basePrice, moistureThreshold, moistureDeduction || 0,
        JSON.stringify(qualityBonuses || {}), 
        effectiveDate || new Date().toISOString().split('T')[0], 
        'ACTIVE'
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Pricing rule created successfully',
      data: {
        pricingRule: result.rows[0]
      }
    });

  } catch (error) {
    console.error('Create pricing rule error:', error);
    res.status(500).json({
      error: 'Failed to create pricing rule',
      message: error.message
    });
  }
});

// Settlement Management
app.get('/settlements/pending', async (req, res) => {
  try {
    const { organizationId } = req.query;

    let query = `
      SELECT d.*, f.name as farmer_name, f.phone as farmer_phone,
             l.name as lorry_name, pr.base_price, pr.moisture_threshold
      FROM deliveries d
      LEFT JOIN farmers f ON d.farmer_id = f.id
      LEFT JOIN lorries l ON d.lorry_id = l.id
      LEFT JOIN pricing_rules pr ON pr.organization_id = f.organization_id AND pr.status = 'ACTIVE'
      WHERE d.status = 'APPROVED' AND d.settlement_status IS NULL
    `;
    let params = [];

    if (organizationId) {
      query += ' AND f.organization_id = $1';
      params.push(organizationId);
    }

    query += ' ORDER BY d.delivery_date ASC';

    const result = await pool.query(query, params);

    res.json({
      success: true,
      data: {
        pendingSettlements: result.rows,
        count: result.rows.length
      }
    });

  } catch (error) {
    console.error('Get pending settlements error:', error);
    res.status(500).json({
      error: 'Failed to fetch pending settlements',
      message: error.message
    });
  }
});

app.post('/settlements/process', async (req, res) => {
  try {
    const { deliveryIds, processedBy } = req.body;

    if (!deliveryIds || deliveryIds.length === 0 || !processedBy) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Delivery IDs and processed by are required'
      });
    }

    const settlements = [];

    for (const deliveryId of deliveryIds) {
      // Get delivery details with pricing
      const deliveryResult = await pool.query(`
        SELECT d.*, f.name as farmer_name, pr.base_price, pr.moisture_threshold, pr.moisture_deduction
        FROM deliveries d
        LEFT JOIN farmers f ON d.farmer_id = f.id
        LEFT JOIN pricing_rules pr ON pr.organization_id = f.organization_id AND pr.status = 'ACTIVE'
        WHERE d.id = $1
      `, [deliveryId]);

      if (deliveryResult.rows.length === 0) continue;

      const delivery = deliveryResult.rows[0];
      
      // Calculate settlement amount
      let finalAmount = delivery.gross_weight * delivery.base_price;
      
      // Apply moisture deduction
      if (delivery.average_moisture > delivery.moisture_threshold) {
        const moistureExcess = delivery.average_moisture - delivery.moisture_threshold;
        const deduction = moistureExcess * delivery.moisture_deduction;
        finalAmount -= deduction;
      }

      // Create settlement record
      const settlementResult = await pool.query(`
        INSERT INTO settlements (
          delivery_id, farmer_id, gross_weight, base_price, 
          moisture_deduction, final_amount, processed_by, settlement_date, status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id, delivery_id, final_amount, settlement_date, status
      `, [
        deliveryId, delivery.farmer_id, delivery.gross_weight, delivery.base_price,
        finalAmount - (delivery.gross_weight * delivery.base_price), finalAmount,
        processedBy, new Date().toISOString().split('T')[0], 'PROCESSED'
      ]);

      // Update delivery settlement status
      await pool.query(
        'UPDATE deliveries SET settlement_status = $1, settlement_id = $2 WHERE id = $3',
        ['PROCESSED', settlementResult.rows[0].id, deliveryId]
      );

      settlements.push(settlementResult.rows[0]);
    }

    res.json({
      success: true,
      message: `${settlements.length} settlements processed successfully`,
      data: {
        settlements: settlements,
        count: settlements.length
      }
    });

  } catch (error) {
    console.error('Process settlements error:', error);
    res.status(500).json({
      error: 'Failed to process settlements',
      message: error.message
    });
  }
});

// Admin Dashboard Stats
app.get('/dashboard/stats', async (req, res) => {
  try {
    const { organizationId } = req.query;

    if (!organizationId) {
      return res.status(400).json({
        error: 'Organization ID required'
      });
    }

    const [
      lorriesResult,
      farmersResult,
      deliveriesResult,
      pendingRequestsResult,
      pendingSettlementsResult
    ] = await Promise.all([
      pool.query('SELECT COUNT(*) as count FROM lorries WHERE organization_id = $1', [organizationId]),
      pool.query('SELECT COUNT(*) as count FROM farmers WHERE organization_id = $1', [organizationId]),
      pool.query('SELECT COUNT(*) as count, SUM(gross_weight) as total_weight FROM deliveries d LEFT JOIN farmers f ON d.farmer_id = f.id WHERE f.organization_id = $1', [organizationId]),
      pool.query('SELECT COUNT(*) as count FROM lorry_requests lr LEFT JOIN users u ON lr.field_manager_id = u.id WHERE u.organization_id = $1 AND lr.status = $2', [organizationId, 'PENDING']),
      pool.query('SELECT COUNT(*) as count FROM deliveries d LEFT JOIN farmers f ON d.farmer_id = f.id WHERE f.organization_id = $1 AND d.status = $2 AND d.settlement_status IS NULL', [organizationId, 'APPROVED'])
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          totalLorries: parseInt(lorriesResult.rows[0].count),
          totalFarmers: parseInt(farmersResult.rows[0].count),
          totalDeliveries: parseInt(deliveriesResult.rows[0].count),
          totalWeight: parseFloat(deliveriesResult.rows[0].total_weight || 0),
          pendingRequests: parseInt(pendingRequestsResult.rows[0].count),
          pendingSettlements: parseInt(pendingSettlementsResult.rows[0].count)
        }
      }
    });

  } catch (error) {
    console.error('Get admin dashboard stats error:', error);
    res.status(500).json({
      error: 'Failed to fetch admin dashboard stats',
      message: error.message
    });
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Farm Admin service error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.originalUrl} not found in farm-admin service`
  });
});

app.listen(PORT, () => {
  console.log(`🏢 FarmTally Farm Admin Service running on port ${PORT}`);
});

module.exports = app;