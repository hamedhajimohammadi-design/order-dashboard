import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

// BigInt serialization helper
function toJSON(data: any): string {
    return JSON.stringify(data, (_, v) => typeof v === 'bigint' ? v.toString() : v);
}

async function main() {
  try {
    const orders = await prisma.order.findMany({
      take: 50,
      orderBy: { created_at: 'desc' },
    });
    const userIds = [...new Set(orders.map(o => o.user_id))];
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
    });
    const exportData = { users, orders };
    
    // Write to file instead of console.log
    const outputPath = path.join(process.cwd(), 'exported_data.json');
    fs.writeFileSync(outputPath, toJSON(exportData));
    console.log(`Data exported to ${outputPath}`);
    
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}
main();
