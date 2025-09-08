// scripts/seedTenant.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tenant = require('../src/models/tenant.model');

// Load environment variables
dotenv.config();

async function seedTenant() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');

    // Check if tenant already exists
    const existingTenant = await Tenant.findOne({ domain: 'default.accountx.com' });
    if (existingTenant) {
      console.log(`Tenant already exists: ${existingTenant.name} (${existingTenant._id})`);
      await mongoose.disconnect();
      process.exit(0);
    }

    // Create a default tenant
    const tenant = await Tenant.create({
      name: 'Default Tenant',
      domain: 'default.accountx.com',
      financialYearStart: new Date('2023-04-01'), // April 1st for Indian financial year
      currency: 'INR',
      decimalPrecision: 2
    });

    console.log(`Created tenant: ${tenant.name} (${tenant._id})`);
    
    await mongoose.disconnect();
    console.log('Tenant seeding complete!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding tenant:', err);
    process.exit(1);
  }
}

seedTenant();