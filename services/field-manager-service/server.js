const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 8088;

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
    message: 'FarmTally Field Manager Service',
    service: 'field-manager-service',
    version: '1.0.0',
    status: 'running',
    port: PORT,
    endpoints: {
      health: '/health',
      lorryRequests: '/lorry-requests',
      deliveries: '/deliveries',
      advancePayments: '/advance-payments',
      dashboardStats: '/dashboard/stats'
    },
    features: [
      'lorry-requests',
      'delivery-entry',
      'farmer-management',
      'advance-payments'
    ]
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'field-manager-service',
    timestamp: new Date().toISOString(),
    port: PORT,
    features: [
      'lorry-requests',
      'delivery-entry',
      'farmer-management',
      'advance-payments'
    ]
  });
});

// Lorry Request Management
app.post('/lorry-requests', async (req, res) => {
  try {
    const { requestedDate, location, estimatedQuantity, notes, fieldManagerId } = req.body;

    if (!requestedDate || !location || !fieldManagerId) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Requested date, location, and field manager ID are required'
      });
    }

    const result = await pool.query(
      `INSERT INTO lorry_requests (requested_date, location, estimated_quantity, notes, field_manager_id, status) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING id, requested_date, location, estimated_quantity, status, created_at`,
      [requestedDate, location, estimatedQuantity || 0, notes || '', fieldManagerId, 'PENDING']
    );

    res.status(201).json({
      success: true,
      message: 'Lorry request created successfully',
      data: {
        request: result.rows[0]
      }
    });

  } catch (error) {
    console.error('Create lorry request error:', error);
    res.status(500).json({
      error: 'Failed to create lorry request',
      message: error.message
    });
  }
});

app.get('/lorry-requests', async (req, res) => {
  try {
    const { fieldManagerId, status } = req.query;

    let query = 'SELECT * FROM lorry_requests';
    let params = [];
    let conditions = [];

    if (fieldManagerId) {
      conditions.push('field_manager_id = $' + (params.length + 1));
      params.push(fieldManagerId);
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
        requests: result.rows,
        count: result.rows.length
      }
    });

  } catch (error) {
    console.error('Get lorry requests error:', error);
    res.status(500).json({
      error: 'Failed to fetch lorry requests',
      message: error.message
    });
  }
});

// Delivery Entry Management
app.post('/deliveries', async (req, res) => {
  try {
    const { 
      farmerId, 
      lorryId, 
      fieldManagerId,
      bags, 
      qualityNotes,
      deliveryDate 
    } = req.body;

    if (!farmerId || !lorryId || !fieldManagerId || !bags || bags.length === 0) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Farmer ID, lorry ID, field manager ID, and bags are required'
      });
    }

    // Calculate totals
    const totalBags = bags.length;
    const grossWeight = bags.reduce((sum, bag) => sum + (bag.weight || 0), 0);
    const avgMoisture = bags.reduce((sum, bag) => sum + (bag.moistureContent || 0), 0) / totalBags;

    const result = await pool.query(
      `INSERT INTO deliveries (
        farmer_id, lorry_id, field_manager_id, delivery_date, 
        total_bags, gross_weight, average_moisture, quality_notes, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
      RETURNING id, farmer_id, lorry_id, delivery_date, total_bags, gross_weight, status, created_at`,
      [
        farmerId, lorryId, fieldManagerId, 
        deliveryDate || new Date().toISOString().split('T')[0],
        totalBags, grossWeight, avgMoisture, qualityNotes || '', 'PENDING'
      ]
    );

    const deliveryId = result.rows[0].id;

    // Insert individual bag records
    for (let i = 0; i < bags.length; i++) {
      const bag = bags[i];
      await pool.query(
        'INSERT INTO delivery_bags (delivery_id, bag_number, weight, moisture_content) VALUES ($1, $2, $3, $4)',
        [deliveryId, i + 1, bag.weight, bag.moistureContent]
      );
    }

    res.status(201).json({
      success: true,
      message: 'Delivery entry created successfully',
      data: {
        delivery: result.rows[0],
        bagsCount: totalBags,
        totalWeight: grossWeight
      }
    });

  } catch (error) {
    console.error('Create delivery error:', error);
    res.status(500).json({
      error: 'Failed to create delivery entry',
      message: error.message
    });
  }
});

app.get('/deliveries', async (req, res) => {
  try {
    const { fieldManagerId, status, farmerId, lorryId } = req.query;

    let query = `
      SELECT d.*, f.name as farmer_name, l.name as lorry_name 
      FROM deliveries d
      LEFT JOIN farmers f ON d.farmer_id = f.id
      LEFT JOIN lorries l ON d.lorry_id = l.id
    `;
    let params = [];
    let conditions = [];

    if (fieldManagerId) {
      conditions.push('d.field_manager_id = $' + (params.length + 1));
      params.push(fieldManagerId);
    }

    if (status) {
      conditions.push('d.status = $' + (params.length + 1));
      params.push(status);
    }

    if (farmerId) {
      conditions.push('d.farmer_id = $' + (params.length + 1));
      params.push(farmerId);
    }

    if (lorryId) {
      conditions.push('d.lorry_id = $' + (params.length + 1));
      params.push(lorryId);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY d.created_at DESC';

    const result = await pool.query(query, params);

    res.json({
      success: true,
      data: {
        deliveries: result.rows,
        count: result.rows.length
      }
    });

  } catch (error) {
    console.error('Get deliveries error:', error);
    res.status(500).json({
      error: 'Failed to fetch deliveries',
      message: error.message
    });
  }
});

// Advance Payment Management
app.post('/advance-payments', async (req, res) => {
  try {
    const { 
      farmerId, 
      amount, 
      paymentMethod, 
      notes,
      fieldManagerId 
    } = req.body;

    if (!farmerId || !amount || !fieldManagerId) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Farmer ID, amount, and field manager ID are required'
      });
    }

    const result = await pool.query(
      `INSERT INTO advance_payments (
        farmer_id, amount, payment_method, notes, field_manager_id, 
        payment_date, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7) 
      RETURNING id, farmer_id, amount, payment_method, payment_date, status, created_at`,
      [
        farmerId, amount, paymentMethod || 'CASH', notes || '', 
        fieldManagerId, new Date().toISOString().split('T')[0], 'PENDING'
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Advance payment recorded successfully',
      data: {
        payment: result.rows[0]
      }
    });

  } catch (error) {
    console.error('Create advance payment error:', error);
    res.status(500).json({
      error: 'Failed to record advance payment',
      message: error.message
    });
  }
});

app.get('/advance-payments', async (req, res) => {
  try {
    const { fieldManagerId, farmerId, status } = req.query;

    let query = `
      SELECT ap.*, f.name as farmer_name, f.phone as farmer_phone
      FROM advance_payments ap
      LEFT JOIN farmers f ON ap.farmer_id = f.id
    `;
    let params = [];
    let conditions = [];

    if (fieldManagerId) {
      conditions.push('ap.field_manager_id = $' + (params.length + 1));
      params.push(fieldManagerId);
    }

    if (farmerId) {
      conditions.push('ap.farmer_id = $' + (params.length + 1));
      params.push(farmerId);
    }

    if (status) {
      conditions.push('ap.status = $' + (params.length + 1));
      params.push(status);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY ap.created_at DESC';

    const result = await pool.query(query, params);

    res.json({
      success: true,
      data: {
        payments: result.rows,
        count: result.rows.length
      }
    });

  } catch (error) {
    console.error('Get advance payments error:', error);
    res.status(500).json({
      error: 'Failed to fetch advance payments',
      message: error.message
    });
  }
});

// Field Manager Dashboard Stats
app.get('/dashboard/stats', async (req, res) => {
  try {
    const { fieldManagerId } = req.query;

    if (!fieldManagerId) {
      return res.status(400).json({
        error: 'Field Manager ID required'
      });
    }

    const [
      lorryRequestsResult,
      deliveriesResult,
      paymentsResult,
      pendingApprovalsResult
    ] = await Promise.all([
      pool.query('SELECT COUNT(*) as count FROM lorry_requests WHERE field_manager_id = $1', [fieldManagerId]),
      pool.query('SELECT COUNT(*) as count, SUM(gross_weight) as total_weight FROM deliveries WHERE field_manager_id = $1', [fieldManagerId]),
      pool.query('SELECT COUNT(*) as count, SUM(amount) as total_amount FROM advance_payments WHERE field_manager_id = $1', [fieldManagerId]),
      pool.query('SELECT COUNT(*) as count FROM lorry_requests WHERE field_manager_id = $1 AND status = $2', [fieldManagerId, 'PENDING'])
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          totalLorryRequests: parseInt(lorryRequestsResult.rows[0].count),
          totalDeliveries: parseInt(deliveriesResult.rows[0].count),
          totalWeight: parseFloat(deliveriesResult.rows[0].total_weight || 0),
          totalAdvancePayments: parseInt(paymentsResult.rows[0].count),
          totalAdvanceAmount: parseFloat(paymentsResult.rows[0].total_amount || 0),
          pendingApprovals: parseInt(pendingApprovalsResult.rows[0].count)
        }
      }
    });

  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      error: 'Failed to fetch dashboard stats',
      message: error.message
    });
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Field Manager service error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.originalUrl} not found in field-manager service`
  });
});

app.listen(PORT, () => {
  console.log(`👨‍🌾 FarmTally Field Manager Service running on port ${PORT}`);
});

module.exports = app;