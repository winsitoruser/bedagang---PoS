// Script to create test users for all roles
const { Sequelize } = require('sequelize');
const config = require('../config/database');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    dialect: dbConfig.dialect,
    logging: false
  }
);

async function createAllRoleUsers() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Connected successfully\n');

    let bcrypt;
    try {
      bcrypt = require('bcryptjs');
    } catch (e) {
      bcrypt = require('bcrypt');
    }

    // Define users for different roles
    const users = [
      {
        name: 'Super Admin',
        email: 'superadmin@bedagang.com',
        password: 'admin123',
        role: 'super_admin',
        description: 'Full system access - can manage all tenants and modules'
      },
      {
        name: 'Admin User',
        email: 'admin@bedagang.com',
        password: 'admin123',
        role: 'ADMIN',
        description: 'Admin access - can manage tenant settings and users'
      },
      {
        name: 'Owner User',
        email: 'owner@bedagang.com',
        password: 'owner123',
        role: 'owner',
        description: 'Business owner - full access to business features'
      },
      {
        name: 'Manager User',
        email: 'manager@bedagang.com',
        password: 'manager123',
        role: 'manager',
        description: 'Manager - can manage inventory, staff, and reports'
      },
      {
        name: 'Cashier User',
        email: 'cashier@bedagang.com',
        password: 'cashier123',
        role: 'cashier',
        description: 'Cashier - can process transactions and view sales'
      },
      {
        name: 'Staff User',
        email: 'staff@bedagang.com',
        password: 'staff123',
        role: 'staff',
        description: 'Staff - limited access to basic features'
      }
    ];

    console.log('Creating users for all roles...\n');

    for (const userData of users) {
      // Check if user exists
      const [existing] = await sequelize.query(`
        SELECT id, email FROM users WHERE email = :email
      `, {
        replacements: { email: userData.email }
      });

      const hashedPassword = await bcrypt.hash(userData.password, 10);

      if (existing.length > 0) {
        // Update existing user
        await sequelize.query(`
          UPDATE users 
          SET name = :name,
              password = :password,
              role = :role,
              is_active = true
          WHERE email = :email
        `, {
          replacements: {
            name: userData.name,
            password: hashedPassword,
            role: userData.role,
            email: userData.email
          }
        });
        console.log(`✅ Updated: ${userData.name} (${userData.email})`);
      } else {
        // Create new user
        await sequelize.query(`
          INSERT INTO users (name, email, password, role, is_active)
          VALUES (:name, :email, :password, :role, true)
        `, {
          replacements: {
            name: userData.name,
            email: userData.email,
            password: hashedPassword,
            role: userData.role
          }
        });
        console.log(`✅ Created: ${userData.name} (${userData.email})`);
      }
    }

    console.log('\n🎉 All users created/updated successfully!\n');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('                    LOGIN CREDENTIALS                          ');
    console.log('═══════════════════════════════════════════════════════════════\n');

    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name.toUpperCase()}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Password: ${user.password}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Description: ${user.description}`);
      console.log('');
    });

    console.log('═══════════════════════════════════════════════════════════════');
    console.log('\n🌐 Login URL: http://localhost:3001/auth/login');
    console.log('\n📝 Note: All users have is_active = true and can login immediately');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

createAllRoleUsers();
