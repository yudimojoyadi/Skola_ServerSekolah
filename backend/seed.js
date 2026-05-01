const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function seed() {
  try {
    console.log('Connecting to database...');
    await prisma.$connect();
    console.log('Connected successfully!');

    const email = 'wahyudi.bukhari@gmail.com';
    const password = '12345678';
    const role = 'admin';

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: { email }
    });

    if (existingUser) {
      console.log('User already exists!');
      return;
    }

    // Insert user
    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role
      }
    });

    console.log('✅ User seeded successfully!');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log(`Role: ${role}`);
  } catch (error) {
    console.error('❌ Seeder error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    console.log('\nConnection closed.');
  }
}

seed();
