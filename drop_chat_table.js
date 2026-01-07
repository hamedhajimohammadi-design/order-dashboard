require('dotenv').config(); // Load .env file
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Dropping chat tables...');
  try {
    // Check if we can connect
    await prisma.$connect();
    
    // Check if table exists (optional, but good for debugging)
    const count = await prisma.$queryRaw`SELECT count(*) FROM information_schema.tables WHERE table_name = 'chat_sessions'`;
    console.log('Rows before drop check:', count);

    await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "chat_messages" CASCADE;`);
    await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "chat_sessions" CASCADE;`);
    console.log('Dropped chat tables');
  } catch (e) {
    if (e.code === 'P2010') {
        console.log('Table might not exist yet.');
    } else {
        console.error('Error dropping tables:', e);
        process.exit(1);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main();
