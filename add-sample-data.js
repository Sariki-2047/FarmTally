const { Client } = require('pg');

async function addSampleData() {
  console.log('📊 Adding Sample Data to FarmTally');
  console.log('==================================\n');

  const client = new Client({
    connectionString: process.env.DATABASE_URL || "postgresql://postgres:nf5gFYQ21VF3kMOJ@db.qvxcbdglyvzohzdefnet.supabase.co:5432/postgres"
  });

  try {
    await client.connect();
    console.log('✅ Connected to Supabase database\n');

    // Get existing delivery IDs
    const deliveriesResult = await client.query('SELECT id FROM deliveries LIMIT 2');
    const deliveryIds = deliveriesResult.rows.map(row => row.id);
    
    if (deliveryIds.length === 0) {
      console.log('⚠️  No deliveries found, cannot add bags');
      return;
    }

    console.log(`📦 Found ${deliveryIds.length} deliveries to add bags to`);

    // Add sample bags for first delivery
    if (deliveryIds[0]) {
      console.log('\n🔧 Adding bags for first delivery...');
      const bagInserts = [];
      for (let i = 1; i <= 10; i++) {
        const weight = (49 + Math.random() * 2).toFixed(1); // Random weight between 49-51 kg
        bagInserts.push(`('${deliveryIds[0]}', ${weight}, ${i})`);
      }
      
      await client.query(`
        INSERT INTO bags (delivery_id, weight, bag_number) VALUES
        ${bagInserts.join(', ')}
      `);
      console.log('✅ Added 10 bags to first delivery');
    }

    // Add sample bags for second delivery if it exists
    if (deliveryIds[1]) {
      console.log('\n🔧 Adding bags for second delivery...');
      const bagInserts = [];
      for (let i = 1; i <= 8; i++) {
        const weight = (48 + Math.random() * 3).toFixed(1); // Random weight between 48-51 kg
        bagInserts.push(`('${deliveryIds[1]}', ${weight}, ${i})`);
      }
      
      await client.query(`
        INSERT INTO bags (delivery_id, weight, bag_number) VALUES
        ${bagInserts.join(', ')}
      `);
      console.log('✅ Added 8 bags to second delivery');
    }

    // Get farmer and user IDs for payments
    const farmersResult = await client.query('SELECT id FROM farmers LIMIT 3');
    const usersResult = await client.query('SELECT id FROM users WHERE role = \'FARM_ADMIN\' LIMIT 1');
    const orgResult = await client.query('SELECT id FROM organizations LIMIT 1');

    if (farmersResult.rows.length > 0 && usersResult.rows.length > 0 && orgResult.rows.length > 0) {
      const farmerId = farmersResult.rows[0].id;
      const adminId = usersResult.rows[0].id;
      const orgId = orgResult.rows[0].id;

      console.log('\n💰 Adding sample payments...');
      
      // Add advance payment
      await client.query(`
        INSERT INTO payments (farmer_id, organization_id, processed_by_id, amount, type, status, reference, notes, paid_at)
        VALUES ($1, $2, $3, 500.00, 'ADVANCE', 'COMPLETED', 'ADV-001-2024', 'Advance payment for upcoming delivery', NOW() - INTERVAL '5 days')
      `, [farmerId, orgId, adminId]);

      // Add settlement payment
      if (deliveryIds[0]) {
        await client.query(`
          INSERT INTO payments (delivery_id, farmer_id, organization_id, processed_by_id, amount, type, status, reference, notes, paid_at)
          VALUES ($1, $2, $3, $4, 1250.75, 'SETTLEMENT', 'COMPLETED', 'SET-001-2024', 'Final settlement for delivery', NOW() - INTERVAL '2 days')
        `, [deliveryIds[0], farmerId, orgId, adminId]);
      }

      // Add pending payment
      if (farmersResult.rows[1]) {
        await client.query(`
          INSERT INTO payments (farmer_id, organization_id, processed_by_id, amount, type, status, reference, notes)
          VALUES ($1, $2, $3, 300.00, 'ADVANCE', 'PENDING', 'ADV-002-2024', 'Pending advance payment')
        `, [farmersResult.rows[1].id, orgId, adminId]);
      }

      console.log('✅ Added 3 sample payments');
    }

    // Final verification
    console.log('\n📊 Final Data Counts:');
    const tables = ['organizations', 'users', 'farmers', 'lorries', 'deliveries', 'bags', 'payments'];
    
    for (const table of tables) {
      try {
        const countResult = await client.query(`SELECT COUNT(*) FROM ${table}`);
        const count = countResult.rows[0].count;
        console.log(`   ${table}: ${count} records`);
      } catch (err) {
        console.log(`   ${table}: Error - ${err.message}`);
      }
    }

    console.log('\n🎉 Sample data added successfully!');
    console.log('\n🔗 Your FarmTally system now has:');
    console.log('   ✅ Complete database schema');
    console.log('   ✅ Sample organizations, users, and farmers');
    console.log('   ✅ Sample lorries and deliveries');
    console.log('   ✅ Sample bags and payments');
    console.log('   ✅ Built Flutter web application');
    
    console.log('\n🚀 Ready for deployment!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

addSampleData();