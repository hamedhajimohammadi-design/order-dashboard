
import 'dotenv/config'; // Load .env file
import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

async function checkImages() {
  console.log("🔍 Checking verification images for 10 verified users...");

  const users = await prisma.user.findMany({
    where: {
      is_verified: true,
      verification_file: { not: null },
    },
    take: 10,
    orderBy: { last_order_date: 'desc' } // Check recent active users first
  });

  if (users.length === 0) {
    console.log("⚠️ No verified users with files found.");
    return;
  }

  console.log(`Found ${users.length} users. Testing URLs...`);

  for (const user of users) {
    const wcId = (user.metadata as any)?.wc_id;
    let url = '';

    if (wcId) {
      url = `https://pgemshop.com/wp-content/uploads/mnsfpt_documents/${wcId}/${user.verification_file}`;
    } else {
      url = `https://pgemshop.com/wp-content/uploads/mnsfpt_uploads/${user.verification_file}`;
    }

    try {
      // Mimic the Proxy behavior
      const response = await axios.head(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Referer': '' 
        },
        validateStatus: () => true // Don't throw on 403/404
      });

      const status = response.status;
      const icon = status === 200 ? '✅' : '❌';
      
      console.log(`${icon} User #${user.id} (WC_ID: ${wcId || 'N/A'})`);
      console.log(`   File: ${user.verification_file}`);
      console.log(`   URL: ${url}`);
      console.log(`   Status: ${status} ${response.statusText}`);
      
      if (status !== 200) {
          // Try the other path if failed, just to see
          if (wcId) {
              const altUrl = `https://pgemshop.com/wp-content/uploads/mnsfpt_uploads/${user.verification_file}`;
              const altRes = await axios.head(altUrl, { headers: { 'User-Agent': 'Mozilla/5.0', 'Referer': '' }, validateStatus: () => true });
              if (altRes.status === 200) {
                  console.log(`   💡 Found at legacy path instead: ${altUrl}`);
              }
          }
      }
      console.log('---');

    } catch (error: any) {
      console.log(`❌ Error checking ${url}: ${error.message}`);
    }
  }
}

checkImages()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
