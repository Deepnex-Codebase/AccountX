/**
 * Clear Database and Test Tenant System
 * This script clears the database and tests the tenant system
 */

const mongoose = require('mongoose');
const User = require('./src/models/user.model');
const Role = require('./src/models/role.model');
const Tenant = require('./src/models/tenant.model');
const { ROLES } = require('./src/utils/roleSeeder');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/account_x');
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Clear all data
const clearDatabase = async () => {
  try {
    console.log('🗑️  Clearing database...');
    
    // Clear all collections
    await User.deleteMany({});
    await Role.deleteMany({});
    await Tenant.deleteMany({});
    
    console.log('✅ Database cleared successfully');
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    throw error;
  }
};

// Test the tenant system
const testTenantSystem = async () => {
  try {
    console.log('\n🧪 Testing Tenant System...\n');

    // Test 1: Create first admin user
    console.log('--- Test 1: First Admin User ---');
    const user1 = await User.create({
      email: 'admin1@testcompany.com',
      passwordHash: 'admin123456',
      roles: []
    });
    console.log('✅ User 1 created:', user1.email);

    // Simulate login for user1
    const emailParts1 = user1.email.split('@');
    const username1 = emailParts1[0];
    const baseDomain1 = emailParts1[1];
    
    // Generate unique domain
    let domain1 = `${username1}.${baseDomain1}`;
    let counter1 = 1;
    
    while (true) {
      const existingTenant1 = await Tenant.findOne({ domain: domain1 });
      if (!existingTenant1) {
        break;
      }
      domain1 = `${username1}${counter1}.${baseDomain1}`;
      counter1++;
    }
    
    const tenant1 = await Tenant.create({
      name: `${username1}'s Tenant`,
      domain: domain1,
      financialYearStart: new Date(),
      currency: 'INR',
      decimalPrecision: 2
    });
    console.log('✅ Tenant 1 created:', tenant1.name, 'with domain:', domain1);

    // Test 2: Create second admin user with same email domain
    console.log('\n--- Test 2: Second Admin User (Same Domain) ---');
    const user2 = await User.create({
      email: 'admin2@testcompany.com',
      passwordHash: 'admin123456',
      roles: []
    });
    console.log('✅ User 2 created:', user2.email);

    // Simulate login for user2
    const emailParts2 = user2.email.split('@');
    const username2 = emailParts2[0];
    const baseDomain2 = emailParts2[1];
    
    // Generate unique domain
    let domain2 = `${username2}.${baseDomain2}`;
    let counter2 = 1;
    
    while (true) {
      const existingTenant2 = await Tenant.findOne({ domain: domain2 });
      if (!existingTenant2) {
        break;
      }
      domain2 = `${username2}${counter2}.${baseDomain2}`;
      counter2++;
    }
    
    const tenant2 = await Tenant.create({
      name: `${username2}'s Tenant`,
      domain: domain2,
      financialYearStart: new Date(),
      currency: 'INR',
      decimalPrecision: 2
    });
    console.log('✅ Tenant 2 created:', tenant2.name, 'with domain:', domain2);

    // Test 3: Create third admin user with same username but different domain
    console.log('\n--- Test 3: Third Admin User (Same Username, Different Domain) ---');
    const user3 = await User.create({
      email: 'admin1@differentcompany.com',
      passwordHash: 'admin123456',
      roles: []
    });
    console.log('✅ User 3 created:', user3.email);

    // Simulate login for user3
    const emailParts3 = user3.email.split('@');
    const username3 = emailParts3[0];
    const baseDomain3 = emailParts3[1];
    
    // Generate unique domain
    let domain3 = `${username3}.${baseDomain3}`;
    let counter3 = 1;
    
    while (true) {
      const existingTenant3 = await Tenant.findOne({ domain: domain3 });
      if (!existingTenant3) {
        break;
      }
      domain3 = `${username3}${counter3}.${baseDomain3}`;
      counter3++;
    }
    
    const tenant3 = await Tenant.create({
      name: `${username3}'s Tenant`,
      domain: domain3,
      financialYearStart: new Date(),
      currency: 'INR',
      decimalPrecision: 2
    });
    console.log('✅ Tenant 3 created:', tenant3.name, 'with domain:', domain3);

    // Display all tenants
    console.log('\n--- All Tenants Created ---');
    const allTenants = await Tenant.find().sort({ createdAt: 1 });
    allTenants.forEach((tenant, index) => {
      console.log(`${index + 1}. ${tenant.name} - Domain: ${tenant.domain}`);
    });

    console.log('\n✅ All tests completed successfully!');
    console.log('✅ No duplicate domain errors occurred!');

  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  }
};

// Run the script
const runScript = async () => {
  try {
    await connectDB();
    await clearDatabase();
    await testTenantSystem();
    console.log('\n🎉 Script completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Script failed:', error);
    process.exit(1);
  }
};

runScript(); 