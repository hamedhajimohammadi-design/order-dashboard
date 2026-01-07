
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkVerificationPaths() {
  const users = await prisma.user.findMany({
    where: {
      verification_file: {
        not: null
      }
    },
    take: 5,
    select: {
      id: true,
      verification_file: true
    }
  });

  console.log("Checking verification_file paths in DB:");
  users.forEach(u => {
    console.log(`User #${u.id}: ${u.verification_file}`);
  });
}

checkVerificationPaths()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
