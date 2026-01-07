
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkPhone() {
  const phones = ['09173259096', '9173259096', '+989173259096', '00989173259096'];
  
  const users = await prisma.user.findMany({
    where: {
      phone_number: { in: phones }
    }
  });

  console.log(`Found ${users.length} users matching phone variations.`);
  users.forEach(u => console.log(u));
}

checkPhone()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
