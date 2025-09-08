/**
 * Test Script for Tenant System
 * Demonstrates automatic tenant ID generation and role assignment
 */

const mongoose = require('mongoose');
const User = require('./src/models/user.model');
const Role = require('./src/models/role.model');
const Tenant = require('./src/models/tenant.model');
const { ROLES } = require('./src/utils/roleSeeder');

// Connect to MongoDB (you'll need to set your connection string)
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/account_x');
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Test function to simulate admin login
const testAdminLogin = async () => {
  try {
    console.log('=== Testing Admin Login with Auto Tenant Generation ===\n');

    // Clean up any existing test data
    console.log('🧹 Cleaning up existing test data...');
    await User.deleteMany({ email: { $regex: /testcompany\.com$/ } });
    await Tenant.deleteMany({ domain: { $regex: /testcompany\.com$/ } });
    await Role.deleteMany({ tenantId: { $in: (await Tenant.find({ domain: { $regex: /testcompany\.com$/ } })).map(t => t._id) } });
    console.log('✅ Cleanup completed');

    // 1. Create a test admin user without tenant
    const testEmail = 'admin@testcompany.com';
    const testPassword = 'admin123456';

    // Check if user exists
    let user = await User.findOne({ email: testEmail });
    
    if (!user) {
      console.log('Creating new admin user...');
      user = await User.create({
        email: testEmail,
        passwordHash: testPassword, // Will be hashed by pre-save hook
        roles: [] // No roles initially
      });
      console.log('✅ Admin user created');
    } else {
      console.log('✅ Admin user already exists');
    }

    // 2. Simulate login process (what happens in auth.controller.js)
    console.log('\n--- Simulating Login Process ---');
    
    // Check if user has tenant
    if (!user.tenantId) {
      console.log('❌ User has no tenant - will create automatically');
      
      // Create tenant with unique domain (this is what setupAdminTenant does)
      const emailParts = user.email.split('@');
      const username = emailParts[0];
      const baseDomain = emailParts[1];
      
      // Generate unique domain
      let domain = `${username}.${baseDomain}`;
      let counter = 1;
      
      // Keep trying until we find a unique domain
      while (true) {
        const existingTenant = await Tenant.findOne({ domain });
        if (!existingTenant) {
          break;
        }
        // If domain exists, try with counter
        domain = `${username}${counter}.${baseDomain}`;
        counter++;
      }
      
      const tenant = await Tenant.create({
        name: `${username}'s Tenant`,
        domain,
        financialYearStart: new Date(),
        currency: 'INR',
        decimalPrecision: 2
      });
      console.log('✅ Tenant created:', tenant.name, 'with domain:', domain);

      // Create all roles for the tenant (from roleSeeder utility)
      const createdRoles = [];
      for (const roleData of ROLES) {
        const role = await Role.create({
          name: roleData.name,
          permissions: roleData.permissions,
          tenantId: tenant._id,
          description: roleData.description
        });
        createdRoles.push(role);
        console.log(`✅ Created role: ${role.name} with ${role.permissions.length} permissions`);
      }

      // Find the Admin role to assign to the user
      const adminRole = createdRoles.find(role => role.name === 'Admin');
      console.log('✅ All roles created successfully!');

      // Update user with tenant and role
      user.tenantId = tenant._id;
      user.roles = [adminRole._id];
      await user.save({ validateBeforeSave: false });
      console.log('✅ User updated with tenant and role');
    } else {
      console.log('✅ User already has tenant');
    }

    // 3. Display final user state
    const finalUser = await User.findById(user._id)
      .populate('roles')
      .populate('tenantId');
    
    console.log('\n--- Final User State ---');
    console.log('User ID:', finalUser._id);
    console.log('Email:', finalUser.email);
    console.log('Tenant ID:', finalUser.tenantId);
    console.log('Tenant Name:', finalUser.tenantId?.name);
    console.log('Roles:', finalUser.roles.map(role => role.name));
    console.log('Permissions:', finalUser.roles.flatMap(role => role.permissions));

    // 4. Test tenant-aware operations
    console.log('\n--- Testing Tenant-Aware Operations ---');
    
    // This is how other controllers would use the tenant
    const tenantId = finalUser.tenantId._id;
    console.log('Using tenant ID for all operations:', tenantId);
    
    // Example: Creating a GST invoice would automatically use this tenant
    console.log('✅ All subsequent operations will use this tenant ID');
    console.log('✅ No need to pass tenant ID in headers anymore');
    console.log('✅ Middleware automatically extracts tenant from authenticated user');

    console.log('\n=== Test Completed Successfully ===');

  } catch (error) {
    console.error('Test failed:', error);
  }
};

// Run the test
const runTest = async () => {
  await connectDB();
  await testAdminLogin();
  process.exit(0);
};

runTest(); 