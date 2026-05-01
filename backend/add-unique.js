const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addUniqueConstraint() {
  try {
    console.log('Adding unique constraint to email field...');
    await prisma.$executeRawUnsafe('ALTER TABLE "User" ADD CONSTRAINT "User_email_key" UNIQUE ("email")');
    console.log('✅ Unique constraint added successfully!');
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('✅ Unique constraint already exists!');
    } else {
      console.error('❌ Error:', error.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

addUniqueConstraint();
