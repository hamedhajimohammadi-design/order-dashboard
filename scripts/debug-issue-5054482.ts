
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function debugIssue() {
  const wpOrderId = 5054482;
  console.log(`🔍 Searching for Order with WP ID: ${wpOrderId}`);

  const order = await prisma.order.findUnique({
    where: { wp_order_id: wpOrderId },
    include: { user: true }
  });

  if (!order) {
    console.log("❌ Order not found in DB.");
    // Try to find if there is any order with this ID as string or number if BigInt fails?
    // Prisma handles BigInt, but let's be sure.
    return;
  }

  const user = order.user;
  console.log(`✅ Order Found. Linked to User #${user.id}`);
  console.log(`   Phone: ${user.phone_number}`);
  console.log(`   Verification File: ${user.verification_file}`);
  console.log(`   Metadata:`, JSON.stringify(user.metadata, null, 2));

  const wcId = (user.metadata as any)?.wc_id;
  console.log(`   WC ID from Metadata: ${wcId}`);

  if (user.verification_file) {
    let url = '';
    if (wcId) {
       url = `https://pgemshop.com/wp-content/uploads/mnsfpt_documents/${wcId}/${user.verification_file}`;
       console.log(`   👉 Constructed URL (New Logic): ${url}`);
    } else {
       url = `https://pgemshop.com/wp-content/uploads/mnsfpt_uploads/${user.verification_file}`;
       console.log(`   👉 Constructed URL (Legacy Logic): ${url}`);
    }
  } else {
    console.log("   ⚠️ No verification file for this user.");
  }

  // Check overall sync status
  const totalUsers = await prisma.user.count();
  const usersWithFile = await prisma.user.count({
    where: { verification_file: { not: null } }
  });
  
  // Users with file but NO wc_id
  const usersWithFileNoWcId = await prisma.user.findMany({
    where: {
      verification_file: { not: null },
      OR: [
        { metadata: { equals: {} } },
        { metadata: { equals: null } },
        // Prisma JSON filtering is tricky, let's fetch and filter in JS for accuracy or use raw query
        // For now, let's just fetch a sample
      ]
    },
    select: { id: true, metadata: true }
  });

  const missingWcIdCount = usersWithFileNoWcId.filter(u => !(u.metadata as any)?.wc_id).length;

  console.log("\n--- Global Stats ---");
  console.log(`Total Users: ${totalUsers}`);
  console.log(`Users with Verification File: ${usersWithFile}`);
  console.log(`Users with File but MISSING wc_id: ${missingWcIdCount}`);
  
  if (missingWcIdCount > 0) {
      console.log("⚠️ Some users have files but no WC ID. The sync script might need to be re-run or failed for them.");
  }
}

debugIssue()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
